-- ============================================================
--  SecureBank — MySQL Database Schema (CORRECTED)
--  DBMS Project | MySQL 8.0+
--  Run in MySQL Workbench or via: mysql -u root -p < database.sql
-- ============================================================

-- ── Allow stored functions with binary logging enabled ──────
SET GLOBAL log_bin_trust_function_creators = 1;

-- ── Create and select database ──────────────────────────────
CREATE DATABASE IF NOT EXISTS securebank
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE securebank;

-- ============================================================
--  DROP EXISTING OBJECTS (safe re-run)
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TRIGGER  IF EXISTS trg_flag_large_transaction;
DROP TRIGGER  IF EXISTS trg_audit_account_freeze;
DROP TRIGGER  IF EXISTS trg_audit_customer_status;

DROP VIEW     IF EXISTS v_customer_summary;
DROP VIEW     IF EXISTS v_transaction_report;
DROP VIEW     IF EXISTS v_loan_status;

DROP PROCEDURE IF EXISTS sp_transfer_funds;
DROP FUNCTION  IF EXISTS fn_calculate_emi;

DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS failed_pin_attempts;
DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS admins;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
--  TABLE 1: customers
--  Stores personal and KYC information of each bank customer
-- ============================================================
CREATE TABLE customers (
    id          VARCHAR(36)   NOT NULL,
    name        VARCHAR(100)  NOT NULL,
    dob         DATE          NOT NULL,
    phone       VARCHAR(15)   NOT NULL,
    email       VARCHAR(100)  NOT NULL,
    address     TEXT          NOT NULL,
    pan         VARCHAR(10)   NOT NULL,
    aadhaar     VARCHAR(15)   NOT NULL,
    pin         VARCHAR(10)   NOT NULL,
    status      ENUM('active','inactive') NOT NULL DEFAULT 'active',
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Primary Key
    CONSTRAINT pk_customers PRIMARY KEY (id),

    -- Unique Constraints
    CONSTRAINT uq_customers_phone UNIQUE (phone),
    CONSTRAINT uq_customers_email UNIQUE (email),
    CONSTRAINT uq_customers_pan   UNIQUE (pan)

    -- NOTE: REGEXP CHECK constraints removed for broad MySQL 8.0 compatibility.
    --       Validation is enforced at the application layer (server.js).
) ENGINE=InnoDB COMMENT='Stores customer personal and KYC details';

-- ============================================================
--  TABLE 2: accounts
--  Stores bank account details linked to each customer
-- ============================================================
CREATE TABLE accounts (
    id             VARCHAR(36)   NOT NULL,
    customer_id    VARCHAR(36)   NOT NULL,
    account_number VARCHAR(20)   NOT NULL,
    account_type   ENUM('Savings','Current') NOT NULL DEFAULT 'Savings',
    balance        DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    frozen         TINYINT(1)    NOT NULL DEFAULT 0,
    frozen_reason  VARCHAR(255)  DEFAULT NULL,
    frozen_at      DATETIME      DEFAULT NULL,
    ifsc           VARCHAR(20)   NOT NULL DEFAULT 'SECB0001234',
    branch         VARCHAR(100)  NOT NULL DEFAULT 'Main Branch',
    created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Primary Key
    CONSTRAINT pk_accounts PRIMARY KEY (id),

    -- Unique Constraint
    CONSTRAINT uq_accounts_number UNIQUE (account_number),

    -- Foreign Key
    CONSTRAINT fk_accounts_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Check Constraint (balance must be non-negative)
    CONSTRAINT chk_accounts_balance CHECK (balance >= 0),

    -- Indexes for faster lookups
    INDEX idx_accounts_customer_id    (customer_id),
    INDEX idx_accounts_account_number (account_number)
) ENGINE=InnoDB COMMENT='Stores bank accounts linked to customers';

