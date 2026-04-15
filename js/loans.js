/* ============================================================
     ApkaGullak — Loan Management Module
   ============================================================ */

const Loans = (() => {

    /* ── Apply for Loan ── */
    function apply(customerId, accountId, loanType, principal, tenureMonths, pin) {
        const account  = DB.accounts.byId(accountId);
        if (!account) return { success: false, error: 'Account not found.' };
        if (account.frozen) return { success: false, error: 'Account is frozen. Cannot apply for a loan.' };

        const customer = DB.customers.byId(customerId);
        if (!customer) return { success: false, error: 'Customer not found.' };

        // PIN verification
        if (customer.pin !== String(pin).trim()) {
            return { success: false, error: 'Incorrect PIN. Loan application rejected.' };
        }

        // Loan type config
        const config = Utils.LOAN_TYPES[loanType];
        if (!config) return { success: false, error: 'Invalid loan type.' };

        const amt = Number(principal);
        const tenure = Number(tenureMonths);

        // Validate amount & tenure
        if (amt < config.min || amt > config.max) {
            return { success: false, error: `Loan amount must be between ${Utils.formatCurrency(config.min)} and ${Utils.formatCurrency(config.max)} for ${loanType} loan.` };
        }
        if (tenure < config.minTenure || tenure > config.maxTenure) {
            return { success: false, error: `Tenure must be between ${config.minTenure} and ${config.maxTenure} months for ${loanType} loan.` };
        }

        // Check account age (must be ≥ 1 month)
        const accountAge = (Date.now() - new Date(account.createdAt).getTime()) / (30 * 24 * 3600 * 1000);
        if (accountAge < 1) {
            return { success: false, error: 'Account must be at least 1 month old to apply for a loan.' };
        }

        // Check for existing active loan of same type
        const existingLoans = DB.loans.active(customerId);
        if (existingLoans.some(l => l.type === loanType)) {
            return { success: false, error: `You already have an active ${loanType} loan. Please close it before applying for a new one.` };
        }

        const emi = Utils.calculateEMI(amt, config.rate, tenure);

        const loan = DB.loans.create({
            id: Utils.generateId(),
            customerId,
            accountId,
            type: loanType,
            principal: amt,
            rate: config.rate,
            tenureMonths: tenure,
            emi: Math.round(emi * 100) / 100,
            startDate: new Date().toISOString(),
            status: 'active',
            paidMonths: 0,
            totalPaid: 0,
        });

        // Credit the loan amount to account
        const newBalance = Math.round((account.balance + amt) * 100) / 100;
        DB.accounts.updateBalance(accountId, newBalance);
        DB.transactions.create({
            id: Utils.generateId(),
            txnId: Utils.generateTransactionId(),
            accountId,
            type: 'credit',
            amount: amt,
            balance: newBalance,
            description: `${loanType} Loan Disbursement — Loan ID: ${loan.id.slice(-8).toUpperCase()}`,
            remarks: '',
            timestamp: new Date().toISOString(),
            flagged: false,
            linkedAccountId: null,
        });

        return { success: true, loan };
    }

    /* ── Get active loans for customer ── */
    function getActiveLoans(customerId) {
        return DB.loans.active(customerId).map(l => ({
            ...l,
            remainingMonths: l.tenureMonths - l.paidMonths,
            remainingAmount: Math.max(0, Math.round((l.tenureMonths - l.paidMonths) * l.emi * 100) / 100),
            progressPercent: Math.round((l.paidMonths / l.tenureMonths) * 100),
            totalCost: Math.round(l.emi * l.tenureMonths * 100) / 100,
            totalInterest: Math.round((l.emi * l.tenureMonths - l.principal) * 100) / 100,
        }));
    }

    /* ── Get all loans (history) for customer ── */
    function getLoanHistory(customerId) {
        return DB.loans.byCustomerId(customerId).map(l => ({
            ...l,
            remainingMonths: Math.max(0, l.tenureMonths - l.paidMonths),
            progressPercent: Math.round((l.paidMonths / l.tenureMonths) * 100),
        }));
    }

    /* ── EMI Calculator (standalone, no application) ── */
    function calculate(principal, rate, tenureMonths) {
        const p = Number(principal);
        const r = Number(rate);
        const n = Number(tenureMonths);
        if (!p || !r || !n) return null;

        const emi           = Utils.calculateEMI(p, r, n);
        const totalCost     = Math.round(emi * n * 100) / 100;
        const totalInterest = Math.round((totalCost - p) * 100) / 100;
        const schedule      = Utils.generateAmortization(p, r, n);

        return { emi, totalCost, totalInterest, schedule };
    }

    /* ── Loan eligibility check ── */
    function checkEligibility(customerId, accountId) {
        const account = DB.accounts.byId(accountId);
        if (!account) return { eligible: false, reason: 'Account not found.' };
        if (account.frozen) return { eligible: false, reason: 'Account is frozen.' };

        const ageMonths = (Date.now() - new Date(account.createdAt).getTime()) / (30 * 24 * 3600 * 1000);
        if (ageMonths < 1) return { eligible: false, reason: 'Account must be at least 1 month old.' };

        return { eligible: true };
    }

    return { apply, getActiveLoans, getLoanHistory, calculate, checkEligibility };
})();
