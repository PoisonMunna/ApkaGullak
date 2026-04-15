/* ============================================================
     ApkaGullak — ATM Simulation Module
   ============================================================ */

const ATM = (() => {
    let state = {
        step: 'welcome',  // welcome | pin | menu | amount | confirm | receipt
        enteredPIN: '',
        selectedAction: null,
        selectedAmount: null,
        customAmount: '',
        account: null,
        customer: null,
        lastTxn: null
    };

    const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

    function reset() {
        state = { step: 'welcome', enteredPIN: '', selectedAction: null, selectedAmount: null, customAmount: '', account: null, customer: null, lastTxn: null };
    }

    function getState() { return state; }

    function insertCard(accountNumber) {
        const account = DB.accounts.byNumber(String(accountNumber));
        if (!account) return { success: false, error: 'Card not recognised. Please try again.' };
        if (account.frozen) return { success: false, error: 'This card is blocked. Contact bank.' };

        state.account  = account;
        state.customer = DB.customers.byId(account.customerId);
        state.step     = 'pin';
        return { success: true };
    }

    function enterPIN(pin) {
        if (!state.customer) return { success: false, error: 'Please insert card first.' };

        if (state.customer.pin !== String(pin)) {
            const result = FraudDetection.handleFailedPIN(state.account.accountNumber);
            if (result.locked) {
                reset();
                return { success: false, error: 'Card blocked after 3 wrong PINs. Contact bank.', locked: true };
            }
            return { success: false, error: `Wrong PIN. ${result.attemptsLeft} attempt(s) left.` };
        }

        DB.failedPins.reset(state.account.accountNumber);
        state.step = 'menu';
        return { success: true };
    }

    function selectAction(action) {
        state.selectedAction = action;
        state.step = action === 'balance' ? 'balance_display' : 'amount';
        return { success: true, balance: action === 'balance' ? state.account.balance : null };
    }

    function selectAmount(amount) {
        const amt = Number(amount);
        if (!amt || amt <= 0) return { success: false, error: 'Invalid amount.' };

        // re-load fresh account balance
        state.account = DB.accounts.byId(state.account.id);

        if (state.selectedAction === 'withdraw') {
            if (amt > state.account.balance) return { success: false, error: 'Insufficient balance.' };
            const limitCheck = FraudDetection.checkWithdrawalLimit(state.account.id, amt);
            if (!limitCheck.allowed) return { success: false, error: limitCheck.reason };
            const minBal = FraudDetection.checkMinBalance(state.account, amt);
            if (!minBal.allowed) return { success: false, error: minBal.reason };
        }

        state.selectedAmount = amt;
        state.step = 'confirm';
        return { success: true };
    }

    function confirm() {
        if (!state.account || !state.selectedAmount) return { success: false, error: 'Session expired.' };

        let result;
        if (state.selectedAction === 'withdraw') {
            result = Transactions.withdraw(
                state.account.id, state.selectedAmount,
                state.customer.pin, 'ATM Withdrawal'
            );
        } else if (state.selectedAction === 'deposit') {
            result = Transactions.deposit(
                state.account.id, state.selectedAmount, 'ATM Cash Deposit'
            );
        }

        if (!result || !result.success) {
            return { success: false, error: result?.error || 'Transaction failed.' };
        }

        state.lastTxn = result.transaction;
        state.account = DB.accounts.byId(state.account.id); // refresh
        state.step = 'receipt';
        return { success: true, txn: result.transaction, newBalance: result.newBalance };
    }

    function eject() {
        const customerName = state.customer?.name;
        reset();
        return { success: true, message: `Thank you, ${customerName}! Have a great day.` };
    }

    return { reset, getState, insertCard, enterPIN, selectAction, selectAmount, confirm, eject, QUICK_AMOUNTS };
})();