-- ============================================================
--  TABLE 3: transactions
--  Records every financial event (credit/debit) on an account
-- ============================================================
CREATE TABLE transactions (
    id                VARCHAR(36)   NOT NULL,
    txn_id            VARCHAR(50)   NOT NULL,
    account_id        VARCHAR(36)   NOT NULL,
    transaction_type  ENUM('credit','debit') NOT NULL,
    amount            DECIMAL(15,2) NOT NULL,
    balance_after     DECIMAL(15,2) NOT NULL,
    description       VARCHAR(255)  NOT NULL DEFAULT 'Transaction',
    remarks           VARCHAR(255)  DEFAULT '',
    flagged           TINYINT(1)    NOT NULL DEFAULT 0,
    linked_account_id VARCHAR(36)   DEFAULT NULL,
    created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Primary Key
    CONSTRAINT pk_transactions PRIMARY KEY (id),

    -- Unique TXN ID
    CONSTRAINT uq_transactions_txn_id UNIQUE (txn_id),

    -- Foreign Key
    CONSTRAINT fk_transactions_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(id)
        ON DELETE CASCADE,

    -- Check: amount must be positive
    CONSTRAINT chk_transactions_amount CHECK (amount > 0),

    -- Indexes
    INDEX idx_transactions_account_id (account_id),
    INDEX idx_transactions_created_at (created_at),
    INDEX idx_transactions_flagged    (flagged),
    INDEX idx_transactions_type       (transaction_type)
) ENGINE=InnoDB COMMENT='Records all credits and debits per account';

-- ============================================================
--  TABLE 4: loans
--  Loan lifecycle management per customer
-- ============================================================
CREATE TABLE loans (
    id             VARCHAR(36)   NOT NULL,
    customer_id    VARCHAR(36)   NOT NULL,
    account_id     VARCHAR(36)   NOT NULL,
    loan_type      ENUM('Personal','Home','Auto','Education') NOT NULL,
    principal      DECIMAL(15,2) NOT NULL,
    interest_rate  DECIMAL(5,2)  NOT NULL,
    tenure_months  INT           NOT NULL,
    emi            DECIMAL(15,2) NOT NULL,
    start_date     DATE          NOT NULL,
    status         ENUM('active','closed') NOT NULL DEFAULT 'active',
    paid_months    INT           NOT NULL DEFAULT 0,
    total_paid     DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Primary Key
    CONSTRAINT pk_loans PRIMARY KEY (id),

    -- Foreign Keys
    CONSTRAINT fk_loans_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id),
    CONSTRAINT fk_loans_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(id),

    -- Check Constraints
    CONSTRAINT chk_loans_principal   CHECK (principal > 0),
    CONSTRAINT chk_loans_tenure      CHECK (tenure_months > 0),
    CONSTRAINT chk_loans_paid_months CHECK (paid_months >= 0),

    -- Indexes
    INDEX idx_loans_customer_id (customer_id),
    INDEX idx_loans_status      (status)
) ENGINE=InnoDB COMMENT='Loan details with EMI and repayment tracking';

-- ============================================================
--  TABLE 5: failed_pin_attempts  (Brute-force protection)
-- ============================================================
CREATE TABLE failed_pin_attempts (
    id             INT         NOT NULL AUTO_INCREMENT,
    account_number VARCHAR(20) NOT NULL,
    attempt_count  INT         NOT NULL DEFAULT 0,
    locked_until   DATETIME    DEFAULT NULL,
    last_attempt   DATETIME    DEFAULT NULL,

    CONSTRAINT pk_failed_pins PRIMARY KEY (id),
    CONSTRAINT uq_failed_pins UNIQUE (account_number)
) ENGINE=InnoDB COMMENT='Tracks failed PIN attempts for brute-force protection';

-- ============================================================
--  TABLE 6: admins
-- ============================================================
CREATE TABLE admins (
    id         INT          NOT NULL AUTO_INCREMENT,
    username   VARCHAR(50)  NOT NULL,
    password   VARCHAR(255) NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_admins          PRIMARY KEY (id),
    CONSTRAINT uq_admins_username UNIQUE (username)
) ENGINE=InnoDB COMMENT='Admin login credentials';

