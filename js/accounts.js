/* ============================================================
     ApkaGullak — Accounts Module
   ============================================================ */

const Accounts = (() => {

    /* ── Get full account details with customer info ── */
    function getAccountDetails(accountId) {
        const account  = DB.accounts.byId(accountId);
        if (!account) return null;
        const customer = DB.customers.byId(account.customerId);
        return { ...account, customer };
    }

    /* ── Get account by number with customer info ── */
    function getAccountByNumber(number) {
        const account = DB.accounts.byNumber(String(number));
        if (!account) return null;
        const customer = DB.customers.byId(account.customerId);
        return { ...account, customer };
    }

    /* ── Get current balance ── */
    function getBalance(accountId) {
        const account = DB.accounts.byId(accountId);
        return account ? account.balance : 0;
    }

    /* ── Check if account exists and is active ── */
    function validateAccount(accountNumber) {
        const account = DB.accounts.byNumber(String(accountNumber));
        if (!account) return { valid: false, error: 'Account not found.' };
        if (account.frozen) return { valid: false, error: 'This account is frozen.' };
        return { valid: true, account };
    }

    /* ── Get all accounts for admin ── */
    function getAllAccountsWithCustomers() {
        return DB.accounts.all().map(acc => ({
            ...acc,
            customer: DB.customers.byId(acc.customerId)
        }));
    }

    /* ── Update account status ── */
    function freezeAccount(accountId, reason = '') {
        return DB.accounts.update(accountId, {
            frozen: true,
            frozenReason: reason,
            frozenAt: new Date().toISOString()
        });
    }

    function unfreezeAccount(accountId) {
        return DB.accounts.update(accountId, {
            frozen: false,
            frozenReason: null,
            frozenAt: null
        });
    }

    /* ── Account summary card data ── */
    function getAccountSummary(accountId) {
        const account = DB.accounts.byId(accountId);
        if (!account) return null;

        const txns = DB.transactions.byAccountId(accountId);
        const now = Date.now();
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

        const thisMonthTxns = txns.filter(t => new Date(t.timestamp).getTime() >= thirtyDaysAgo);
        const totalCredits  = thisMonthTxns.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
        const totalDebits   = thisMonthTxns.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

        // Daily withdrawal used today
        const midnight = new Date(); midnight.setHours(0,0,0,0);
        const todayDebits = DB.transactions.sumByType(accountId, 'debit', midnight.getTime());

        return {
            ...account,
            monthlyCredits:  totalCredits,
            monthlyDebits:   totalDebits,
            todayDebits,
            transactionCount: txns.length,
        };
    }

    /* ── Spending breakdown by description category (for chart) ── */
    function getSpendingChart(accountId, days = 30) {
        const since = Date.now() - days * 24 * 60 * 60 * 1000;
        const txns = DB.transactions.byAccountId(accountId)
            .filter(t => t.type === 'debit' && new Date(t.timestamp).getTime() >= since);

        // Group by rough category based on description keywords
        const categories = {
            'Shopping': ['amazon', 'flipkart', 'myntra', 'purchase', 'grocery', 'supermarket', 'mall'],
            'Utilities': ['electricity', 'bescom', 'water', 'gas', 'bill', 'recharge'],
            'Entertainment': ['netflix', 'amazon prime', 'spotify', 'hotstar', 'swiggy', 'zomato'],
            'ATM/Cash': ['atm', 'cash', 'withdrawal'],
            'Transfer': ['transfer', 'neft', 'imps', 'upi'],
            'Other': []
        };

        const totals = {};
        Object.keys(categories).forEach(k => totals[k] = 0);

        txns.forEach(t => {
            const desc = t.description.toLowerCase();
            let matched = false;
            for (const [cat, keywords] of Object.entries(categories)) {
                if (cat === 'Other') continue;
                if (keywords.some(k => desc.includes(k))) {
                    totals[cat] += t.amount;
                    matched = true;
                    break;
                }
            }
            if (!matched) totals['Other'] += t.amount;
        });

        return Object.entries(totals)
            .filter(([, v]) => v > 0)
            .map(([label, value]) => ({ label, value }));
    }

    /* ── Balance trend for chart (last 7 transactions) ── */
    function getBalanceTrend(accountId) {
        const txns = DB.transactions.byAccountId(accountId).slice(0, 10).reverse();
        return txns.map(t => ({
            label: Utils.formatDate(t.timestamp),
            balance: t.balance
        }));
    }

    return {
        getAccountDetails,
        getAccountByNumber,
        getBalance,
        validateAccount,
        getAllAccountsWithCustomers,
        freezeAccount,
        unfreezeAccount,
        getAccountSummary,
        getSpendingChart,
        getBalanceTrend,
    };
})();
