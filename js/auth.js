/* ============================================================
     ApkaGullak — Authentication Module
   ============================================================ */

const Auth = (() => {

    /* ── Customer Login ── */
    function loginCustomer(accountNumber, pin) {
        // Check lock
        if (DB.failedPins.isLocked(accountNumber)) {
            return { success: false, error: 'Account is temporarily locked due to multiple failed PIN attempts. Try again in 15 minutes.' };
        }

        const account = DB.accounts.byNumber(accountNumber);
        if (!account) {
            return { success: false, error: 'Account number not found. Please check and try again.' };
        }

        if (account.frozen) {
            return { success: false, error: 'This account is frozen. Please contact   ApkaGullak support.' };
        }

        const customer = DB.customers.byId(account.customerId);
        if (!customer) {
            return { success: false, error: 'Customer record not found. Please contact support.' };
        }

        if (customer.pin !== String(pin).trim()) {
            const failResult = FraudDetection.handleFailedPIN(accountNumber);
            if (failResult.locked) {
                return { success: false, error: failResult.message };
            }
            return { success: false, error: `Incorrect PIN. ${failResult.attemptsLeft} attempt(s) remaining.` };
        }

        if (customer.status !== 'active') {
            return { success: false, error: 'Your account is inactive. Please contact support.' };
        }

        // Reset failed PINs on success
        DB.failedPins.reset(accountNumber);

        // Create session
        const sessionData = {
            type: 'customer',
            customerId: customer.id,
            accountId: account.id,
            accountNumber: account.accountNumber,
            name: customer.name,
            loginAt: new Date().toISOString()
        };
        DB.session.set(sessionData);

        return { success: true, session: sessionData };
    }

    /* ── Admin Login ── */
    function loginAdmin(username, password) {
        // Admin credentials are now securely managed via the backend / .env file.
        // Local fallback login is deliberately disabled for security.
        return { success: false, error: 'Admin login requires server connection.' };
    }

    /* ── Register Customer ── */
    function registerCustomer(formData) {
        const errors = validateRegistration(formData);
        if (errors.length) return { success: false, errors };

        // Check phone uniqueness
        if (DB.customers.byPhone(formData.phone)) {
            return { success: false, errors: ['A customer with this phone number already exists.'] };
        }

        // Create customer record
        const customerId = Utils.generateId();
        const customer = {
            id: customerId,
            name: Utils.titleCase(formData.name.trim()),
            dob: formData.dob,
            phone: formData.phone.trim(),
            email: formData.email.trim().toLowerCase(),
            address: formData.address.trim(),
            pan: formData.pan.trim().toUpperCase(),
            aadhaar: formData.aadhaar.trim(),
            pin: formData.pin.trim(),
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        // Generate unique account number
        let accountNumber;
        do { accountNumber = Utils.generateAccountNumber(); }
        while (DB.accounts.byNumber(accountNumber));

        const account = {
            id: Utils.generateId(),
            customerId,
            accountNumber: String(accountNumber),
            type: formData.accountType || 'Savings',
            balance: Number(formData.initialDeposit) || 0,
            createdAt: new Date().toISOString(),
            frozen: false,
            ifsc: 'SECB0001234',
            branch: 'Main Branch'
        };

        DB.customers.create(customer);
        DB.accounts.create(account);

        // Record initial deposit as a transaction if > 0
        if (account.balance > 0) {
            DB.transactions.create({
                id: Utils.generateId(),
                txnId: Utils.generateTransactionId(),
                accountId: account.id,
                type: 'credit',
                amount: account.balance,
                balance: account.balance,
                description: 'Account Opening — Initial Deposit',
                timestamp: new Date().toISOString(),
                flagged: false,
                linkedAccountId: null,
                remarks: ''
            });
        }

        return { success: true, customer, account };
    }

    /* ── Validation ── */
    function validateRegistration(data) {
        const errors = [];
        if (!data.name || data.name.trim().length < 3) errors.push('Full name must be at least 3 characters.');
        if (!data.dob) errors.push('Date of birth is required.');
        else {
            const age = Math.floor((Date.now() - new Date(data.dob)) / (365.25 * 24 * 3600 * 1000));
            if (age < 18) errors.push('Customers must be at least 18 years old.');
        }
        if (!Utils.validatePhone(data.phone)) errors.push('Enter a valid 10-digit Indian mobile number.');
        if (!Utils.validateEmail(data.email)) errors.push('Enter a valid email address.');
        if (!data.address || data.address.trim().length < 10) errors.push('Please enter a complete address.');
        if (!Utils.validatePAN(data.pan)) errors.push('Enter a valid PAN number (e.g. ABCDE1234F).');
        if (!data.aadhaar || !/^\d{4}\s?\d{4}\s?\d{4}$/.test(data.aadhaar.replace(/\s/g, ''))) errors.push('Enter a valid 12-digit Aadhaar number.');
        if (!Utils.validatePIN(data.pin)) errors.push('PIN must be 4–6 digits.');
        if (data.pin !== data.confirmPin) errors.push('PINs do not match.');
        const deposit = Number(data.initialDeposit);
        if (isNaN(deposit) || deposit < 500) errors.push('Minimum initial deposit is ₹500.');
        return errors;
    }

    /* ── Logout ── */
    function logout() {
        DB.session.clear();
    }

    /* ── Change PIN ── */
    function changePIN(customerId, oldPin, newPin, confirmPin) {
        const customer = DB.customers.byId(customerId);
        if (!customer) return { success: false, error: 'Customer not found.' };
        if (customer.pin !== String(oldPin)) return { success: false, error: 'Current PIN is incorrect.' };
        if (!Utils.validatePIN(newPin)) return { success: false, error: 'New PIN must be 4–6 digits.' };
        if (newPin !== confirmPin) return { success: false, error: 'New PINs do not match.' };
        if (oldPin === newPin) return { success: false, error: 'New PIN must be different from current PIN.' };
        DB.customers.update(customerId, { pin: newPin });
        return { success: true };
    }

    /* ── Get current session info ── */
    function getSession() { return DB.session.get(); }

    function requireAuth() {
        const s = getSession();
        if (!s) { Router.navigate('login'); return null; }
        return s;
    }

    function requireAdmin() {
        const s = getSession();
        if (!s || s.type !== 'admin') { Router.navigate('login'); return null; }
        return s;
    }

    return { loginCustomer, loginAdmin, registerCustomer, validateRegistration, logout, changePIN, getSession, requireAuth, requireAdmin };
})();