-- ============================================================
--  TABLE 7: audit_log  (Populated by triggers automatically)
-- ============================================================
CREATE TABLE audit_log (
    id           INT         NOT NULL AUTO_INCREMENT,
    action_type  VARCHAR(50) NOT NULL,
    table_name   VARCHAR(50) NOT NULL,
    record_id    VARCHAR(36) DEFAULT NULL,
    old_value    TEXT        DEFAULT NULL,
    new_value    TEXT        DEFAULT NULL,
    performed_by VARCHAR(50) NOT NULL DEFAULT 'system',
    created_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_audit_log PRIMARY KEY (id),
    INDEX idx_audit_table  (table_name),
    INDEX idx_audit_action (action_type)
) ENGINE=InnoDB COMMENT='Audit trail for all critical data changes';

-- ============================================================
--  FUNCTION: fn_calculate_emi
--  EMI = P x r x (1+r)^n  /  ((1+r)^n - 1)
--  Must be created BEFORE TRIGGERS and INSERTS that use it
-- ============================================================
DELIMITER $$

CREATE FUNCTION fn_calculate_emi(
    principal      DECIMAL(15,2),
    annual_rate    DECIMAL(5,2),
    tenure_months  INT
)
RETURNS DECIMAL(15,2)
DETERMINISTIC
BEGIN
    DECLARE monthly_rate DECIMAL(10,8);
    DECLARE emi          DECIMAL(15,2);

    SET monthly_rate = annual_rate / 100.0 / 12.0;

    IF monthly_rate = 0 THEN
        SET emi = principal / tenure_months;
    ELSE
        SET emi = principal
                  * monthly_rate
                  * POW(1.0 + monthly_rate, tenure_months)
                  / (POW(1.0 + monthly_rate, tenure_months) - 1.0);
    END IF;

    RETURN ROUND(emi, 2);
END$$

-- ============================================================
--  TRIGGER 1: Auto-flag large transactions (> 75000)
--  Fires BEFORE INSERT on transactions
-- ============================================================
CREATE TRIGGER trg_flag_large_transaction
BEFORE INSERT ON transactions
FOR EACH ROW
BEGIN
    IF NEW.amount > 75000 THEN
        SET NEW.flagged = 1;
    END IF;
END$$

-- ============================================================
--  TRIGGER 2: Audit account freeze / unfreeze
--  Fires AFTER UPDATE on accounts
-- ============================================================
CREATE TRIGGER trg_audit_account_freeze
AFTER UPDATE ON accounts
FOR EACH ROW
BEGIN
    IF OLD.frozen <> NEW.frozen THEN
        INSERT INTO audit_log
            (action_type, table_name, record_id, old_value, new_value, performed_by)
        VALUES (
            IF(NEW.frozen = 1, 'ACCOUNT_FROZEN', 'ACCOUNT_UNFROZEN'),
            'accounts',
            NEW.id,
            CONCAT('frozen=', OLD.frozen),
            CONCAT('frozen=', NEW.frozen, ' | reason=', IFNULL(NEW.frozen_reason, 'N/A')),
            'system'
        );
    END IF;
END$$

-- ============================================================
--  TRIGGER 3: Audit customer status change
--  Fires AFTER UPDATE on customers
-- ============================================================
CREATE TRIGGER trg_audit_customer_status
AFTER UPDATE ON customers
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO audit_log
            (action_type, table_name, record_id, old_value, new_value)
        VALUES (
            'CUSTOMER_STATUS_CHANGE',
            'customers',
            NEW.id,
            CONCAT('status=', OLD.status),
            CONCAT('status=', NEW.status)
        );
    END IF;
END$$

