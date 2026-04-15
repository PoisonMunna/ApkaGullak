/* ============================================================
     ApkaGullak — Fraud Detection Engine
   ============================================================ */

const FraudDetection = (() => {

    const RULES = {
        LARGE_TXN_THRESHOLD: 75000,       // Flag if single txn > ₹75,000
        RAPID_TXN_WINDOW_MS: 5 * 60000,   // 5-minute window
        RAPID_TXN_COUNT: 3,               // Flag if ≥3 txns in 5 min
        DAILY_DEBIT_CAP: 100000,          // Flag if daily debits > ₹1L
        MIN_BALANCE_SAVINGS: 500,         // Min balance for savings
        DAILY_WITHDRAWAL_LIMIT: 50000,    // ATM / withdrawal daily limit
    };

    /**
     * Analyse a proposed transaction BEFORE it is committed.
     * Returns { allowed, warning, shouldFlag }
     */
    function analyseTransaction(accountId, type, amount, accountType) {
        const result = { allowed: true, warning: null, shouldFlag: false };

        // 1. Large transaction check
        if (amount > RULES.LARGE_TXN_THRESHOLD) {
            result.shouldFlag = true;
            result.warning = `⚠ Large transaction detected: ${Utils.formatCurrency(amount)}. This will be flagged for review.`;
        }

        // 2. Rapid transaction check
        const recentCount = DB.transactions.countRecent(accountId, RULES.RAPID_TXN_WINDOW_MS);
        if (recentCount >= RULES.RAPID_TXN_COUNT) {
            result.shouldFlag = true;
            result.warning = (result.warning ? result.warning + ' ' : '') +
                `⚠ Rapid transactions detected (${recentCount} txns in 5 min).`;
        }

        // 3. Daily debit cap
        if (type === 'debit') {
            const midnight = new Date(); midnight.setHours(0,0,0,0);
            const todayDebits = DB.transactions.sumByType(accountId, 'debit', midnight.getTime());
            if (todayDebits + amount > RULES.DAILY_DEBIT_CAP) {
                result.shouldFlag = true;
                result.warning = (result.warning ? result.warning + ' ' : '') +
                    `⚠ Total daily debits will exceed ${Utils.formatCurrency(RULES.DAILY_DEBIT_CAP)}.`;
            }
        }

        return result;
    }

    /**
     * Check whether a withdrawal is allowed given daily limits.
     * Returns { allowed, reason }
     */
    function checkWithdrawalLimit(accountId, amount) {
        const midnight = new Date(); midnight.setHours(0,0,0,0);
        const todayWithdrawals = DB.transactions.sumByType(accountId, 'debit', midnight.getTime());
        if (todayWithdrawals + amount > RULES.DAILY_WITHDRAWAL_LIMIT) {
            const remaining = Math.max(0, RULES.DAILY_WITHDRAWAL_LIMIT - todayWithdrawals);
            return {
                allowed: false,
                reason: `Daily withdrawal limit of ${Utils.formatCurrency(RULES.DAILY_WITHDRAWAL_LIMIT)} exceeded. Remaining: ${Utils.formatCurrency(remaining)}.`
            };
        }
        return { allowed: true };
    }

    /**
     * Check minimum balance requirement.
     */
    function checkMinBalance(account, amount) {
        if (account.type === 'Savings') {
            const afterBalance = account.balance - amount;
            if (afterBalance < RULES.MIN_BALANCE_SAVINGS) {
                return {
                    allowed: false,
                    reason: `Savings accounts must maintain a minimum balance of ${Utils.formatCurrency(RULES.MIN_BALANCE_SAVINGS)}.`
                };
            }
        }
        return { allowed: true };
    }

    /**
     * Get all flagged transactions across all accounts.
     */
    function getAllFlaggedTransactions() {
        return DB.transactions.all().filter(t => t.flagged)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Auto-freeze account after too many failed PINs (handled by DB layer).
     */
    function handleFailedPIN(accountNumber) {
        const entry = DB.failedPins.increment(accountNumber);
        if (entry.count >= 3) {
            // Freeze the account
            const acc = DB.accounts.byNumber(accountNumber);
            if (acc) {
                DB.accounts.update(acc.id, { frozen: true, frozenReason: 'Too many failed PIN attempts', frozenAt: new Date().toISOString() });
            }
            return { locked: true, message: 'Account locked due to 3 failed PIN attempts. Please contact support.' };
        }
        return { locked: false, attemptsLeft: 3 - entry.count };
    }

    /**
     * Get fraud summary for admin dashboard.
     */
    function getFraudSummary() {
        const flagged = getAllFlaggedTransactions();
        const frozenAccounts = DB.accounts.all().filter(a => a.frozen);
        return { flaggedCount: flagged.length, frozenCount: frozenAccounts.length, flaggedTxns: flagged.slice(0, 10) };
    }

    return {
        RULES,
        analyseTransaction,
        checkWithdrawalLimit,
        checkMinBalance,
        handleFailedPIN,
        getAllFlaggedTransactions,
        getFraudSummary,
    };
})();
