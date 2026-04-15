/* ============================================================
     ApkaGullak — Frontend API Client (js/api.js)
   Connects the browser to the Node.js + MySQL backend.
   Falls back to localStorage if the server is offline.
   ============================================================ */

const API = (() => {
    // Auto-detect: if frontend is served from same port as Express (5000),
    // use same-origin API. Otherwise fall back to localhost:5000.
    const BASE = (window.location.port === '5000' || window.location.port === '')
        ? '/api'
        : 'http://localhost:5000/api';
    let _connected = false;

    /* ── Low-level fetch wrappers ── */
    async function _fetch(method, path, body) {
        const opts = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(BASE + path, opts);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'API error');
        return data;
    }
    const _get  = (path)       => _fetch('GET',  path);
    const _post = (path, body) => _fetch('POST', path, body);
    const _put  = (path, body) => _fetch('PUT',  path, body);

    /* ── Normalize a MySQL row to match localStorage schema ── */
    function normTxn(t) {
        return {
            id:          t.id,
            txnId:       t.txn_id,
            accountId:   t.account_id,
            type:        t.transaction_type,
            amount:      parseFloat(t.amount),
            balance:     parseFloat(t.balance_after),
            description: t.description,
            remarks:     t.remarks || '',
            flagged:     !!t.flagged,
            timestamp:   t.created_at,
        };
    }

    function normAccount(a) {
        return {
            id:            a.id,
            customerId:    a.customer_id,
            accountNumber: a.account_number,
            type:          a.account_type,
            balance:       parseFloat(a.balance),
            frozen:        !!a.frozen,
            frozenReason:  a.frozen_reason || '',
            ifsc:          a.ifsc,
            branch:        a.branch,
            createdAt:     a.created_at,
        };
    }

    function normCustomer(c) {
        return {
            id:        c.id,
            name:      c.name,
            dob:       c.dob,
            phone:     c.phone,
            email:     c.email,
            address:   c.address,
            pan:       c.pan,
            aadhaar:   c.aadhaar,
            pin:       c.pin,       // needed for local PIN verification in withdraw/transfer
            status:    c.status,
            createdAt: c.created_at,
        };
    }

    function normLoan(l) {
        return {
            id:             l.id,
            customerId:     l.customer_id,
            accountId:      l.account_id,
            type:           l.loan_type,
            principal:      parseFloat(l.principal),
            rate:           parseFloat(l.interest_rate),
            tenureMonths:   parseInt(l.tenure_months),
            emi:            parseFloat(l.emi),
            startDate:      l.start_date,
            status:         l.status,
            paidMonths:     parseInt(l.paid_months),
            totalPaid:      parseFloat(l.total_paid),
            createdAt:      l.created_at,
        };
    }

    /* ── Initialize: test connection + load MySQL data into localStorage ── */
    async function init() {
        try {
            const test = await _get('/test');
            _connected = test.connected;
            if (_connected) {
                await _syncToLocalStorage();
                _showConnectionBadge(true, test.database);
            }
        } catch {
            _connected = false;
            _showConnectionBadge(false);
        }
        return _connected;
    }

    async function _syncToLocalStorage() {
        try {
            const data = await _get('/sync');
            const KEYS = window.STORAGE_KEYS || {
                CUSTOMERS:'sb_customers', ACCOUNTS:'sb_accounts',
                TRANSACTIONS:'sb_transactions', LOANS:'sb_loans',
                SESSION:'sb_session'
            };
            if (data.customers?.length)    localStorage.setItem(KEYS.CUSTOMERS,    JSON.stringify(data.customers.map(normCustomer)));
            if (data.accounts?.length)     localStorage.setItem(KEYS.ACCOUNTS,     JSON.stringify(data.accounts.map(normAccount)));
            if (data.transactions?.length) localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(data.transactions.map(normTxn)));
            if (data.loans?.length)        localStorage.setItem(KEYS.LOANS,        JSON.stringify(data.loans.map(normLoan)));

            // Clear any stale session created from seed data — forces re-login with MySQL IDs
            const existingSession = JSON.parse(localStorage.getItem(KEYS.SESSION) || 'null');
            if (existingSession) {
                const sessionAccountId = existingSession.accountId;
                const mysqlAccounts = data.accounts.map(normAccount);
                const sessionStillValid = mysqlAccounts.some(a => a.id === sessionAccountId);
                if (!sessionStillValid) {
                    localStorage.removeItem(KEYS.SESSION);
                    console.log('[API] Stale session cleared — please log in again');
                }
            }
        } catch (e) {
            console.warn('[API] Sync failed:', e.message);
        }
    }

    function _showConnectionBadge(ok, dbName) {
        // Remove existing badge
        document.getElementById('mysql-badge')?.remove();
        const badge = document.createElement('div');
        badge.id = 'mysql-badge';
        badge.innerHTML = ok
            ? `<span style="display:flex;align-items:center;gap:6px;font-size:0.72rem;padding:4px 10px;border-radius:20px;background:rgba(16,185,129,0.15);border:1px solid var(--green);color:var(--green);white-space:nowrap;"><span style="width:7px;height:7px;border-radius:50%;background:var(--green);animation:pulse 2s infinite;"></span>MySQL: ${dbName || '  ApkaGullak'}</span>`
            : `<span style="display:flex;align-items:center;gap:6px;font-size:0.72rem;padding:4px 10px;border-radius:20px;background:rgba(245,185,66,0.1);border:1px solid var(--accent-gold);color:var(--accent-gold);white-space:nowrap;"><span style="width:7px;height:7px;border-radius:50%;background:var(--accent-gold);"></span>localStorage</span>`;
        badge.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:9999;';
        document.body.appendChild(badge);
    }

    /* ── Public methods — each calls MySQL API then refreshes localStorage ── */

    async function login(accountNumber, pin) {
        const data = await _post('/auth/login', { accountNumber, pin });
        // Update localStorage with fresh customer + account data from MySQL
        if (data.customer) {
            const c = normCustomer(data.customer);
            const a = normAccount(data.account);
            const custs = JSON.parse(localStorage.getItem('sb_customers') || '[]');
            const accs  = JSON.parse(localStorage.getItem('sb_accounts')  || '[]');
            const ci = custs.findIndex(x => x.id === c.id);
            if (ci >= 0) custs[ci] = c; else custs.push(c);
            const ai = accs.findIndex(x => x.id === a.id);
            if (ai >= 0) accs[ai] = a; else accs.push(a);
            localStorage.setItem('sb_customers', JSON.stringify(custs));
            localStorage.setItem('sb_accounts',  JSON.stringify(accs));
        }
        return data;
    }

    async function adminLogin(username, password) {
        return await _post('/auth/admin-login', { username, password });
    }

    async function register(payload) {
        const data = await _post('/auth/register', payload);
        if (data.customer) {
            const c = normCustomer(data.customer);
            const a = normAccount(data.account);
            const custs = JSON.parse(localStorage.getItem('sb_customers') || '[]');
            const accs  = JSON.parse(localStorage.getItem('sb_accounts')  || '[]');
            custs.push(c); accs.push(a);
            localStorage.setItem('sb_customers', JSON.stringify(custs));
            localStorage.setItem('sb_accounts',  JSON.stringify(accs));
            return { success: data.success, customer: c, account: a };
        }
        return data;
    }

    async function changePIN(customerId, oldPin, newPin) {
        return await _put('/auth/change-pin', { customerId, oldPin, newPin });
    }

    async function deposit(accountId, amount, description, remarks) {
        const data = await _post('/transactions/deposit', { accountId, amount, description, remarks });
        if (data.success) {
            _updateAccountBalance(accountId, data.newBalance);
            _addTransaction(normTxn(data.transaction));
        }
        return data;
    }

    async function withdraw(accountId, amount, description, remarks) {
        const data = await _post('/transactions/withdraw', { accountId, amount, description, remarks });
        if (data.success) {
            _updateAccountBalance(accountId, data.newBalance);
            _addTransaction(normTxn(data.transaction));
        }
        return data;
    }

    async function transfer(fromAccountId, toAccountNumber, amount, remarks) {
        const data = await _post('/transactions/transfer', { fromAccountId, toAccountNumber, amount, remarks });
        if (data.success) {
            // Refresh all accounts from MySQL after transfer
            await _syncToLocalStorage();
        }
        return data;
    }

    async function applyLoan(customerId, accountId, loanType, principal, tenureMonths, rate) {
        const data = await _post('/loans/apply', { customerId, accountId, loanType, principal, tenureMonths, rate });
        if (data.success && data.loan) {
            const loans = JSON.parse(localStorage.getItem('sb_loans') || '[]');
            loans.unshift(normLoan(data.loan));
            localStorage.setItem('sb_loans', JSON.stringify(loans));
            // Also sync accounts (balance updated from disbursement)
            await _syncToLocalStorage();
        }
        return data;
    }

    async function payEMI(accountId, loanId) {
        const data = await _post('/loans/pay-emi', { accountId, loanId });
        if (data.success) await _syncToLocalStorage();
        return data;
    }

    async function freezeAccount(accountId, reason) {
        return await _put(`/admin/freeze/${accountId}`, { reason });
    }

    async function unfreezeAccount(accountId) {
        return await _put(`/admin/unfreeze/${accountId}`, {});
    }

    async function adminCredit(accountId, amount, description) {
        const data = await _post('/admin/credit', { accountId, amount, description });
        if (data.success) await _syncToLocalStorage();
        return data;
    }

    async function resolveFraudFlag(txnId) {
        return await _put(`/admin/resolve-flag/${txnId}`, {});
    }

    async function deleteCustomer(customerId) {
        const res = await fetch(BASE + `/admin/customer/${customerId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'API error');
        return data;
    }

    async function resetCustomerPIN(customerId, newPin) {
        return await _put(`/admin/reset-pin/${customerId}`, { newPin });
    }

    async function adminDebit(accountId, amount, description) {
        const data = await _post('/admin/debit', { accountId, amount, description });
        if (data.success) await _syncToLocalStorage();
        return data;
    }

    async function getStats() {
        return await _get('/admin/stats');
    }

    async function refreshStats() {
        await _syncToLocalStorage();
    }

    /* ── localStorage cache helpers ── */
    function _updateAccountBalance(accountId, newBalance) {
        const accs = JSON.parse(localStorage.getItem('sb_accounts') || '[]');
        const idx = accs.findIndex(a => a.id === accountId);
        if (idx >= 0) accs[idx].balance = newBalance;
        localStorage.setItem('sb_accounts', JSON.stringify(accs));
    }

    function _addTransaction(txn) {
        const txns = JSON.parse(localStorage.getItem('sb_transactions') || '[]');
        txns.unshift(txn);
        localStorage.setItem('sb_transactions', JSON.stringify(txns));
    }

    return {
        init,
        isConnected: () => _connected,
        refreshFromMySQL: _syncToLocalStorage,
        normTxn, // expose for receipt normalization

        // Auth
        login, adminLogin, register, changePIN,

        // Transactions
        deposit, withdraw, transfer,

        // Loans
        applyLoan, payEMI,

        // Admin
        freezeAccount, unfreezeAccount, adminCredit, adminDebit,
        deleteCustomer, resetCustomerPIN,
        resolveFraudFlag,
        getStats, refreshStats,
    };
})();

// Expose storage key constants so api.js can reference them
window.STORAGE_KEYS = {
    CUSTOMERS:    'sb_customers',
    ACCOUNTS:     'sb_accounts',
    TRANSACTIONS: 'sb_transactions',
    LOANS:        'sb_loans',
    SESSION:      'sb_session',
    FAILED_PINS:  'sb_failed_pins',
};