-- ============================================================
--  STORED PROCEDURE: sp_transfer_funds
--  Atomically debits source and credits destination account.
--  Uses START TRANSACTION + FOR UPDATE row-level locking.
--  OUT params: p_success (1/0), p_message (VARCHAR)
-- ============================================================
CREATE PROCEDURE sp_transfer_funds(
    IN  p_from_account_id VARCHAR(36),
    IN  p_to_account_id   VARCHAR(36),
    IN  p_amount          DECIMAL(15,2),
    IN  p_desc_from       VARCHAR(255),
    IN  p_desc_to         VARCHAR(255),
    IN  p_txn_id          VARCHAR(50),
    OUT p_success         TINYINT,
    OUT p_message         VARCHAR(255)
)
BEGIN
    -- ── Variable declarations (must come FIRST in MySQL) ─────
    DECLARE v_from_balance DECIMAL(15,2) DEFAULT 0;
    DECLARE v_to_balance   DECIMAL(15,2) DEFAULT 0;
    DECLARE v_from_frozen  TINYINT       DEFAULT 0;
    DECLARE v_from_type    VARCHAR(20)   DEFAULT '';
    DECLARE v_new_from_bal DECIMAL(15,2) DEFAULT 0;
    DECLARE v_new_to_bal   DECIMAL(15,2) DEFAULT 0;

    -- ── EXIT HANDLER must be declared AFTER variables, BEFORE any SET ──
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = 0;
        SET p_message = 'A database error occurred. Transaction rolled back.';
    END;

    -- ── Initialise OUT params (executable statements start here) ──
    SET p_success = 0;
    SET p_message = '';

    START TRANSACTION;

    -- ── Row-level locks (ACID Isolation) ─────────────────────
    SELECT balance, frozen, account_type
    INTO   v_from_balance, v_from_frozen, v_from_type
    FROM   accounts
    WHERE  id = p_from_account_id
    FOR UPDATE;

    SELECT balance
    INTO   v_to_balance
    FROM   accounts
    WHERE  id = p_to_account_id
    FOR UPDATE;

    -- ── Business rule validations ─────────────────────────────
    IF v_from_frozen = 1 THEN
        SET p_success = 0;
        SET p_message = 'Source account is frozen. Contact support.';
        ROLLBACK;

    ELSEIF v_from_balance < p_amount THEN
        SET p_success = 0;
        SET p_message = 'Insufficient balance.';
        ROLLBACK;

    ELSEIF v_from_type = 'Savings' AND (v_from_balance - p_amount) < 500 THEN
        SET p_success = 0;
        SET p_message = 'Savings account must maintain minimum balance of Rs.500.';
        ROLLBACK;

    ELSE
        SET v_new_from_bal = v_from_balance - p_amount;
        SET v_new_to_bal   = v_to_balance   + p_amount;

        -- ── Atomic balance updates (ACID Atomicity) ───────────
        UPDATE accounts
        SET    balance     = v_new_from_bal,
               updated_at  = NOW()
        WHERE  id = p_from_account_id;

        UPDATE accounts
        SET    balance     = v_new_to_bal,
               updated_at  = NOW()
        WHERE  id = p_to_account_id;

        -- ── Debit record for sender ───────────────────────────
        INSERT INTO transactions
            (id, txn_id, account_id, transaction_type,
             amount, balance_after, description, linked_account_id)
        VALUES
            (UUID(), p_txn_id, p_from_account_id, 'debit',
             p_amount, v_new_from_bal, p_desc_from, p_to_account_id);

        -- ── Credit record for receiver ────────────────────────
        INSERT INTO transactions
            (id, txn_id, account_id, transaction_type,
             amount, balance_after, description, linked_account_id)
        VALUES
            (UUID(), CONCAT(p_txn_id, '_R'), p_to_account_id, 'credit',
             p_amount, v_new_to_bal, p_desc_to, p_from_account_id);

        COMMIT;
        SET p_success = 1;
        SET p_message = 'Transfer successful.';
    END IF;
END$$

DELIMITER ;

-- ============================================================
--  DUMMY DATA — Admin
-- ============================================================
INSERT INTO admins (username, password)
VALUES ('admin', 'admin123');

-- ============================================================
--  DUMMY DATA — 5 Customers
-- ============================================================
INSERT INTO customers
    (id, name, dob, phone, email, address, pan, aadhaar, pin, status, created_at)
VALUES
('cust_001', 'Rajesh Kumar Sharma', '1985-03-15', '9876543210',
 'rajesh.sharma@email.com',
 '45, MG Road, Bengaluru, Karnataka - 560001',
 'ABCPS1234K', '123456789012', '1234', 'active',
 DATE_SUB(NOW(), INTERVAL 6 MONTH)),

