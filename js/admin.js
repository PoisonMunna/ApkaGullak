/* ============================================================
     ApkaGullak — Admin Module
   ============================================================ */

const Admin = (() => {

    /* ── Get all customers with their account details ── */
    function getAllCustomers() {
        return DB.customers.all().map(cust => {
            const accounts = DB.accounts.byCustomerId(cust.id);
            const loans    = DB.loans.byCustomerId(cust.id).filter(l => l.status === 'active');
            return {
                ...cust,
                accounts,
                primaryAccount: accounts[0] || null,
                totalBalance: accounts.reduce((s, a) => s + a.balance, 0),
                activeLoans: loans.length,
            };
        });
    }

    /* ── Get full customer profile ── */
    function getCustomerProfile(customerId) {
        const customer  = DB.customers.byId(customerId);
        if (!customer) return null;
        const accounts  = DB.accounts.byCustomerId(customerId);
        const loans     = DB.loans.byCustomerId(customerId);
        const txns      = accounts.length ? DB.transactions.byAccountId(accounts[0].id) : [];
        return { customer, accounts, loans, recentTxns: txns.slice(0, 10) };
    }

    /* ── Freeze / Unfreeze account ── */
    function freezeAccount(accountId, reason) {
        return Accounts.freezeAccount(accountId, reason);
    }

    function unfreezeAccount(accountId) {
        return Accounts.unfreezeAccount(accountId);
    }

    /* ── Update customer status ── */
    function setCustomerStatus(customerId, status) {
        return DB.customers.update(customerId, { status });
    }

    /* ── Admin deposit / credit (override) ── */
    function adminCredit(accountId, amount, description = 'Admin Credit') {
        return Transactions.deposit(accountId, amount, description);
    }

    /* ── Admin debit / charge (override) ── */
    function adminDebit(accountId, amount, description = 'Admin Debit') {
        const account = DB.accounts.byId(accountId);
        if (!account) return { success: false, error: 'Account not found.' };
        const amt = Number(amount);
        if (isNaN(amt) || amt <= 0) return { success: false, error: 'Invalid amount.' };
        if (account.balance < amt) return { success: false, error: 'Insufficient balance.' };
        const newBalance = Math.round((account.balance - amt) * 100) / 100;
        DB.accounts.updateBalance(accountId, newBalance);
        DB.transactions.create({
            id: Utils.generateId(),
            txnId: Utils.generateTransactionId(),
            accountId,
            type: 'debit',
            amount: amt,
            balance: newBalance,
            description,
            remarks: '',
            timestamp: new Date().toISOString(),
            flagged: false,
            linkedAccountId: null,
        });
        return { success: true, newBalance };
    }

    /* ── Delete customer and all associated data (localStorage mode) ── */
    function deleteCustomer(customerId) {
        const accs = DB.accounts.byCustomerId(customerId);
        const accIds = accs.map(a => a.id);
        // Remove transactions
        const allTxns = DB.transactions.all().filter(t => !accIds.includes(t.accountId));
        localStorage.setItem('sb_transactions', JSON.stringify(allTxns));
        // Remove loans
        const allLoans = DB.loans.all().filter(l => l.customerId !== customerId);
        localStorage.setItem('sb_loans', JSON.stringify(allLoans));
        // Remove accounts
        const allAccs = DB.accounts.all().filter(a => a.customerId !== customerId);
        localStorage.setItem('sb_accounts', JSON.stringify(allAccs));
        // Remove customer
        const allCusts = DB.customers.all().filter(c => c.id !== customerId);
        localStorage.setItem('sb_customers', JSON.stringify(allCusts));
        return { success: true };
    }

    /* ── Reset customer PIN (localStorage mode) ── */
    function resetCustomerPIN(customerId, newPin) {
        if (!newPin || String(newPin).length < 4) return { success: false, error: 'PIN must be at least 4 digits.' };
        const updated = DB.customers.update(customerId, { pin: String(newPin) });
        if (!updated) return { success: false, error: 'Customer not found.' };
        return { success: true };
    }

    /* ── Resolve fraud flag ── */
    function resolveFraudFlag(transactionId) {
        return DB.transactions.update(transactionId, { flagged: false, resolvedAt: new Date().toISOString() });
    }

    /* ── System statistics ── */
    function getStats() {
        return DB.getSystemStats();
    }

    /* ── Get fraud alerts ── */
    function getFraudAlerts() {
        return FraudDetection.getFraudSummary();
    }

    /* ── Search customers ── */
    function searchCustomers(query) {
        const q = query.trim().toLowerCase();
        if (!q) return getAllCustomers();
        return getAllCustomers().filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            c.email.toLowerCase().includes(q) ||
            (c.primaryAccount?.accountNumber || '').includes(q) ||
            c.pan.toLowerCase().includes(q)
        );
    }

    /* ── Export all customers CSV ── */
    function exportCustomersCSV() {
        const rows = getAllCustomers().map(c => ({
            'Customer ID': c.id,
            'Name': c.name,
            'Phone': c.phone,
            'Email': c.email,
            'PAN': c.pan,
            'Account Number': c.primaryAccount?.accountNumber || '',
            'Account Type': c.primaryAccount?.type || '',
            'Balance': c.totalBalance.toFixed(2),
            'Status': c.status,
            'Active Loans': c.activeLoans,
            'Joined': Utils.formatDate(c.createdAt),
        }));
        Utils.exportCSV(rows, `customers_${Date.now()}.csv`);
    }

    return {
        getAllCustomers,
        getCustomerProfile,
        freezeAccount,
        unfreezeAccount,
        setCustomerStatus,
        adminCredit,
        adminDebit,
        deleteCustomer,
        resetCustomerPIN,
        resolveFraudFlag,
        getStats,
        getFraudAlerts,
        searchCustomers,
        exportCustomersCSV,
    };
})();
