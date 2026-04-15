/* ============================================================
     ApkaGullak — Node.js + Express Backend API
   Connects to MySQL and exposes a REST API for the frontend
   Run: node server.js | Port: 5000
   ============================================================ */

require('dotenv').config();
const express = require('express');
const mysql   = require('mysql2/promise');
const cors    = require('cors');
const { v4: uuidv4 } = require('uuid');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ── Serve frontend static files from project root ───────────
// All HTML/CSS/JS/lib files are served from http://localhost:5000
app.use(express.static(__dirname));

// ── MySQL Connection Pool ───────────────────────────────────
const pool = mysql.createPool({
    host:             process.env.DB_HOST     || 'localhost',
    port:             parseInt(process.env.DB_PORT) || 3306,
    user:             process.env.DB_USER     || 'root',
    password:         process.env.DB_PASSWORD || '',
    database:         process.env.DB_NAME     || 'securebank',
    waitForConnections: true,
    connectionLimit:  10,
    queueLimit:       0,
    timezone:         '+00:00',
});

// Helper: generate unique transaction ID
function makeTxnId() {
    return 'TXN' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase();
}

/* ══════════════════════════════════════════════════════════
   TEST / HEALTH
══════════════════════════════════════════════════════════ */

// GET /favicon.ico — return inline SVG favicon (eliminates 404)
app.get('/favicon.ico', (req, res) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#F5B942"/><path d="M14 46L24 26L32 36L42 20L50 46" stroke="#0A0F1E" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="14" r="5" fill="#0A0F1E"/></svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svg);
});

// GET /api/test — Test MySQL connectivity
app.get('/api/test', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const [rows] = await conn.query('SELECT DATABASE() AS db, NOW() AS server_time');
        conn.release();
        res.json({
            connected: true,
            database:  rows[0].db,
            serverTime:rows[0].server_time,
            message:   '✅ MySQL connected successfully!'
        });
    } catch (err) {
        res.status(500).json({ connected: false, message: err.message });
    }
});

/* ══════════════════════════════════════════════════════════
   SYNC — Load all data for the frontend localStorage cache
══════════════════════════════════════════════════════════ */