('cust_002', 'Priya Devi Nair', '1992-07-22', '8765432109',
 'priya.nair@email.com',
 '12, Nehru Street, Chennai, Tamil Nadu - 600001',
 'BCDPN5678L', '234567890123', '5678', 'active',
 DATE_SUB(NOW(), INTERVAL 6 MONTH)),

('cust_003', 'Amit Singh Rawat', '1978-11-08', '7654321098',
 'amit.rawat@email.com',
 '78, Civil Lines, New Delhi - 110001',
 'CDQAS9012M', '345678901234', '9012', 'active',
 DATE_SUB(NOW(), INTERVAL 6 MONTH)),

('cust_004', 'Sunita Patel Mehta', '1990-05-14', '9988776655',
 'sunita.patel@email.com',
 '22, Linking Road, Mumbai, Maharashtra - 400050',
 'DEFSP3456N', '456789012345', '4321', 'active',
 DATE_SUB(NOW(), INTERVAL 3 MONTH)),

('cust_005', 'Vikram Reddy Naidu', '1983-09-30', '9123456780',
 'vikram.reddy@email.com',
 '5, Banjara Hills, Hyderabad, Telangana - 500034',
 'EFGVR7890O', '567890123456', '8765', 'active',
 DATE_SUB(NOW(), INTERVAL 4 MONTH));

-- ============================================================
--  DUMMY DATA — 5 Accounts (one per customer)
-- ============================================================
INSERT INTO accounts
    (id, customer_id, account_number, account_type, balance, ifsc, branch, created_at)
VALUES
('acc_001','cust_001','500012345678','Savings',  85420.50,'SECB0001234','Bengaluru Main',          DATE_SUB(NOW(), INTERVAL 6 MONTH)),
('acc_002','cust_002','500087654321','Savings',  42150.00,'SECB0001234','Chennai Anna Salai',      DATE_SUB(NOW(), INTERVAL 6 MONTH)),
('acc_003','cust_003','500011223344','Current', 215000.00,'SECB0001234','Delhi Connaught Place',   DATE_SUB(NOW(), INTERVAL 6 MONTH)),
('acc_004','cust_004','500055667788','Savings',  31500.75,'SECB0001234','Mumbai Bandra',           DATE_SUB(NOW(), INTERVAL 3 MONTH)),
('acc_005','cust_005','500099887766','Current', 128750.00,'SECB0001234','Hyderabad Banjara Hills', DATE_SUB(NOW(), INTERVAL 4 MONTH));

-- ============================================================
--  DUMMY DATA — Transactions (acc_001 — Rajesh Kumar Sharma)
-- ============================================================
INSERT INTO transactions
    (id, txn_id, account_id, transaction_type, amount, balance_after, description, flagged, created_at)
VALUES
(UUID(),'TXN001A','acc_001','credit', 55000.00,140420.50,'Salary Credit - TechCorp Pvt Ltd',        0, DATE_SUB(NOW(), INTERVAL 175 DAY)),
(UUID(),'TXN002A','acc_001','debit',   2499.00,137921.50,'Amazon India - Online Purchase',           0, DATE_SUB(NOW(), INTERVAL 168 DAY)),
(UUID(),'TXN003A','acc_001','debit',   1850.00,136071.50,'BESCOM Electricity Bill',                  0, DATE_SUB(NOW(), INTERVAL 160 DAY)),
(UUID(),'TXN004A','acc_001','credit',  5000.00,141071.50,'Transfer Received from Priya Nair',        0, DATE_SUB(NOW(), INTERVAL 150 DAY)),
(UUID(),'TXN005A','acc_001','debit',  10000.00,131071.50,'ATM Cash Withdrawal',                      0, DATE_SUB(NOW(), INTERVAL 140 DAY)),
(UUID(),'TXN006A','acc_001','credit',   320.50,131392.00,'Quarterly Savings Interest Credit',        0, DATE_SUB(NOW(), INTERVAL 130 DAY)),
(UUID(),'TXN007A','acc_001','debit',   3240.00,128152.00,'More Supermarket - Weekly Grocery',        0, DATE_SUB(NOW(), INTERVAL 120 DAY)),
(UUID(),'TXN008A','acc_001','debit',    299.00,127853.00,'Jio Fiber Monthly Recharge',               0, DATE_SUB(NOW(), INTERVAL 115 DAY)),
(UUID(),'TXN009A','acc_001','credit', 55000.00,182853.00,'Salary Credit - TechCorp Pvt Ltd',        0, DATE_SUB(NOW(), INTERVAL 90 DAY)),
(UUID(),'TXN010A','acc_001','debit',  80000.00,102853.00,'Fixed Deposit - SB Mutual Fund',           1, DATE_SUB(NOW(), INTERVAL 80 DAY)),
(UUID(),'TXN011A','acc_001','debit',    799.00,102054.00,'Netflix India Subscription',               0, DATE_SUB(NOW(), INTERVAL 65 DAY)),
(UUID(),'TXN012A','acc_001','credit', 55000.00,157054.00,'Salary Credit - TechCorp Pvt Ltd',        0, DATE_SUB(NOW(), INTERVAL 30 DAY)),
(UUID(),'TXN013A','acc_001','debit',  12000.00,145054.00,'Reliance Petrol Station',                  0, DATE_SUB(NOW(), INTERVAL 25 DAY)),
(UUID(),'TXN014A','acc_001','debit',  59633.50, 85420.50,'Quarterly Advance Tax Payment',            0, DATE_SUB(NOW(), INTERVAL 10 DAY));

