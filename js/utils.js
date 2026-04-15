/* ============================================================
     ApkaGullak — Utility Functions
   ============================================================ */

const Utils = {

    /* ── Currency Formatting ── */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Number(amount) || 0);
    },

    formatCurrencyShort(amount) {
        const n = Number(amount) || 0;
        if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + 'Cr';
        if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2) + 'L';
        if (n >= 1e3) return '₹' + (n / 1e3).toFixed(1) + 'K';
        return '₹' + n.toFixed(2);
    },

    /* ── Date Formatting ── */
    formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    },

    formatDateTime(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    },

    formatTime(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    },

    timeAgo(dateStr) {
        const now = Date.now();
        const then = new Date(dateStr).getTime();
        const diff = Math.floor((now - then) / 1000);
        if (diff < 60)    return 'Just now';
        if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    },

    /* ── ID / Number Generation ── */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    },

    generateAccountNumber() {
        const prefix = '5000';
        const mid = Math.floor(10000 + Math.random() * 90000);
        const end = Math.floor(100 + Math.random() * 900);
        return prefix + mid + end;
    },

    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },

    generateTransactionId() {
        const ts = Date.now().toString(36).toUpperCase();
        const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
        return 'TXN' + ts + rnd;
    },

    /* ── Validators ── */
    validatePhone(phone) {
        return /^[6-9]\d{9}$/.test(String(phone).trim());
    },

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
    },

    validatePIN(pin) {
        return /^\d{4,6}$/.test(String(pin).trim());
    },

    validatePAN(pan) {
        return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(String(pan).toUpperCase().trim());
    },

    validateAmount(amount, min = 1, max = 1000000) {
        const n = Number(amount);
        return !isNaN(n) && n >= min && n <= max;
    },

    /* ── String Helpers ── */
    sanitize(str) {
        return String(str).replace(/[<>&"'`]/g, c => ({
            '<': '&lt;', '>': '&gt;', '&': '&amp;',
            '"': '&quot;', "'": '&#039;', '`': '&#96;'
        }[c]));
    },

    maskAccountNumber(accNo) {
        const s = String(accNo);
        return s.substring(0, 4) + ' **** **** ' + s.slice(-4);
    },

    capitalize(str) {
        return String(str).charAt(0).toUpperCase() + String(str).slice(1).toLowerCase();
    },

    titleCase(str) {
        return String(str).split(' ').map(w => Utils.capitalize(w)).join(' ');
    },

    initials(name) {
        return String(name).split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    },

    /* ── Financial Calculations ── */
    calculateEMI(principal, annualRate, tenureMonths) {
        const p = Number(principal);
        const r = Number(annualRate) / 100 / 12;
        const n = Number(tenureMonths);
        if (r === 0) return Math.round((p / n) * 100) / 100;
        const emi = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        return Math.round(emi * 100) / 100;
    },

    calculateTotalLoanCost(emi, tenure) {
        return Math.round(emi * tenure * 100) / 100;
    },

    calculateTotalInterest(principal, emi, tenure) {
        return Math.round((emi * tenure - principal) * 100) / 100;
    },

    generateAmortization(principal, annualRate, tenureMonths) {
        const emi = this.calculateEMI(principal, annualRate, tenureMonths);
        const r   = Number(annualRate) / 100 / 12;
        let balance = Number(principal);
        const schedule = [];
        for (let i = 1; i <= tenureMonths; i++) {
            const interest      = Math.round(balance * r * 100) / 100;
            const principalPaid = Math.round((emi - interest) * 100) / 100;
            balance = Math.max(0, Math.round((balance - principalPaid) * 100) / 100);
            schedule.push({ month: i, emi, principal: principalPaid, interest, balance });
        }
        return schedule;
    },

    /* ── DOM Helpers ── */
    qs(selector, scope = document) {
        return scope.querySelector(selector);
    },

    qsa(selector, scope = document) {
        return [...scope.querySelectorAll(selector)];
    },

    /* ── Animated Counter ── */
    animateCounter(el, from, to, duration = 1200) {
        if (!el) return;
        const startTime = performance.now();
        const range = to - from;

        const step = (now) => {
            const elapsed  = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            const current  = from + range * eased;

            el.textContent = new Intl.NumberFormat('en-IN', {
                style: 'currency', currency: 'INR',
                minimumFractionDigits: 0, maximumFractionDigits: 0
            }).format(current);

            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    },

    /* ── Debounce ── */
    debounce(fn, delay = 300) {
        let t;
        return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
    },

    /* ── Export CSV ── */
    exportCSV(data, filename = 'export.csv') {
        if (!data.length) return;
        const headers = Object.keys(data[0]);
        const rows = data.map(r => headers.map(h => `"${String(r[h]).replace(/"/g, '""')}"`).join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
    },

    /* ── Copy ── */
    async copyToClipboard(text) {
        try { await navigator.clipboard.writeText(text); return true; }
        catch { return false; }
    },

    /* ── Loan type config ── */
    LOAN_TYPES: {
        Personal:  { rate: 12.0, minTenure: 6,  maxTenure: 60,  min: 10000,  max: 1000000,  icon: 'user' },
        Home:      { rate: 8.5,  minTenure: 12, maxTenure: 240, min: 100000, max: 10000000, icon: 'home' },
        Auto:      { rate: 9.5,  minTenure: 12, maxTenure: 84,  min: 50000,  max: 3000000,  icon: 'car' },
        Education: { rate: 7.0,  minTenure: 12, maxTenure: 120, min: 10000,  max: 2000000,  icon: 'graduation-cap' },
    }
};