// GET /api/sync — Returns all tables for front-end caching
app.get('/api/sync', async (req, res) => {
    try {
        const [customers]    = await pool.query('SELECT * FROM customers ORDER BY created_at');
        const [accounts]     = await pool.query('SELECT * FROM accounts  ORDER BY created_at');
        const [transactions] = await pool.query('SELECT * FROM transactions ORDER BY created_at DESC');
        const [loans]        = await pool.query('SELECT * FROM loans ORDER BY created_at DESC');
        res.json({ customers, accounts, transactions, loans });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* ══════════════════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════════════════ */

// POST /api/auth/login — Customer login
app.post('/api/auth/login', async (req, res) => {
    const { accountNumber, pin } = req.body;
    if (!accountNumber || !pin) return res.status(400).json({ error: 'Account number and PIN are required.' });

    try {
        const [[account]] = await pool.query(
            'SELECT * FROM accounts WHERE account_number = ?', [accountNumber]);
        if (!account) return res.status(404).json({ error: 'Account not found. Check your account number.' });
        if (account.frozen) return res.status(403).json({ error: 'Account is frozen. Contact support.' });

        const [[customer]] = await pool.query(
            'SELECT * FROM customers WHERE id = ?', [account.customer_id]);

        if (customer.pin !== String(pin)) {
            // Record failed attempt
            await pool.query(`
                INSERT INTO failed_pin_attempts (account_number, attempt_count, last_attempt)
                VALUES (?, 1, NOW())
                ON DUPLICATE KEY UPDATE attempt_count = attempt_count + 1, last_attempt = NOW()
            `, [accountNumber]);

            const [[att]] = await pool.query(
                'SELECT * FROM failed_pin_attempts WHERE account_number = ?', [accountNumber]);
            const count = att?.attempt_count || 1;

            if (count >= 3) {
                await pool.query(
                    "UPDATE accounts SET frozen = TRUE, frozen_reason = 'Too many failed PIN attempts', frozen_at = NOW() WHERE account_number = ?",
                    [accountNumber]);
                return res.status(403).json({ error: 'Account locked after 3 failed attempts. Contact support immediately.' });
            }
            return res.status(401).json({ error: `Incorrect PIN. ${3 - count} attempt(s) remaining.` });
        }

        // Success — clear failed attempts
        await pool.query('DELETE FROM failed_pin_attempts WHERE account_number = ?', [accountNumber]);

        // Don't send PIN in response
        delete customer.pin;
        res.json({ success: true, customer, account });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/admin-login — Admin login
app.post('/api/auth/admin-login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const envUser = process.env.ADMIN_USERNAME || 'gullak';
        const envPass = process.env.ADMIN_PASSWORD || 'paisa';
        
        if (username === envUser && password === envPass) {
            return res.json({ success: true });
        }
        return res.status(401).json({ error: 'Invalid admin credentials.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/register — Register new customer + account
app.post('/api/auth/register', async (req, res) => {
    const { name, dob, phone, email, address, pan, aadhaar, pin, accountType, initialDeposit } = req.body;
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const customerId    = uuidv4();
        const accountId     = uuidv4();
        const accountNumber = '5000' + Math.floor(10000000 + Math.random() * 90000000);
        const deposit       = parseFloat(initialDeposit) || 0;

        // Insert customer
        await conn.query(
            'INSERT INTO customers (id, name, dob, phone, email, address, pan, aadhaar, pin) VALUES (?,?,?,?,?,?,?,?,?)',
            [customerId, name, dob, phone, email, address, pan.toUpperCase(), aadhaar, pin]);

        // Insert account
        await conn.query(
            'INSERT INTO accounts (id, customer_id, account_number, account_type, balance) VALUES (?,?,?,?,?)',
            [accountId, customerId, accountNumber, accountType || 'Savings', deposit]);

        // Initial deposit transaction
        if (deposit > 0) {
            await conn.query(
                'INSERT INTO transactions (id, txn_id, account_id, transaction_type, amount, balance_after, description) VALUES (?,?,?,?,?,?,?)',
                [uuidv4(), makeTxnId(), accountId, 'credit', deposit, deposit, 'Account Opening - Initial Deposit']);
        }

        await conn.commit();

        const [[customer]] = await conn.query('SELECT * FROM customers WHERE id = ?', [customerId]);
        const [[account]]  = await conn.query('SELECT * FROM accounts  WHERE id = ?', [accountId]);
        delete customer.pin;

        res.status(201).json({ success: true, customer, account });
    } catch (err) {
        await conn.rollback();
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Phone number, email, or PAN already registered.' });
        }
        if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
            return res.status(400).json({ error: 'Invalid phone number or PAN format.' });
        }
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// PUT /api/auth/change-pin
app.put('/api/auth/change-pin', async (req, res) => {
    const { customerId, oldPin, newPin } = req.body;
    try {
        const [[customer]] = await pool.query('SELECT pin FROM customers WHERE id = ?', [customerId]);
        if (!customer) return res.status(404).json({ error: 'Customer not found.' });
        if (customer.pin !== String(oldPin)) return res.status(401).json({ error: 'Incorrect current PIN.' });
        await pool.query('UPDATE customers SET pin = ? WHERE id = ?', [newPin, customerId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* ══════════════════════════════════════════════════════════
   TRANSACTIONS
══════════════════════════════════════════════════════════ */

// POST /api/transactions/deposit
app.post('/api/transactions/deposit', async (req, res) => {
    const { accountId, amount, description, remarks } = req.body;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: 'Invalid amount.' });

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [[account]] = await conn.query(
            'SELECT * FROM accounts WHERE id = ? FOR UPDATE', [accountId]);
        if (!account)         { await conn.rollback(); return res.status(404).json({ error: 'Account not found.' }); }
        if (account.frozen)   { await conn.rollback(); return res.status(403).json({ error: 'Account is frozen.' }); }

        const newBalance = parseFloat(account.balance) + amt;
        await conn.query('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, accountId]);

        const txnId = makeTxnId();
        const txnUUID = uuidv4();
        await conn.query(
            'INSERT INTO transactions (id, txn_id, account_id, transaction_type, amount, balance_after, description, remarks) VALUES (?,?,?,?,?,?,?,?)',
            [txnUUID, txnId, accountId, 'credit', amt, newBalance, description || 'Cash Deposit', remarks || '']);

        await conn.commit();

        const [[txn]] = await conn.query('SELECT * FROM transactions WHERE id = ?', [txnUUID]);
        res.json({ success: true, transaction: txn, newBalance,
                   warning: amt > 75000 ? 'This transaction has been flagged for review (> ₹75,000).' : null });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// POST /api/transactions/withdraw
app.post('/api/transactions/withdraw', async (req, res) => {
    const { accountId, amount, description, remarks } = req.body;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: 'Invalid amount.' });

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [[account]] = await conn.query(
            'SELECT * FROM accounts WHERE id = ? FOR UPDATE', [accountId]);
        if (!account)       { await conn.rollback(); return res.status(404).json({ error: 'Account not found.' }); }
        if (account.frozen) { await conn.rollback(); return res.status(403).json({ error: 'Account is frozen.' }); }
        if (parseFloat(account.balance) < amt) {
            await conn.rollback();
            return res.status(400).json({ error: 'Insufficient balance.' });
        }
        if (account.account_type === 'Savings' && (parseFloat(account.balance) - amt) < 500) {
            await conn.rollback();
            return res.status(400).json({ error: 'Savings account must maintain minimum balance of ₹500.' });
        }

        const newBalance = parseFloat(account.balance) - amt;
        await conn.query('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, accountId]);

        const txnId = makeTxnId();
        const txnUUID = uuidv4();
        await conn.query(
            'INSERT INTO transactions (id, txn_id, account_id, transaction_type, amount, balance_after, description, remarks) VALUES (?,?,?,?,?,?,?,?)',
            [txnUUID, txnId, accountId, 'debit', amt, newBalance, description || 'Cash Withdrawal', remarks || '']);

        await conn.commit();

        const [[txn]] = await conn.query('SELECT * FROM transactions WHERE id = ?', [txnUUID]);
        res.json({ success: true, transaction: txn, newBalance,
                   warning: amt > 75000 ? 'Large withdrawal flagged for security review.' : null });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// POST /api/transactions/transfer — uses stored procedure sp_transfer_funds
app.post('/api/transactions/transfer', async (req, res) => {
    const { fromAccountId, toAccountNumber, amount, remarks } = req.body;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: 'Invalid amount.' });

    try {
        const [[toAccount]] = await pool.query(
            'SELECT * FROM accounts WHERE account_number = ?', [toAccountNumber]);
        if (!toAccount) return res.status(404).json({ error: 'Destination account not found.' });

        if (fromAccountId === toAccount.id)
            return res.status(400).json({ error: 'Cannot transfer to the same account.' });

        const [[fromAccount]]  = await pool.query('SELECT * FROM accounts  WHERE id = ?', [fromAccountId]);
        const [[fromCustomer]] = await pool.query('SELECT * FROM customers WHERE id = ?', [fromAccount.customer_id]);
        const [[toCustomer]]   = await pool.query('SELECT * FROM customers WHERE id = ?', [toAccount.customer_id]);

        const txnId    = makeTxnId();
        const descFrom = `Transfer to ${toCustomer.name} (${toAccountNumber})${remarks ? ' — '+remarks : ''}`;
        const descTo   = `Transfer from ${fromCustomer.name} (${fromAccount.account_number})${remarks ? ' — '+remarks : ''}`;

        await pool.query(
            'CALL sp_transfer_funds(?, ?, ?, ?, ?, ?, @success, @message)',
            [fromAccountId, toAccount.id, amt, descFrom, descTo, txnId]);

        const [[out]] = await pool.query('SELECT @success AS success, @message AS message');
        if (!out.success)
            return res.status(400).json({ error: out.message });

        const [[updatedAcc]] = await pool.query('SELECT balance FROM accounts WHERE id = ?', [fromAccountId]);
        const [[txn]]        = await pool.query('SELECT * FROM transactions WHERE txn_id = ?', [txnId]);

        res.json({
            success:        true,
            transaction:    txn,
            newBalance:     parseFloat(updatedAcc.balance),
            toCustomerName: toCustomer.name,
            warning:        amt > 75000 ? 'Large transfer flagged for security review.' : null
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/transactions/:accountId — get all transactions for an account
app.get('/api/transactions/:accountId', async (req, res) => {
    try {
        const [txns] = await pool.query(
            'SELECT * FROM transactions WHERE account_id = ? ORDER BY created_at DESC',
            [req.params.accountId]);
        res.json(txns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* ══════════════════════════════════════════════════════════
   LOANS
══════════════════════════════════════════════════════════ */

// GET /api/loans/customer/:customerId
app.get('/api/loans/customer/:customerId', async (req, res) => {
    try {
        const [loans] = await pool.query(
            'SELECT * FROM loans WHERE customer_id = ? ORDER BY created_at DESC',
            [req.params.customerId]);
        res.json(loans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/loans/apply
app.post('/api/loans/apply', async (req, res) => {
    const { customerId, accountId, loanType, principal, tenureMonths, rate } = req.body;
    const amt = parseFloat(principal);
    if (!amt || amt <= 0)          return res.status(400).json({ error: 'Invalid loan amount.' });
    if (!tenureMonths || tenureMonths <= 0) return res.status(400).json({ error: 'Invalid tenure.' });

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Use MySQL function to calculate EMI
        const [[emiRow]] = await conn.query(
            'SELECT fn_calculate_emi(?, ?, ?) AS emi', [amt, rate, tenureMonths]);
        const emi = parseFloat(emiRow.emi);

        const loanId = 'loan_' + uuidv4().slice(0, 8);
        await conn.query(
            'INSERT INTO loans (id, customer_id, account_id, loan_type, principal, interest_rate, tenure_months, emi, start_date) VALUES (?,?,?,?,?,?,?,?,CURDATE())',
            [loanId, customerId, accountId, loanType, amt, rate, tenureMonths, emi]);

        // Disburse loan amount
        const [[account]] = await conn.query(
            'SELECT balance FROM accounts WHERE id = ? FOR UPDATE', [accountId]);
        const newBalance = parseFloat(account.balance) + amt;
        await conn.query('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, accountId]);

        await conn.query(
            'INSERT INTO transactions (id, txn_id, account_id, transaction_type, amount, balance_after, description) VALUES (?,?,?,?,?,?,?)',
            [uuidv4(), makeTxnId(), accountId, 'credit', amt, newBalance, `${loanType} Loan Disbursement`]);

        await conn.commit();

        const [[loan]] = await conn.query('SELECT * FROM loans WHERE id = ?', [loanId]);
        res.status(201).json({ success: true, loan });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// POST /api/loans/pay-emi
app.post('/api/loans/pay-emi', async (req, res) => {
    const { accountId, loanId } = req.body;
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [[loan]]    = await conn.query('SELECT * FROM loans WHERE id = ? FOR UPDATE', [loanId]);
        const [[account]] = await conn.query('SELECT * FROM accounts WHERE id = ? FOR UPDATE', [accountId]);

        if (!loan || loan.status !== 'active')
            { await conn.rollback(); return res.status(400).json({ error: 'Loan not found or already closed.' }); }
        if (parseFloat(account.balance) < parseFloat(loan.emi))
            { await conn.rollback(); return res.status(400).json({ error: 'Insufficient balance to pay EMI.' }); }

        const newBalance   = parseFloat(account.balance) - parseFloat(loan.emi);
        const newPaid      = loan.paid_months + 1;
        const newTotalPaid = parseFloat(loan.total_paid) + parseFloat(loan.emi);
        const loanStatus   = newPaid >= loan.tenure_months ? 'closed' : 'active';

        await conn.query('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, accountId]);
        await conn.query(
            'UPDATE loans SET paid_months = ?, total_paid = ?, status = ? WHERE id = ?',
            [newPaid, newTotalPaid, loanStatus, loanId]);

        await conn.query(
            'INSERT INTO transactions (id, txn_id, account_id, transaction_type, amount, balance_after, description) VALUES (?,?,?,?,?,?,?)',
            [uuidv4(), makeTxnId(), accountId, 'debit', loan.emi, newBalance,
             `${loan.loan_type} Loan EMI Payment (${newPaid}/${loan.tenure_months})`]);

        await conn.commit();
        res.json({ success: true, newBalance, loanStatus });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

/* ══════════════════════════════════════════════════════════
   ADMIN
══════════════════════════════════════════════════════════ */

// GET /api/admin/stats — System overview stats
app.get('/api/admin/stats', async (req, res) => {
    try {
        const [[stats]] = await pool.query(`
            SELECT
                (SELECT COUNT(*)                           FROM customers)                              AS totalCustomers,
                (SELECT COUNT(*)                           FROM accounts)                               AS totalAccounts,
                (SELECT COALESCE(SUM(amount),0)            FROM transactions WHERE transaction_type='credit') AS totalDeposits,
                (SELECT COALESCE(SUM(amount),0)            FROM transactions WHERE transaction_type='debit')  AS totalWithdrawals,
                (SELECT COUNT(*)                           FROM transactions)                           AS totalTransactions,
                (SELECT COUNT(*)                           FROM transactions WHERE flagged=TRUE)         AS flaggedTxns,
                (SELECT COUNT(*)                           FROM loans WHERE status='active')             AS activeLoans,
                (SELECT COUNT(*)                           FROM accounts WHERE frozen=TRUE)              AS frozenAccounts
        `);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/customers — All customers (uses view)
app.get('/api/admin/customers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM v_customer_summary');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/fraud-alerts
app.get('/api/admin/fraud-alerts', async (req, res) => {
    try {
        const [flagged] = await pool.query(
            'SELECT * FROM v_transaction_report WHERE flagged = TRUE ORDER BY created_at DESC LIMIT 20');
        const [[{ cnt }]] = await pool.query(
            'SELECT COUNT(*) AS cnt FROM transactions WHERE flagged = TRUE');
        res.json({ flaggedTxns: flagged, flaggedCount: cnt });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/freeze/:accountId
app.put('/api/admin/freeze/:accountId', async (req, res) => {
    const { reason } = req.body;
    try {
        await pool.query(
            "UPDATE accounts SET frozen = TRUE, frozen_reason = ?, frozen_at = NOW() WHERE id = ?",
            [reason || 'Admin action', req.params.accountId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/unfreeze/:accountId
app.put('/api/admin/unfreeze/:accountId', async (req, res) => {
    try {
        await pool.query(
            "UPDATE accounts SET frozen = FALSE, frozen_reason = NULL, frozen_at = NULL WHERE id = ?",
            [req.params.accountId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/credit — Admin credits any account
app.post('/api/admin/credit', async (req, res) => {
    const { accountId, amount, description } = req.body;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: 'Invalid amount.' });

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [[account]] = await conn.query('SELECT balance FROM accounts WHERE id = ? FOR UPDATE', [accountId]);
        if (!account) { await conn.rollback(); return res.status(404).json({ error: 'Account not found.' }); }

        const newBalance = parseFloat(account.balance) + amt;
        await conn.query('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, accountId]);
        await conn.query(
            'INSERT INTO transactions (id, txn_id, account_id, transaction_type, amount, balance_after, description) VALUES (?,?,?,?,?,?,?)',
            [uuidv4(), makeTxnId(), accountId, 'credit', amt, newBalance, description || 'Admin Credit']);

        await conn.commit();
        res.json({ success: true, newBalance });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// PUT /api/admin/resolve-flag/:txnId
app.put('/api/admin/resolve-flag/:txnId', async (req, res) => {
    try {
        await pool.query('UPDATE transactions SET flagged = FALSE WHERE txn_id = ?', [req.params.txnId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/customer/:customerId — Delete a customer and all associated data
app.delete('/api/admin/customer/:customerId', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        // Get customer accounts first
        const [accs] = await conn.query('SELECT id FROM accounts WHERE customer_id = ?', [req.params.customerId]);
        for (const acc of accs) {
            await conn.query('DELETE FROM transactions WHERE account_id = ?', [acc.id]);
            await conn.query('DELETE FROM loans WHERE account_id = ?', [acc.id]);
        }
        await conn.query('DELETE FROM accounts WHERE customer_id = ?', [req.params.customerId]);
        await conn.query('DELETE FROM customers WHERE id = ?', [req.params.customerId]);
        await conn.commit();
        res.json({ success: true });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// PUT /api/admin/reset-pin/:customerId — Admin resets customer PIN
app.put('/api/admin/reset-pin/:customerId', async (req, res) => {
    const { newPin } = req.body;
    if (!newPin || String(newPin).length < 4) return res.status(400).json({ error: 'PIN must be at least 4 digits.' });
    try {
        const [[customer]] = await pool.query('SELECT id FROM customers WHERE id = ?', [req.params.customerId]);
        if (!customer) return res.status(404).json({ error: 'Customer not found.' });
        await pool.query('UPDATE customers SET pin = ? WHERE id = ?', [String(newPin), req.params.customerId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/debit — Admin debits any account
app.post('/api/admin/debit', async (req, res) => {
    const { accountId, amount, description } = req.body;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: 'Invalid amount.' });

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [[account]] = await conn.query('SELECT balance FROM accounts WHERE id = ? FOR UPDATE', [accountId]);
        if (!account) { await conn.rollback(); return res.status(404).json({ error: 'Account not found.' }); }
        if (parseFloat(account.balance) < amt) { await conn.rollback(); return res.status(400).json({ error: 'Insufficient balance.' }); }

        const newBalance = parseFloat(account.balance) - amt;
        await conn.query('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, accountId]);
        await conn.query(
            'INSERT INTO transactions (id, txn_id, account_id, transaction_type, amount, balance_after, description) VALUES (?,?,?,?,?,?,?)',
            [uuidv4(), makeTxnId(), accountId, 'debit', amt, newBalance, description || 'Admin Debit']);

        await conn.commit();
        res.json({ success: true, newBalance });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// GET /api/admin/audit-log
app.get('/api/admin/audit-log', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 50');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* ══════════════════════════════════════════════════════════
   START SERVER
══════════════════════════════════════════════════════════ */
app.listen(PORT, async () => {
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║     ApkaGullak — Full Stack Server     ║');
    console.log(`║   http://localhost:${PORT}               ║`);
    console.log('║   Frontend + API on the same port    ║');
    console.log('╚══════════════════════════════════════╝\n');

    // Test MySQL connection on startup
    try {
        const conn = await pool.getConnection();
        const [[row]] = await conn.query('SELECT DATABASE() AS db');
        conn.release();
        console.log(`✅ MySQL connected — Database: ${row.db}`);
        console.log(`🌐 Open: http://localhost:${PORT}`);
        console.log(`🔗 API:  http://localhost:${PORT}/api/test\n`);
    } catch (err) {
        console.error('❌ MySQL connection FAILED:', err.message);
        console.log('   → Check your .env file credentials\n');
    }
});