-- ============================================================
--  DUMMY DATA — Transactions (acc_002 — Priya Devi Nair)
-- ============================================================
INSERT INTO transactions
    (id, txn_id, account_id, transaction_type, amount, balance_after, description, flagged, created_at)
VALUES
(UUID(),'TXN001B','acc_002','credit', 45000.00, 45000.00,'Account Opening - Initial Deposit',       0, DATE_SUB(NOW(), INTERVAL 180 DAY)),
(UUID(),'TXN002B','acc_002','debit',   5000.00, 40000.00,'Fund Transfer to Rajesh Kumar Sharma',    0, DATE_SUB(NOW(), INTERVAL 150 DAY)),
(UUID(),'TXN003B','acc_002','credit', 42000.00, 82000.00,'Salary Credit - Infosys Ltd',             0, DATE_SUB(NOW(), INTERVAL 90 DAY)),
(UUID(),'TXN004B','acc_002','debit',  12500.00, 69500.00,'House Rent Payment',                      0, DATE_SUB(NOW(), INTERVAL 85 DAY)),
(UUID(),'TXN005B','acc_002','debit',   4999.00, 64501.00,'Myntra Fashion Shopping',                 0, DATE_SUB(NOW(), INTERVAL 70 DAY)),
(UUID(),'TXN006B','acc_002','credit', 42000.00,106501.00,'Salary Credit - Infosys Ltd',             0, DATE_SUB(NOW(), INTERVAL 60 DAY)),
(UUID(),'TXN007B','acc_002','debit',  64351.00, 42150.00,'Multiple Monthly Expenses',               0, DATE_SUB(NOW(), INTERVAL 30 DAY));

-- ============================================================
--  DUMMY DATA — Transactions (acc_003 — Amit Singh Rawat)
-- ============================================================
INSERT INTO transactions
    (id, txn_id, account_id, transaction_type, amount, balance_after, description, flagged, created_at)
VALUES
(UUID(),'TXN001C','acc_003','credit',200000.00,200000.00,'Business Capital Opening Deposit',         1, DATE_SUB(NOW(), INTERVAL 180 DAY)),
(UUID(),'TXN002C','acc_003','debit',  50000.00,150000.00,'Supplier Payment - Mahindra Parts',        0, DATE_SUB(NOW(), INTERVAL 120 DAY)),
(UUID(),'TXN003C','acc_003','credit',115000.00,265000.00,'Customer Receivable - Invoice INV2024',    1, DATE_SUB(NOW(), INTERVAL 60 DAY)),
(UUID(),'TXN004C','acc_003','debit',  50000.00,215000.00,'Vendor B2B Payment - TCS Billing',         0, DATE_SUB(NOW(), INTERVAL 15 DAY));

