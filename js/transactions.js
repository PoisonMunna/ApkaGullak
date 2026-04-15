/* ============================================================
     ApkaGullak — Transactions Module
   ============================================================ */

const Transactions = (() => {

    /* ── DEPOSIT ── */
    function deposit(accountId, amount, description = 'Cash Deposit', remarks = '') {
        const account = DB.accounts.byId(accountId);
        if (!account) return { success: false, error: 'Account not found.' };
        if (account.frozen) return { success: false, error: 'Account is frozen. Contact support.' };

        const amt = Number(amount);
        if (!Utils.validateAmount(amt, 1, 1000000)) {
            return { success: false, error: 'Invalid amount. Must be between ₹1 and ₹10,00,000.' };
        }

        // Fraud analysis (informational for deposits)
        const fraud = FraudDetection.analyseTransaction(accountId, 'credit', amt);

        const newBalance = Math.round((account.balance + amt) * 100) / 100;
        DB.accounts.updateBalance(accountId, newBalance);

        const txn = DB.transactions.create({
            id: Utils.generateId(),
            txnId: Utils.generateTransactionId(),
            accountId,
            type: 'credit',
            amount: amt,
            balance: newBalance,
            description,
            remarks,
            timestamp: new Date().toISOString(),
            flagged: fraud.shouldFlag,
            linkedAccountId: null,
        });

        return { success: true, transaction: txn, newBalance, warning: fraud.warning };
    }

    /* ── WITHDRAWAL ── */
    function withdraw(accountId, amount, pin, description = 'Cash Withdrawal', remarks = '') {
        // 1. Load account & customer
        const account = DB.accounts.byId(accountId);
        if (!account) return { success: false, error: 'Account not found.' };
        if (account.frozen) return { success: false, error: 'Account is frozen. Contact support.' };

        const customer = DB.customers.byId(account.customerId);
        if (!customer) return { success: false, error: 'Customer not found.' };

        // 2. PIN verification
        if (customer.pin !== String(pin).trim()) {
            const failResult = FraudDetection.handleFailedPIN(account.accountNumber);
            if (failResult.locked) return { success: false, error: failResult.message };
            return { success: false, error: `Incorrect PIN. ${failResult.attemptsLeft} attempt(s) remaining.` };
        }
        DB.failedPins.reset(account.accountNumber);

        const amt = Number(amount);
        if (!Utils.validateAmount(amt, 1, 500000)) {
            return { success: false, error: 'Invalid amount. Must be between ₹1 and ₹5,00,000.' };
        }

        // 3. Balance check
        if (account.balance < amt) {
            return { success: false, error: 'Insufficient balance.' };
        }

        // 4. Minimum balance check
        const minBal = FraudDetection.checkMinBalance(account, amt);
        if (!minBal.allowed) return { success: false, error: minBal.reason };

        // 5. Daily withdrawal limit
        const limitCheck = FraudDetection.checkWithdrawalLimit(accountId, amt);
        if (!limitCheck.allowed) return { success: false, error: limitCheck.reason };

        // 6. Fraud analysis
        const fraud = FraudDetection.analyseTransaction(accountId, 'debit', amt);

        const newBalance = Math.round((account.balance - amt) * 100) / 100;
        DB.accounts.updateBalance(accountId, newBalance);

        const txn = DB.transactions.create({
            id: Utils.generateId(),
            txnId: Utils.generateTransactionId(),
            accountId,
            type: 'debit',
            amount: amt,
            balance: newBalance,
            description,
            remarks,
            timestamp: new Date().toISOString(),
            flagged: fraud.shouldFlag,
            linkedAccountId: null,
        });

        return { success: true, transaction: txn, newBalance, warning: fraud.warning };
    }

    /* ── FUND TRANSFER ── */
    function transfer(fromAccountId, toAccountNumber, amount, pin, remarks = '') {
        // 1. Source account
        const fromAccount = DB.accounts.byId(fromAccountId);
        if (!fromAccount) return { success: false, error: 'Source account not found.' };
        if (fromAccount.frozen) return { success: false, error: 'Source account is frozen.' };

        // 2. PIN
        const customer = DB.customers.byId(fromAccount.customerId);
        if (customer.pin !== String(pin).trim()) {
            const failResult = FraudDetection.handleFailedPIN(fromAccount.accountNumber);
            if (failResult.locked) return { success: false, error: failResult.message };
            return { success: false, error: `Incorrect PIN. ${failResult.attemptsLeft} attempt(s) remaining.` };
        }
        DB.failedPins.reset(fromAccount.accountNumber);

        // 3. Destination account
        const toAccount = DB.accounts.byNumber(String(toAccountNumber));
        if (!toAccount) return { success: false, error: 'Destination account not found.' };
        if (toAccount.id === fromAccountId) return { success: false, error: 'Cannot transfer to same account.' };
        if (toAccount.frozen) return { success: false, error: 'Destination account is frozen.' };

        const amt = Number(amount);
        if (!Utils.validateAmount(amt, 1, 500000)) {
            return { success: false, error: 'Invalid amount. Must be between ₹1 and ₹5,00,000.' };
        }

        // 4. Balance check
        if (fromAccount.balance < amt) return { success: false, error: 'Insufficient balance.' };

        // 5. Min balance
        const minBal = FraudDetection.checkMinBalance(fromAccount, amt);
        if (!minBal.allowed) return { success: false, error: minBal.reason };

        // 6. Fraud analysis
        const fraud = FraudDetection.analyseTransaction(fromAccountId, 'debit', amt);

        // 7. Atomic update — debit source, credit destination
        const toCustomer   = DB.customers.byId(toAccount.customerId);
        const newFromBal   = Math.round((fromAccount.balance - amt) * 100) / 100;
        const newToBal     = Math.round((toAccount.balance + amt) * 100) / 100;
        const timestamp    = new Date().toISOString();
        const txnId        = Utils.generateTransactionId();

        DB.accounts.updateBalance(fromAccountId, newFromBal);
        DB.accounts.updateBalance(toAccount.id, newToBal);

        const debitTxn = DB.transactions.create({
            id: Utils.generateId(), txnId,
            accountId: fromAccountId,
            type: 'debit', amount: amt, balance: newFromBal,
            description: `Transfer to ${toCustomer?.name || toAccountNumber}`,
            remarks, timestamp,
            flagged: fraud.shouldFlag,
            linkedAccountId: toAccount.id,
        });

        DB.transactions.create({
            id: Utils.generateId(), txnId,
            accountId: toAccount.id,
            type: 'credit', amount: amt, balance: newToBal,
            description: `Transfer from ${customer.name} (${fromAccount.accountNumber})`,
            remarks, timestamp,
            flagged: false,
            linkedAccountId: fromAccountId,
        });

        return {
            success: true,
            transaction: debitTxn,
            newBalance: newFromBal,
            toCustomerName: toCustomer?.name,
            warning: fraud.warning
        };
    }

    /* ── GET TRANSACTIONS ─ filtered ── */
    function getFiltered(accountId, { type = 'all', fromDate = null, toDate = null, search = '', page = 1, perPage = 10 } = {}) {
        let txns = DB.transactions.byAccountId(accountId);

        if (type !== 'all') txns = txns.filter(t => t.type === type);
        if (fromDate) txns = txns.filter(t => new Date(t.timestamp) >= new Date(fromDate));
        if (toDate) {
            const to = new Date(toDate); to.setHours(23, 59, 59, 999);
            txns = txns.filter(t => new Date(t.timestamp) <= to);
        }
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            txns = txns.filter(t =>
                t.description.toLowerCase().includes(q) ||
                t.txnId?.toLowerCase().includes(q) ||
                String(t.amount).includes(q)
            );
        }

        const total = txns.length;
        const totalPages = Math.ceil(total / perPage);
        const items = txns.slice((page - 1) * perPage, page * perPage);

        return { items, total, totalPages, page, perPage };
    }

    /* ── EMI Payment ── */
    function payEMI(accountId, loanId, pin) {
        const loan = DB.loans.byId(loanId);
        if (!loan || loan.status !== 'active') return { success: false, error: 'No active loan found.' };
        if (loan.paidMonths >= loan.tenureMonths) return { success: false, error: 'Loan is already fully paid.' };

        const account = DB.accounts.byId(accountId);
        if (account.balance < loan.emi) return { success: false, error: `Insufficient balance. EMI is ${Utils.formatCurrency(loan.emi)}.` };

        const customer = DB.customers.byId(account.customerId);
        if (customer.pin !== String(pin).trim()) return { success: false, error: 'Incorrect PIN.' };

        const newBalance  = Math.round((account.balance - loan.emi) * 100) / 100;
        const newPaid     = loan.paidMonths + 1;
        const newTotalPaid = Math.round((loan.totalPaid + loan.emi) * 100) / 100;
        const loanStatus  = newPaid >= loan.tenureMonths ? 'closed' : 'active';

        DB.accounts.updateBalance(accountId, newBalance);
        DB.loans.update(loanId, { paidMonths: newPaid, totalPaid: newTotalPaid, status: loanStatus });

        const txn = DB.transactions.create({
            id: Utils.generateId(), txnId: Utils.generateTransactionId(),
            accountId,
            type: 'debit', amount: loan.emi, balance: newBalance,
            description: `Loan EMI Payment — ${loan.type} Loan (${newPaid}/${loan.tenureMonths})`,
            remarks: '', timestamp: new Date().toISOString(),
            flagged: false, linkedAccountId: null,
        });

        return { success: true, transaction: txn, newBalance, loanStatus };
    }

    /* ── Export transactions to CSV ── */
    function exportToCSV(accountId) {
        const txns = DB.transactions.byAccountId(accountId);
        const rows = txns.map(t => ({
            'Transaction ID': t.txnId || t.id,
            'Date': Utils.formatDateTime(t.timestamp),
            'Type': t.type.toUpperCase(),
            'Description': t.description,
            'Amount (₹)': t.amount.toFixed(2),
            'Balance (₹)': t.balance.toFixed(2),
            'Flagged': t.flagged ? 'YES' : 'NO',
        }));
        Utils.exportCSV(rows, `transactions_${accountId}_${Date.now()}.csv`);
    }

    return { deposit, withdraw, transfer, getFiltered, payEMI, exportToCSV };
})();
