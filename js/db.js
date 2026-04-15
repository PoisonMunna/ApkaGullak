/* ============================================================
     ApkaGullak — Data Layer (localStorage)
   ============================================================ */

const DB = (() => {

    const KEYS = {
        CUSTOMERS:    'sb_customers',
        ACCOUNTS:     'sb_accounts',
        TRANSACTIONS: 'sb_transactions',
        LOANS:        'sb_loans',
        SESSION:      'sb_session',
        FAILED_PINS:  'sb_failed_pins',
        SEEDED:       'sb_seeded',
    };

    /* ── Low-level helpers ── */
    function _get(key)       { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } }
    function _getObj(key)    { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } }
    function _set(key, val)  { localStorage.setItem(key, JSON.stringify(val)); }

    /* ── Customers ── */
    const customers = {
        all:          ()     => _get(KEYS.CUSTOMERS),
        byId:         (id)   => customers.all().find(c => c.id === id) || null,
        byPhone:      (ph)   => customers.all().find(c => c.phone === ph) || null,
        byEmail:      (em)   => customers.all().find(c => c.email === em) || null,

        create(data) {
            const list = customers.all();
            list.push(data);
            _set(KEYS.CUSTOMERS, list);
            return data;
        },

        update(id, patch) {
            const list = customers.all();
            const i = list.findIndex(c => c.id === id);
            if (i === -1) return null;
            list[i] = { ...list[i], ...patch };
            _set(KEYS.CUSTOMERS, list);
            return list[i];
        }
    };

    /* ── Accounts ── */
    const accounts = {
        all:             ()      => _get(KEYS.ACCOUNTS),
        byId:            (id)    => accounts.all().find(a => a.id === id) || null,
        byNumber:        (num)   => accounts.all().find(a => a.accountNumber === String(num)) || null,
        byCustomerId:    (cId)   => accounts.all().filter(a => a.customerId === cId),

        create(data) {
            const list = accounts.all();
            list.push(data);
            _set(KEYS.ACCOUNTS, list);
            return data;
        },

        update(id, patch) {
            const list = accounts.all();
            const i = list.findIndex(a => a.id === id);
            if (i === -1) return null;
            list[i] = { ...list[i], ...patch };
            _set(KEYS.ACCOUNTS, list);
            return list[i];
        },

        updateBalance(id, newBalance) {
            return accounts.update(id, { balance: Math.round(newBalance * 100) / 100 });
        }
    };

    /* ── Transactions ── */
    const transactions = {
        all:           ()      => _get(KEYS.TRANSACTIONS),

        byAccountId:   (aId)   => transactions.all()
            .filter(t => t.accountId === aId || t.linkedAccountId === aId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),

        recent:        (aId, n = 5) => transactions.byAccountId(aId).slice(0, n),

        byId:          (id)    => transactions.all().find(t => t.id === id) || null,

        create(data) {
            const list = transactions.all();
            list.push(data);
            _set(KEYS.TRANSACTIONS, list);
            return data;
        },

        update(id, patch) {
            const list = transactions.all();
            const i = list.findIndex(t => t.id === id);
            if (i === -1) return null;
            list[i] = { ...list[i], ...patch };
            _set(KEYS.TRANSACTIONS, list);
            return list[i];
        },

        /* Get total debits/credits in a date range for an account */
        sumByType(accountId, type, sinceMs) {
            return transactions.all()
                .filter(t => t.accountId === accountId && t.type === type && new Date(t.timestamp).getTime() >= sinceMs)
                .reduce((s, t) => s + t.amount, 0);
        },

        countRecent(accountId, windowMs) {
            const since = Date.now() - windowMs;
            return transactions.all()
                .filter(t => t.accountId === accountId && new Date(t.timestamp).getTime() >= since)
                .length;
        }
    };

    /* ── Loans ── */
    const loans = {
        all:           ()      => _get(KEYS.LOANS),
        byId:          (id)    => loans.all().find(l => l.id === id) || null,
        byCustomerId:  (cId)   => loans.all().filter(l => l.customerId === cId),
        active:        (cId)   => loans.all().filter(l => l.customerId === cId && l.status === 'active'),

        create(data) {
            const list = loans.all();
            list.push(data);
            _set(KEYS.LOANS, list);
            return data;
        },

        update(id, patch) {
            const list = loans.all();
            const i = list.findIndex(l => l.id === id);
            if (i === -1) return null;
            list[i] = { ...list[i], ...patch };
            _set(KEYS.LOANS, list);
            return list[i];
        }
    };

    /* ── Session ── */
    const session = {
        get()       { try { return JSON.parse(localStorage.getItem(KEYS.SESSION)); } catch { return null; } },
        set(data)   { localStorage.setItem(KEYS.SESSION, JSON.stringify(data)); },
        clear()     { localStorage.removeItem(KEYS.SESSION); }
    };

    /* ── Failed PINs (brute-force protection) ── */
    const failedPins = {
        get(accNum) {
            const data = _getObj(KEYS.FAILED_PINS);
            return data[accNum] || { count: 0, lockedUntil: null };
        },
        increment(accNum) {
            const data  = _getObj(KEYS.FAILED_PINS);
            const entry = data[accNum] || { count: 0, lockedUntil: null };
            entry.count++;
            entry.lastAttempt = new Date().toISOString();
            if (entry.count >= 3) {
                entry.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min lock
            }
            data[accNum] = entry;
            _set(KEYS.FAILED_PINS, data);
            return entry;
        },
        reset(accNum) {
            const data = _getObj(KEYS.FAILED_PINS);
            delete data[accNum];
            _set(KEYS.FAILED_PINS, data);
        },
        isLocked(accNum) {
            const entry = failedPins.get(accNum);
            if (!entry.lockedUntil) return false;
            if (new Date(entry.lockedUntil) > new Date()) return true;
            failedPins.reset(accNum);
            return false;
        }
    };

    /* ── Seed Demo Data ── */
    function seed() {
        if (localStorage.getItem(KEYS.SEEDED)) return;

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const demoCustomers = [
            {
                id: 'cust_001', name: 'Rajesh Kumar Sharma', dob: '1985-03-15',
                phone: '9876543210', email: 'rajesh.sharma@email.com',
                address: '45, MG Road, Bengaluru, Karnataka - 560001',
                pan: 'ABCPS1234K', aadhaar: '1234 5678 9012',
                pin: '1234', createdAt: sixMonthsAgo.toISOString(), status: 'active'
            },
            {
                id: 'cust_002', name: 'Priya Devi Nair', dob: '1992-07-22',
                phone: '8765432109', email: 'priya.nair@email.com',
                address: '12, Nehru Street, Chennai, Tamil Nadu - 600001',
                pan: 'BCDPN5678L', aadhaar: '2345 6789 0123',
                pin: '5678', createdAt: sixMonthsAgo.toISOString(), status: 'active'
            },
            {
                id: 'cust_003', name: 'Amit Singh Rawat', dob: '1978-11-08',
                phone: '7654321098', email: 'amit.rawat@email.com',
                address: '78, Civil Lines, New Delhi - 110001',
                pan: 'CDQAS9012M', aadhaar: '3456 7890 1234',
                pin: '9012', createdAt: sixMonthsAgo.toISOString(), status: 'active'
            }
        ];

        const demoAccounts = [
            {
                id: 'acc_001', customerId: 'cust_001', accountNumber: '500012345678',
                type: 'Savings', balance: 85420.50, createdAt: sixMonthsAgo.toISOString(),
                frozen: false, ifsc: 'SECB0001234', branch: 'Bengaluru Main'
            },
            {
                id: 'acc_002', customerId: 'cust_002', accountNumber: '500087654321',
                type: 'Savings', balance: 42150.00, createdAt: sixMonthsAgo.toISOString(),
                frozen: false, ifsc: 'SECB0001234', branch: 'Chennai Anna Salai'
            },
            {
                id: 'acc_003', customerId: 'cust_003', accountNumber: '500011223344',
                type: 'Current', balance: 215000.00, createdAt: sixMonthsAgo.toISOString(),
                frozen: false, ifsc: 'SECB0001234', branch: 'Delhi Connaught Place'
            }
        ];

        const txData = [
            { type: 'credit', desc: 'Salary Credit — TechCorp Pvt Ltd', amount: 55000, dayOffset: 0 },
            { type: 'debit',  desc: 'Amazon India — Online Purchase',    amount: 2499,  dayOffset: 3 },
            { type: 'debit',  desc: 'BESCOM Electricity Bill',           amount: 1850,  dayOffset: 6 },
            { type: 'credit', desc: 'Transfer Received from Priya Nair', amount: 5000,  dayOffset: 10 },
            { type: 'debit',  desc: 'ATM Cash Withdrawal',               amount: 10000, dayOffset: 15 },
            { type: 'credit', desc: 'Quarterly Interest Credit',         amount: 320.50,dayOffset: 20 },
            { type: 'debit',  desc: 'More Supermarket — Grocery',        amount: 3240,  dayOffset: 28 },
            { type: 'debit',  desc: 'Jio Mobile Recharge',               amount: 299,   dayOffset: 35 },
            { type: 'credit', desc: 'Salary Credit — TechCorp Pvt Ltd',  amount: 55000, dayOffset: 30 },
            { type: 'debit',  desc: 'Netflix Subscription',              amount: 799,   dayOffset: 38 },
        ];

        const demoTxns = [];
        let bal = 85420.50;
        txData.forEach((tx, i) => {
            const d = new Date(sixMonthsAgo);
            d.setDate(d.getDate() + tx.dayOffset);
            if (tx.type === 'debit') bal -= tx.amount;
            else bal += tx.amount;
            demoTxns.push({
                id: `tx_${String(i+1).padStart(3,'0')}`,
                txnId: 'TXN' + Date.now().toString(36).toUpperCase() + i,
                accountId: 'acc_001',
                type: tx.type,
                amount: tx.amount,
                balance: Math.round(bal * 100) / 100,
                description: tx.desc,
                timestamp: d.toISOString(),
                flagged: tx.amount > 75000,
                linkedAccountId: null,
                remarks: ''
            });
        });

        // Demo loan
        const emi = Utils.calculateEMI(200000, 12, 24);
        const demoLoans = [{
            id: 'loan_001', customerId: 'cust_001', accountId: 'acc_001',
            type: 'Personal', principal: 200000, rate: 12, tenureMonths: 24,
            emi: emi, startDate: sixMonthsAgo.toISOString(), status: 'active',
            paidMonths: 6, totalPaid: Math.round(emi * 6 * 100) / 100
        }];

        _set(KEYS.CUSTOMERS,    demoCustomers);
        _set(KEYS.ACCOUNTS,     demoAccounts);
        _set(KEYS.TRANSACTIONS, demoTxns);
        _set(KEYS.LOANS,        demoLoans);
        localStorage.setItem(KEYS.SEEDED, '1');

        console.log('%c[  ApkaGullak] Demo data seeded ✓', 'color:#F5B942;font-weight:bold');
    }

    /* ── Stats for Admin ── */
    function getSystemStats() {
        const allTxns = transactions.all();
        const allAccs = accounts.all();
        const allLns  = loans.all();
        return {
            totalCustomers:   customers.all().length,
            totalAccounts:    allAccs.length,
            totalDeposits:    allTxns.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0),
            totalWithdrawals: allTxns.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0),
            totalTransactions:allTxns.length,
            flaggedTxns:      allTxns.filter(t => t.flagged).length,
            activeLoans:      allLns.filter(l => l.status === 'active').length,
            totalLoanAmount:  allLns.filter(l => l.status === 'active').reduce((s, l) => s + l.principal, 0),
            frozenAccounts:   allAccs.filter(a => a.frozen).length,
        };
    }

    return { customers, accounts, transactions, loans, session, failedPins, seed, getSystemStats };
})();