-- ============================================================
--  DUMMY DATA — Transactions (acc_004 — Sunita Patel Mehta)
-- ============================================================
INSERT INTO transactions
    (id, txn_id, account_id, transaction_type, amount, balance_after, description, flagged, created_at)
VALUES
(UUID(),'TXN001D','acc_004','credit', 10000.00, 10000.00,'Account Opening - Initial Deposit',       0, DATE_SUB(NOW(), INTERVAL 90 DAY)),
(UUID(),'TXN002D','acc_004','credit', 38000.00, 48000.00,'Salary Credit - Wipro Technologies',      0, DATE_SUB(NOW(), INTERVAL 60 DAY)),
(UUID(),'TXN003D','acc_004','debit',  16499.25, 31500.75,'Monthly Living Expenses',                 0, DATE_SUB(NOW(), INTERVAL 30 DAY));

-- ============================================================
--  DUMMY DATA — Transactions (acc_005 — Vikram Reddy Naidu)
-- ============================================================
INSERT INTO transactions
    (id, txn_id, account_id, transaction_type, amount, balance_after, description, flagged, created_at)
VALUES
(UUID(),'TXN001E','acc_005','credit',150000.00,150000.00,'Business Account Opening',                1, DATE_SUB(NOW(), INTERVAL 120 DAY)),
(UUID(),'TXN002E','acc_005','debit',  25000.00,125000.00,'Office Rent Payment Q4',                  0, DATE_SUB(NOW(), INTERVAL 90 DAY)),
(UUID(),'TXN003E','acc_005','credit', 90000.00,215000.00,'Client Payment - Reliance Contract',      1, DATE_SUB(NOW(), INTERVAL 60 DAY)),
(UUID(),'TXN004E','acc_005','debit',  86250.00,128750.00,'GST Payment and Vendor Bills',            0, DATE_SUB(NOW(), INTERVAL 30 DAY));

-- ============================================================
--  DUMMY DATA — Loans
--  Using hardcoded EMI values (pre-calculated) to avoid
--  calling fn_calculate_emi() in INSERT (safer across MySQL configs)
-- ============================================================

-- Rajesh: Active Personal Loan  (200000 @ 12% for 24 months)
-- EMI = fn_calculate_emi(200000, 12, 24) = 9414.69
INSERT INTO loans
    (id, customer_id, account_id, loan_type, principal, interest_rate,
     tenure_months, emi, start_date, status, paid_months, total_paid)
VALUES
('loan_001','cust_001','acc_001','Personal', 200000.00, 12.00, 24,
  9414.69,
  DATE_SUB(CURDATE(), INTERVAL 6 MONTH),
  'active', 6, 56488.14);

-- Amit: Active Home Loan  (2500000 @ 8.5% for 120 months)
-- EMI = fn_calculate_emi(2500000, 8.5, 120) = 30970.15
INSERT INTO loans
    (id, customer_id, account_id, loan_type, principal, interest_rate,
     tenure_months, emi, start_date, status, paid_months, total_paid)
VALUES
('loan_002','cust_003','acc_003','Home', 2500000.00, 8.50, 120,
  30970.15,
  DATE_SUB(CURDATE(), INTERVAL 4 MONTH),
  'active', 4, 123880.60);

-- Priya: Closed Education Loan  (50000 @ 7% for 12 months — fully repaid)
-- EMI = fn_calculate_emi(50000, 7, 12) = 4345.33
INSERT INTO loans
    (id, customer_id, account_id, loan_type, principal, interest_rate,
     tenure_months, emi, start_date, status, paid_months, total_paid)
VALUES
('loan_003','cust_002','acc_002','Education', 50000.00, 7.00, 12,
  4345.33,
  DATE_SUB(CURDATE(), INTERVAL 13 MONTH),
  'closed', 12, 52143.96);

-- Sunita: Active Auto Loan  (500000 @ 9.5% for 60 months)
-- EMI = fn_calculate_emi(500000, 9.5, 60) = 10484.39
INSERT INTO loans
    (id, customer_id, account_id, loan_type, principal, interest_rate,
     tenure_months, emi, start_date, status, paid_months, total_paid)
VALUES
('loan_004','cust_004','acc_004','Auto', 500000.00, 9.50, 60,
  10484.39,
  DATE_SUB(CURDATE(), INTERVAL 2 MONTH),
  'active', 2, 20968.78);

-- ============================================================
--  VIEWS
-- ============================================================

-- VIEW 1: Complete customer snapshot
CREATE OR REPLACE VIEW v_customer_summary AS
SELECT
    c.id                              AS customer_id,
    c.name,
    c.phone,
    c.email,
    c.pan,
    c.status,
    c.created_at                      AS member_since,
    a.id                              AS account_id,
    a.account_number,
    a.account_type,
    a.balance,
    a.frozen,
    a.ifsc,
    a.branch,
    (SELECT COUNT(*)
     FROM transactions t
     WHERE t.account_id = a.id)       AS total_transactions,
    (SELECT COUNT(*)
     FROM loans l
     WHERE l.customer_id = c.id
       AND l.status = 'active')       AS active_loans,
    (SELECT COALESCE(SUM(amount), 0)
     FROM transactions t
     WHERE t.account_id = a.id
       AND t.transaction_type = 'credit') AS total_credits,
    (SELECT COALESCE(SUM(amount), 0)
     FROM transactions t
     WHERE t.account_id = a.id
       AND t.transaction_type = 'debit')  AS total_debits
FROM   customers c
LEFT   JOIN accounts a ON a.customer_id = c.id;

-- VIEW 2: Full transaction report (joins customer name + account number)
-- NOTE: ORDER BY is NOT allowed directly inside a VIEW in MySQL 8.0+.
--       Use ORDER BY in the SELECT query when querying this view instead.
CREATE OR REPLACE VIEW v_transaction_report AS
SELECT
    t.id,
    t.txn_id,
    t.created_at,
    c.name                            AS customer_name,
    a.account_number,
    a.account_type,
    t.transaction_type,
    t.amount,
    t.balance_after,
    t.description,
    t.remarks,
    t.flagged,
    CASE WHEN t.flagged = 1
         THEN 'FLAGGED'
         ELSE 'CLEAR'
    END                               AS fraud_status
FROM   transactions t
JOIN   accounts     a ON a.id = t.account_id
JOIN   customers    c ON c.id = a.customer_id;

-- VIEW 3: Loan status with computed remaining balance and progress
CREATE OR REPLACE VIEW v_loan_status AS
SELECT
    l.id                                                       AS loan_id,
    c.name                                                     AS customer_name,
    a.account_number,
    l.loan_type,
    l.principal,
    l.interest_rate,
    l.tenure_months,
    l.emi,
    l.paid_months,
    (l.tenure_months - l.paid_months)                         AS remaining_months,
    l.total_paid,
    ROUND((l.emi * l.tenure_months) - l.principal, 2)         AS total_interest,
    ROUND(l.emi * (l.tenure_months - l.paid_months), 2)       AS remaining_amount,
    ROUND((l.paid_months / l.tenure_months) * 100.0, 1)       AS progress_percent,
    l.status,
    l.start_date
FROM   loans     l
JOIN   customers c ON c.id = l.customer_id
JOIN   accounts  a ON a.id = l.account_id;

-- ============================================================
--  VERIFICATION QUERIES  (uncomment to test after import)
-- ============================================================
-- SELECT 'customers'    AS tbl, COUNT(*) AS rows FROM customers
-- UNION ALL
-- SELECT 'accounts',    COUNT(*) FROM accounts
-- UNION ALL
-- SELECT 'transactions',COUNT(*) FROM transactions
-- UNION ALL
-- SELECT 'loans',       COUNT(*) FROM loans
-- UNION ALL
-- SELECT 'admins',      COUNT(*) FROM admins;

-- SELECT * FROM v_customer_summary;
-- SELECT * FROM v_transaction_report LIMIT 20;
-- SELECT * FROM v_loan_status;
-- SELECT * FROM audit_log;
-- SELECT fn_calculate_emi(100000, 12, 12) AS sample_emi;
-- CALL sp_transfer_funds('acc_001','acc_002',1000,'Test debit','Test credit','TXNTEST',@ok,@msg);
-- SELECT @ok AS success, @msg AS message;
