/* ============================================================
     ApkaGullak   App Shell, Router & Page Renderers
   MySQL-connected via js/api.js Ã¢â€ â€™ server.js Ã¢â€ â€™ MySQL
   ============================================================ */

/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
   UI HELPERS
Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */
const UI = {
    toast(type, title, message = '', duration = 4000) {
        const icons = { success: 'check-circle', error: 'x-circle', warning: 'alert-triangle', info: 'info' };
        const tc = document.getElementById('toast-container');
        const id = Utils.generateId();
        const el = document.createElement('div');
        el.className = `toast toast-${type}`;
        el.id = `toast-${id}`;
        el.innerHTML = `
            <div class="toast-icon"><i data-lucide="${icons[type]}" width="16" height="16"></i></div>
            <div class="toast-body">
                <div class="toast-title">${Utils.sanitize(title)}</div>
                ${message ? `<div class="toast-msg">${Utils.sanitize(message)}</div>` : ''}
            </div>`;
        tc.appendChild(el);
        if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [el] });
        setTimeout(() => {
            el.classList.add('removing');
            setTimeout(() => el.remove(), 350);
        }, duration);
    },

    openModal(html, large = false) {
        const overlay = document.getElementById('modal-overlay');
        const box     = document.getElementById('modal-box');
        const content = document.getElementById('modal-content');
        if (large) box.classList.add('modal-lg');
        else       box.classList.remove('modal-lg');
        content.innerHTML = html;
        overlay.classList.remove('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [overlay] });
    },

    closeModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
        document.getElementById('modal-content').innerHTML = '';
    },

    setLoading(btn, loading) {
        if (!btn) return;
        if (loading) {
            btn.dataset.origText = btn.innerHTML;
            btn.innerHTML = `<span class="btn-spinner"></span> Processing...`;
            btn.disabled = true;
        } else {
            btn.innerHTML = btn.dataset.origText || 'Submit';
            btn.disabled = false;
        }
    },

    renderIcons() {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};

/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
   ROUTER
Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */
const Router = {
    PUBLIC_ROUTES: new Set(['login', 'register']),
    ADMIN_ROUTES:  new Set(['admin']),

    navigate(hash) { window.location.hash = '#' + hash; },

    current() { return (window.location.hash.slice(1) || 'login').split('?')[0]; },

    render() {
        const route   = Router.current();
        const session = DB.session.get();

        if (!Router.PUBLIC_ROUTES.has(route) && !session) {
            Router.navigate('login'); return;
        }
        if (Router.ADMIN_ROUTES.has(route) && session?.type !== 'admin') {
            Router.navigate('login'); return;
        }
        if (Router.PUBLIC_ROUTES.has(route) && session) {
            Router.navigate(session.type === 'admin' ? 'admin' : 'dashboard'); return;
        }

        const pageMap = {
            login:    Pages.login,
            register: Pages.register,
            dashboard:Pages.dashboard,
            deposit:  Pages.deposit,
            withdraw: Pages.withdraw,
            transfer: Pages.transfer,
            history:  Pages.history,
            loans:    Pages.loans,
            admin:    Pages.admin,
            profile:  Pages.profile,
        };

        const fn = pageMap[route];
        if (fn) {
            document.getElementById('app').innerHTML = fn();
            UI.renderIcons();
        }
    }
};

/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
   LAYOUT HELPERS
Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */
function renderSidebar(activeRoute) {
    const s = DB.session.get();
    const customer = s ? DB.customers.byId(s.customerId) : null;
    const account  = s ? DB.accounts.byId(s.accountId) : null;
    const fraud    = FraudDetection.getFraudSummary();
    const flagCount = fraud.flaggedCount;

    const navItems = [
        { route: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
        { route: 'transfer',  icon: 'send',              label: 'Transfer' },
        { route: 'history',   icon: 'clock',             label: 'History' },
        { route: 'loans',     icon: 'landmark',          label: 'Loans' },
    ];

    return `
    <div class="sidebar-overlay" id="sidebar-overlay" onclick="closeSidebar()"></div>
    <aside class="sidebar" id="sidebar">
        <a class="sidebar-logo" href="#dashboard">
            <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
                <rect width="64" height="64" rx="16" fill="#F5B942"/>
                <path d="M14 46L24 26L32 36L42 20L50 46" stroke="#0A0F1E" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="32" cy="14" r="5" fill="#0A0F1E"/>
            </svg>
            <div class="sidebar-logo-text">
                <span class="sidebar-logo-name">  ApkaGullak</span>
                <span class="sidebar-logo-sub">Banking Portal</span>
            </div>
        </a>

        <nav class="sidebar-nav">
            <div class="nav-section-label">Menu</div>
            ${navItems.map(item => `
                <a class="nav-item ${activeRoute === item.route ? 'active' : ''}" href="#${item.route}">
                    <span class="nav-icon"><i data-lucide="${item.icon}" width="18" height="18"></i></span>
                    ${item.label}
                    ${item.route === 'history' && flagCount > 0 ? `<span class="nav-badge">${flagCount}</span>` : ''}
                </a>`).join('')}
        </nav>

        <div class="sidebar-footer">
            <a class="nav-item ${activeRoute === 'profile' ? 'active' : ''}" href="#profile" style="margin-bottom:6px;">
                <span class="nav-icon"><i data-lucide="user" width="18" height="18"></i></span>
                Profile
            </a>
            <div class="nav-item" onclick="handleLogout()" style="cursor:pointer;">
                <span class="nav-icon"><i data-lucide="log-out" width="18" height="18"></i></span>
                Logout
            </div>
            <!-- Theme Toggle in Sidebar -->
            <div onclick="toggleTheme()" id="sidebar-theme-btn"
                style="display:flex;align-items:center;gap:10px;padding:10px 14px;margin-top:4px;border-radius:var(--r-md);cursor:pointer;border:1px solid var(--border);background:var(--bg-input);transition:all 0.25s;"
                onmouseover="this.style.background='var(--bg-card-hover)'" onmouseout="this.style.background='var(--bg-input)'">
                <span style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:var(--accent-gold-light);">
                    <i data-lucide="sun" width="14" height="14" id="sb-theme-icon-sun" style="display:none;color:var(--accent-gold);"></i>
                    <i data-lucide="moon" width="14" height="14" id="sb-theme-icon-moon" style="color:var(--accent-gold);"></i>
                </span>
                <div style="flex:1;">
                    <div style="font-size:0.8rem;font-weight:600;color:var(--text-primary);">Theme</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);" id="sb-theme-label">Dark Mode</div>
                </div>
                <!-- Toggle pill -->
                <div id="sb-theme-toggle-pill"
                    style="width:34px;height:18px;border-radius:99px;background:var(--accent-gold);position:relative;transition:background 0.3s;flex-shrink:0;">
                    <div id="sb-theme-pill-knob"
                        style="position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#fff;transition:transform 0.3s;"></div>
                </div>
            </div>
            <div class="sidebar-user" style="margin-top:8px;">
                <div class="avatar">${customer ? Utils.initials(customer.name) : 'U'}</div>
                <div>
                    <div style="font-size:0.82rem;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;max-width:150px;text-overflow:ellipsis;">${customer ? customer.name.split(' ')[0] : 'User'}</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);">${account ? Utils.maskAccountNumber(account.accountNumber) : ''}</div>
                </div>
            </div>
        </div>
    </aside>`;
}

function renderPageHeader(title, subtitle = '') {
    return `
    <header class="page-header">
        <div class="flex items-center gap-3">
            <button class="mobile-menu-btn" onclick="openSidebar()" id="menu-toggle" aria-label="Open menu">
                <i data-lucide="menu" width="20" height="20"></i>
            </button>
            <div>
                <h1>${title}</h1>
                ${subtitle ? `<p style="font-size:0.8rem;color:var(--text-muted);margin:0;">${subtitle}</p>` : ''}
            </div>
        </div>
        <div class="flex items-center gap-2">
            <div style="font-size:0.8rem;color:var(--text-muted);">${Utils.formatDate(new Date().toISOString())}</div>
            <button id="theme-toggle-btn" onclick="toggleTheme()" aria-label="Toggle theme"
                style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:20px;border:1px solid var(--border);background:var(--bg-card);color:var(--text-secondary);cursor:pointer;font-size:0.78rem;font-weight:500;transition:all 0.25s;">
                <i data-lucide="sun" width="15" height="15" id="theme-icon-sun" style="display:none;"></i>
                <i data-lucide="moon" width="15" height="15" id="theme-icon-moon"></i>
                <span id="theme-label">Dark</span>
            </button>
        </div>
    </header>`;
}

function appLayout(activeRoute, title, subtitle, bodyHTML) {
    return `
    ${renderSidebar(activeRoute)}
    <div class="main-content">
        ${renderPageHeader(title, subtitle)}
        <div class="page-body">
            ${bodyHTML}
        </div>
    </div>`;
}

/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
   PAGES
Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */
const Pages = {

    /* Ã¢â€â‚¬Ã¢â€â‚¬ LOGIN Ã¢â€â‚¬Ã¢â€â‚¬ */
    login() {
        return `
        <div class="auth-layout">
            <div class="auth-hero">
                <div class="auth-hero-bg">
                    <div class="auth-hero-circle auth-hero-circle-1"></div>
                    <div class="auth-hero-circle auth-hero-circle-2"></div>
                    <div class="auth-hero-circle auth-hero-circle-3"></div>
                </div>
                <div class="auth-hero-logo animate-fadeIn">
                    <svg width="44" height="44" viewBox="0 0 64 64" fill="none">
                        <rect width="64" height="64" rx="16" fill="#F5B942"/>
                        <path d="M14 46L24 26L32 36L42 20L50 46" stroke="#0A0F1E" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="32" cy="14" r="5" fill="#0A0F1E"/>
                    </svg>
                    <div>
                        <div class="auth-hero-logo-name">  ApkaGullak</div>
                        <div class="auth-hero-logo-sub">Est. 2026</div>
                    </div>
                </div>
                <div class="auth-hero-main animate-fadeInUp stagger-2">
                    <h2>Your <span class="gradient-text">Trusted</span> Banking Partner</h2>
                    <p>Manage your finances securely with world-class banking features   deposits, transfers, loans, and more.</p>
                    <div class="auth-hero-features">
                        ${['256-bit SSL Encryption', 'Real-time Fraud Detection', 'Instant Fund Transfers', 'Loan Management System', 'Detailed Transaction History'].map(f => `
                        <div class="auth-hero-feature">
                            <span class="feature-dot"></span>
                            <span>${f}</span>
                        </div>`).join('')}
                    </div>
                </div>
                <div style="font-size:0.75rem;color:var(--text-muted);" class="animate-fadeIn stagger-4">
                    2026   ApkaGullak. IFSC: SECB0001234 | RBI Registered
                </div>
            </div>

            <div class="auth-form-panel">
                <div class="auth-form-box">
                    <div class="auth-tabs">
                        <button class="auth-tab active" id="tab-customer" onclick="switchLoginTab('customer')">
                            <i data-lucide="user" width="14" height="14" style="display:inline;vertical-align:middle;margin-right:4px;"></i>
                            Customer
                        </button>
                        <button class="auth-tab" id="tab-admin" onclick="switchLoginTab('admin')">
                            <i data-lucide="shield" width="14" height="14" style="display:inline;vertical-align:middle;margin-right:4px;"></i>
                            Admin
                        </button>
                    </div>

                    <!-- Customer Login -->
                    <div id="login-customer">
                        <h2 class="auth-form-title">Welcome Back</h2>
                        <p class="auth-form-sub">Sign in to access your account</p>
                        <form class="form-card" id="customer-login-form" onsubmit="handleCustomerLogin(event)">
                            <div class="form-group">
                                <label class="form-label"><i data-lucide="credit-card" width="14" height="14"></i> Account Number</label>
                                <div class="input-wrapper">
                                    <input class="form-input has-icon-left" type="text" id="login-acc" placeholder="Enter 12-digit account number" maxlength="12" autocomplete="off" required>
                                    <span class="input-icon-left"><i data-lucide="hash" width="16" height="16"></i></span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label"><i data-lucide="lock" width="14" height="14"></i> PIN</label>
                                <div class="input-wrapper">
                                    <input class="form-input has-icon-left has-icon-right" type="password" id="login-pin" placeholder="Enter your PIN" maxlength="6" required>
                                    <span class="input-icon-left"><i data-lucide="key" width="16" height="16"></i></span>
                                    <span class="input-icon-right" onclick="togglePIN('login-pin', this)"><i data-lucide="eye" width="16" height="16"></i></span>
                                </div>
                            </div>
                            <div id="login-error" class="alert alert-danger hidden" style="padding:10px 14px;font-size:0.82rem;"></div>
                            <button type="submit" class="btn btn-primary btn-full btn-lg" id="login-btn">
                                <i data-lucide="log-in" width="18" height="18"></i>
                                Sign In
                            </button>
                        </form>
                        <div style="margin-top:1.5rem;text-align:center;">
                            <p style="font-size:0.85rem;color:var(--text-muted);">Don't have an account? <a href="#register">Open Account</a></p>
                        </div>
                        <div class="divider"></div>
                        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:1rem;font-size:0.78rem;color:var(--text-muted);">
                            <strong style="color:var(--accent-gold);">Demo Credentials:</strong><br>
                            Account: <strong style="color:var(--text-primary);">500012345678</strong> &nbsp;|&nbsp; PIN: <strong style="color:var(--text-primary);">1234</strong>
                        </div>
                    </div>

                    <!-- Admin Login -->
                    <div id="login-admin" class="hidden">
                        <h2 class="auth-form-title">Admin Portal</h2>
                        <p class="auth-form-sub">Restricted access   administrators only</p>
                        <form class="form-card" id="admin-login-form" onsubmit="handleAdminLogin(event)">
                            <div class="form-group">
                                <label class="form-label"><i data-lucide="shield-check" width="14" height="14"></i> Username</label>
                                <div class="input-wrapper">
                                    <input class="form-input has-icon-left" type="text" id="admin-user" placeholder="Admin username" required>
                                    <span class="input-icon-left"><i data-lucide="at-sign" width="16" height="16"></i></span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label"><i data-lucide="lock" width="14" height="14"></i> Password</label>
                                <div class="input-wrapper">
                                    <input class="form-input has-icon-left has-icon-right" type="password" id="admin-pass" placeholder="Admin password" required>
                                    <span class="input-icon-left"><i data-lucide="key" width="16" height="16"></i></span>
                                    <span class="input-icon-right" onclick="togglePIN('admin-pass', this)"><i data-lucide="eye" width="16" height="16"></i></span>
                                </div>
                            </div>
                            <div id="admin-login-error" class="alert alert-danger hidden" style="padding:10px 14px;font-size:0.82rem;"></div>
                            <button type="submit" class="btn btn-primary btn-full btn-lg" id="admin-login-btn">
                                <i data-lucide="shield-check" width="18" height="18"></i>
                                Admin Sign In
                            </button>
                        </form>
                        <div class="divider"></div>
                        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:1rem;font-size:0.78rem;color:var(--text-muted);">
                            <strong style="color:var(--accent-gold);">Demo Admin:</strong><br>
                            Username: <strong style="color:var(--text-primary);">admin</strong> &nbsp;|&nbsp; Password: <strong style="color:var(--text-primary);">admin123</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    /* Ã¢â€â‚¬Ã¢â€â‚¬ REGISTER Ã¢â€â‚¬Ã¢â€â‚¬ */
    register() {
        return `
        <div class="register-layout">
            <div class="register-header">
                <a href="#login" class="btn btn-ghost btn-sm">
                    <i data-lucide="arrow-left" width="16" height="16"></i> Back to Login
                </a>
                <div style="display:flex;align-items:center;gap:10px;">
                    <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
                        <rect width="64" height="64" rx="16" fill="#F5B942"/>
                        <path d="M14 46L24 26L32 36L42 20L50 46" stroke="#0A0F1E" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="32" cy="14" r="5" fill="#0A0F1E"/>
                    </svg>
                    <span style="font-size:1.1rem;font-weight:800;color:var(--accent-gold);">  ApkaGullak</span>
                </div>
            </div>

            <div class="register-card">
                <h2 style="margin-bottom:0.25rem;">Open Your Account</h2>
                <p style="margin-bottom:2rem;font-size:0.875rem;">Complete the 3-step process to open your bank account.</p>

                <div class="steps-bar">
                    ${[{n:1,l:'Personal'},{n:2,l:'Identity'},{n:3,l:'Account'}].map((s,i) => `
                    <div class="step-item ${i===0?'active':''}" id="step-item-${s.n}">
                        <div class="step-circle">${s.n}</div>
                        <span class="step-label">${s.l}</span>
                    </div>`).join('')}
                </div>

                <!-- Step 1: Personal Info -->
                <div class="register-step active" id="reg-step-1">
                    <h3 style="margin-bottom:1.5rem;">Personal Information</h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">
                        <div class="form-group" style="grid-column:1/-1;">
                            <label class="form-label">Full Name <span class="required">*</span></label>
                            <input class="form-input" type="text" id="reg-name" placeholder="As per Aadhaar card" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Date of Birth <span class="required">*</span></label>
                            <input class="form-input" type="date" id="reg-dob" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Mobile Number <span class="required">*</span></label>
                            <input class="form-input" type="tel" id="reg-phone" placeholder="10-digit mobile" maxlength="10">
                        </div>
                        <div class="form-group" style="grid-column:1/-1;">
                            <label class="form-label">Email Address <span class="required">*</span></label>
                            <input class="form-input" type="email" id="reg-email" placeholder="your@email.com">
                        </div>
                        <div class="form-group" style="grid-column:1/-1;">
                            <label class="form-label">Residential Address <span class="required">*</span></label>
                            <textarea class="form-textarea" id="reg-address" placeholder="Full address with PIN code" style="min-height:80px;"></textarea>
                        </div>
                    </div>
                    <div id="step1-error" class="alert alert-danger hidden" style="margin-top:1rem;font-size:0.82rem;padding:10px 14px;"></div>
                    <div style="display:flex;justify-content:flex-end;margin-top:1.5rem;">
                        <button class="btn btn-primary" onclick="regStep1Next()">
                            Next <i data-lucide="arrow-right" width="16" height="16"></i>
                        </button>
                    </div>
                </div>

                <!-- Step 2: Identity -->
                <div class="register-step" id="reg-step-2">
                    <h3 style="margin-bottom:1.5rem;">Identity Verification</h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">
                        <div class="form-group">
                            <label class="form-label">PAN Number <span class="required">*</span></label>
                            <input class="form-input" type="text" id="reg-pan" placeholder="ABCDE1234F" maxlength="10" style="text-transform:uppercase;">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Aadhaar Number <span class="required">*</span></label>
                            <input class="form-input" type="text" id="reg-aadhaar" placeholder="1234 5678 9012" maxlength="14">
                        </div>
                    </div>
                    <div class="alert alert-info" style="margin-top:1.25rem;font-size:0.82rem;">
                        <i data-lucide="info" width="16" height="16"></i>
                        Your identity information is encrypted and securely stored. It will not be shared with third parties.
                    </div>
                    <div id="step2-error" class="alert alert-danger hidden" style="margin-top:1rem;font-size:0.82rem;padding:10px 14px;"></div>
                    <div style="display:flex;justify-content:space-between;margin-top:1.5rem;">
                        <button class="btn btn-secondary" onclick="regGoStep(1)">
                            <i data-lucide="arrow-left" width="16" height="16"></i> Back
                        </button>
                        <button class="btn btn-primary" onclick="regStep2Next()">
                            Next <i data-lucide="arrow-right" width="16" height="16"></i>
                        </button>
                    </div>
                </div>

                <!-- Step 3: Account Setup -->
                <div class="register-step" id="reg-step-3">
                    <h3 style="margin-bottom:1.5rem;">Account Setup</h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">
                        <div class="form-group" style="grid-column:1/-1;">
                            <label class="form-label">Account Type <span class="required">*</span></label>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
                                <div class="loan-type-card selected" id="acc-savings" onclick="selectAccountType('Savings')">
                                    <i data-lucide="piggy-bank" width="24" height="24" style="color:var(--accent-gold);"></i>
                                    <div class="loan-type-name">Savings Account</div>
                                    <div class="loan-type-rate">Min balance   500</div>
                                </div>
                                <div class="loan-type-card" id="acc-current" onclick="selectAccountType('Current')">
                                    <i data-lucide="building-2" width="24" height="24" style="color:var(--blue);"></i>
                                    <div class="loan-type-name">Current Account</div>
                                    <div class="loan-type-rate">No min balance</div>
                                </div>
                            </div>
                            <input type="hidden" id="reg-acc-type" value="Savings">
                        </div>
                        <div class="form-group" style="grid-column:1/-1;">
                            <label class="form-label">Initial Deposit <span class="required">*</span></label>
                            <div class="input-wrapper">
                                <input class="form-input has-icon-left" type="number" id="reg-deposit" placeholder="Minimum   500" min="500">
                                <span class="input-icon-left" style="font-weight:700;font-size:0.9rem;color:var(--accent-gold);">  </span>
                            </div>
                            <div class="amount-quick-btns">
                                ${[1000,2000,5000,10000].map(a => `<button type="button" class="amount-btn" onclick="document.getElementById('reg-deposit').value=${a}">${Utils.formatCurrencyShort(a)}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Set PIN (4-6 digits) <span class="required">*</span></label>
                            <div class="input-wrapper">
                                <input class="form-input has-icon-right" type="password" id="reg-pin" placeholder="   digit PIN" maxlength="6">
                                <span class="input-icon-right" onclick="togglePIN('reg-pin',this)"><i data-lucide="eye" width="16" height="16"></i></span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Confirm PIN <span class="required">*</span></label>
                            <div class="input-wrapper">
                                <input class="form-input has-icon-right" type="password" id="reg-confirm-pin" placeholder="Re-enter PIN" maxlength="6">
                                <span class="input-icon-right" onclick="togglePIN('reg-confirm-pin',this)"><i data-lucide="eye" width="16" height="16"></i></span>
                            </div>
                        </div>
                    </div>
                    <div id="step3-error" class="alert alert-danger hidden" style="margin-top:1rem;font-size:0.82rem;padding:10px 14px;"></div>
                    <div style="display:flex;justify-content:space-between;margin-top:1.5rem;gap:1rem;">
                        <button class="btn btn-secondary" onclick="regGoStep(2)">
                            <i data-lucide="arrow-left" width="16" height="16"></i> Back
                        </button>
                        <button class="btn btn-primary" onclick="handleRegister()" id="reg-submit-btn" style="flex:1;">
                            <i data-lucide="user-check" width="18" height="18"></i>
                            Open Account
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    },

    /* Ã¢â€â‚¬Ã¢â€â‚¬ DASHBOARD Ã¢â€â‚¬Ã¢â€â‚¬ */
    dashboard() {
        const s = DB.session.get();
        if (!s) return '';
        const account  = DB.accounts.byId(s.accountId);
        if (!account) { Router.navigate('login'); return ''; }  // stale session   force re-login
        const customer = DB.customers.byId(s.customerId);
        if (!customer) { Router.navigate('login'); return ''; }
        const summary  = Accounts.getAccountSummary(s.accountId);
        const recentTxns = DB.transactions.recent(s.accountId, 5);
        const activeLoans = Loans.getActiveLoans(s.customerId);
        const fraud = FraudDetection.getFraudSummary();

        const body = `
        ${fraud.frozenCount > 0 ? `<div class="alert alert-danger animate-fadeIn" style="margin-bottom:1.5rem;">
            <i data-lucide="alert-triangle" width="18" height="18"></i>
            <div><strong>Account Alert:</strong> You have ${fraud.frozenCount} frozen account(s). Contact support immediately.</div>
        </div>` : ''}

        <div class="dashboard-grid">
            <div>
                <!-- Balance Card -->
                <div class="balance-card animate-fadeInUp">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;">
                        <div>
                            <div class="balance-label">Available Balance</div>
                            <div class="balance-amount" id="balance-counter">${Utils.formatCurrency(account.balance)}</div>
                        </div>
                        <div>
                            <span class="badge badge-green">${account.frozen ? ' Frozen' : ' Active'}</span>
                        </div>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-muted);flex-wrap:wrap;gap:0.5rem;">
                        <span><strong style="color:var(--text-secondary);">${account.accountNumber}</strong></span>
                        <span>${account.type} Account</span>
                        <span>IFSC: ${account.ifsc}</span>
                    </div>
                    <div style="display:flex;gap:0.75rem;margin-top:1.25rem;">
                        <a class="btn btn-primary btn-sm" href="#transfer"><i data-lucide="send" width="14" height="14"></i> Transfer</a>
                    </div>
                </div>

                <!-- Stats row -->
                <div class="grid-3 animate-fadeInUp stagger-2" style="margin:1.5rem 0;">
                    <div class="stat-card">
                        <div class="stat-icon stat-icon-green"><i data-lucide="trending-up" width="22" height="22"></i></div>
                        <div>
                            <div class="stat-value">${Utils.formatCurrencyShort(summary.monthlyCredits)}</div>
                            <div class="stat-label">This Month Income</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon stat-icon-red"><i data-lucide="trending-down" width="22" height="22"></i></div>
                        <div>
                            <div class="stat-value">${Utils.formatCurrencyShort(summary.monthlyDebits)}</div>
                            <div class="stat-label">This Month Spend</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon stat-icon-blue"><i data-lucide="receipt" width="22" height="22"></i></div>
                        <div>
                            <div class="stat-value">${summary.transactionCount}</div>
                            <div class="stat-label">Total Transactions</div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <h3 style="margin-bottom:1rem;" class="animate-fadeIn stagger-3">Quick Actions</h3>
                <div class="quick-actions-grid animate-fadeInUp stagger-3">
                    ${[
                        {href:'#transfer',  icon:'send',               label:'Transfer', sub:'Send money',     bg:'var(--blue-light)',    c:'var(--blue)' },
                        {href:'#history',   icon:'clock',              label:'History',  sub:'All transactions',bg:'var(--orange-light)', c:'var(--orange)' },
                        {href:'#loans',     icon:'landmark',           label:'Loans',    sub:'Apply & manage', bg:'var(--accent-gold-light)', c:'var(--accent-gold)' },
                        {href:'#profile',   icon:'user',               label:'Profile',  sub:'My account',     bg:'var(--bg-card)',       c:'var(--text-secondary)' },
                    ].map(q => `
                    <a href="${q.href}" class="quick-card card-hover" style="text-decoration:none;">
                        <div class="quick-icon" style="background:${q.bg};color:${q.c};">
                            <i data-lucide="${q.icon}" width="24" height="24"></i>
                        </div>
                        <div class="quick-label">${q.label}</div>
                        <div class="quick-sub">${q.sub}</div>
                    </a>`).join('')}
                </div>

                <!-- Balance Chart -->
                <div class="card animate-fadeInUp stagger-4" style="margin-top:1.5rem;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
                        <h3>Balance Trend</h3>
                        <a href="#history" class="btn btn-ghost btn-sm">View All <i data-lucide="arrow-right" width="14" height="14"></i></a>
                    </div>
                    <div class="chart-container">
                        <canvas id="balance-chart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Right Column -->
            <div>
                <!-- Recent Transactions -->
                <div class="card animate-fadeInRight" style="margin-bottom:1.5rem;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
                        <h3>Recent Activity</h3>
                        <a href="#history" class="btn btn-ghost btn-sm">All <i data-lucide="arrow-right" width="14" height="14"></i></a>
                    </div>
                    ${recentTxns.length ? recentTxns.map(t => `
                    <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);">
                        <div class="tx-type-icon ${t.type === 'credit' ? 'tx-credit' : 'tx-debit'}">
                            <i data-lucide="${t.type === 'credit' ? 'arrow-down-left' : 'arrow-up-right'}" width="16" height="16"></i>
                        </div>
                        <div style="flex:1;min-width:0;">
                            <div style="font-size:0.82rem;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${Utils.sanitize(t.description)}</div>
                            <div style="font-size:0.72rem;color:var(--text-muted);">${Utils.timeAgo(t.timestamp)}</div>
                        </div>
                        <div style="text-align:right;flex-shrink:0;">
                            <div style="font-size:0.875rem;font-weight:700;color:${t.type === 'credit' ? 'var(--green)' : 'var(--red)'};">
                                ${t.type === 'credit' ? '+' : '-'}${Utils.formatCurrency(t.amount)}
                            </div>
                            ${t.flagged ? '<div class="fraud-flag"><i data-lucide="alert-triangle" width="10" height="10"></i> Flagged</div>' : ''}
                        </div>
                    </div>`).join('') : `<div class="empty-state" style="padding:2rem 0;"><i data-lucide="inbox" width="32" height="32"></i><h3>No transactions yet</h3></div>`}
                </div>

                <!-- Active Loan Card -->
                ${activeLoans.length ? activeLoans.map(l => `
                <div class="loan-card animate-fadeInRight stagger-2">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                        <div>
                            <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;">Active Loan</div>
                            <h4>${l.type} Loan</h4>
                        </div>
                        <span class="badge badge-gold">Active</span>
                    </div>
                    <div style="font-size:1.5rem;font-weight:800;color:var(--accent-gold);">${Utils.formatCurrency(l.remainingAmount)}</div>
                    <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:0.5rem;">Remaining out of ${Utils.formatCurrency(l.principal)}</div>
                    <div class="loan-progress">
                        <div class="loan-progress-fill" style="width:${l.progressPercent}%;"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:var(--text-muted);">
                        <span>${l.paidMonths} paid</span>
                        <span>${l.progressPercent}%</span>
                        <span>${l.remainingMonths} remaining</span>
                    </div>
                    <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
                        <div style="font-size:0.82rem;color:var(--text-muted);">Monthly EMI</div>
                        <div style="font-weight:700;color:var(--text-primary);">${Utils.formatCurrency(l.emi)}</div>
                    </div>
                    <a href="#loans" class="btn btn-secondary btn-sm btn-full" style="margin-top:0.75rem;">Manage Loan</a>
                </div>`).join('') : ''}

                <!-- Spending Chart -->
                <div class="card animate-fadeInRight stagger-3" style="margin-top:${activeLoans.length?'1.5rem':'0'};">
                    <h3 style="margin-bottom:1.25rem;">Spending Breakdown</h3>
                    <div class="chart-container-sm">
                        <canvas id="spending-chart"></canvas>
                    </div>
                </div>
            </div>
        </div>`;

        setTimeout(() => {
            // Balance trend chart
            const trendData = Accounts.getBalanceTrend(s.accountId);
            const ctx = document.getElementById('balance-chart');
            if (ctx && trendData.length) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: trendData.map(d => d.label),
                        datasets: [{ label: 'Balance', data: trendData.map(d => d.balance), borderColor: '#F5B942', backgroundColor: 'rgba(245,185,66,0.08)', borderWidth: 2.5, pointBackgroundColor: '#F5B942', pointRadius: 4, tension: 0.4, fill: true }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748B', font: { size: 10 } } }, y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748B', font: { size: 10 }, callback: v => '  ' + (v/1000).toFixed(0) + 'K' } } } }
                });
            }
            // Spending doughnut
            const spData = Accounts.getSpendingChart(s.accountId);
            const sctx = document.getElementById('spending-chart');
            if (sctx && spData.length) {
                new Chart(sctx, {
                    type: 'doughnut',
                    data: {
                        labels: spData.map(d => d.label),
                        datasets: [{ data: spData.map(d => d.value), backgroundColor: ['#F5B942','#10B981','#3B82F6','#8B5CF6','#F97316','#EF4444'], borderWidth: 0, hoverOffset: 4 }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#94A3B8', font: { size: 10 }, boxWidth: 10 } } } }
                });
            }
            // Animate balance counter
            Utils.animateCounter(document.getElementById('balance-counter'), 0, account.balance, 1200);
        }, 100);

        return appLayout('dashboard', `Good ${getGreeting()}, ${customer.name.split(' ')[0]}`, Utils.formatDateTime(new Date().toISOString()), body);
    },

    /* Ã¢â€â‚¬Ã¢â€â‚¬ DEPOSIT Ã¢â€â‚¬Ã¢â€â‚¬ */
    deposit() {
        const s = DB.session.get();
        if (!s) return '';
        const account = DB.accounts.byId(s.accountId);
        if (!account) { Router.navigate('login'); return ''; }
        const body = `
        <div class="txn-layout">
            <div class="txn-form-card animate-fadeInUp">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:1.75rem;">
                    <div class="stat-icon stat-icon-green" style="width:48px;height:48px;border-radius:var(--r-md);"><i data-lucide="arrow-down-to-line" width="22" height="22"></i></div>
                    <div><h2 style="margin:0;">Deposit Funds</h2><p style="margin:0;font-size:0.82rem;">Add money to your account</p></div>
                </div>
                <form id="deposit-form" onsubmit="handleDeposit(event)">
                    <div class="form-group" style="margin-bottom:1.25rem;">
                        <label class="form-label">Deposit Amount <span class="required">*</span></label>
                        <div class="input-wrapper">
                            <input class="form-input has-icon-left" type="number" id="dep-amount" placeholder="Enter amount" min="1" max="1000000" required>
                            <span class="input-icon-left" style="font-weight:700;color:var(--accent-gold);">  </span>
                        </div>
                        <div class="amount-quick-btns">
                            ${[500,1000,2000,5000,10000,20000,50000].map(a => `<button type="button" class="amount-btn" onclick="setAmount('dep-amount',${a})">${Utils.formatCurrencyShort(a)}</button>`).join('')}
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:1.25rem;">
                        <label class="form-label">Description</label>
                        <input class="form-input" type="text" id="dep-desc" placeholder="e.g. Salary, Cash deposit..." value="Cash Deposit">
                    </div>
                    <div class="form-group" style="margin-bottom:1.5rem;">
                        <label class="form-label">Remarks (optional)</label>
                        <input class="form-input" type="text" id="dep-remarks" placeholder="Any additional notes">
                    </div>
                    <div id="dep-error" class="alert alert-danger hidden" style="margin-bottom:1rem;font-size:0.82rem;padding:10px 14px;"></div>
                    <button type="submit" class="btn btn-primary btn-full btn-lg" id="dep-btn">
                        <i data-lucide="arrow-down-to-line" width="18" height="18"></i>
                        Deposit Now
                    </button>
                </form>
            </div>
            <div class="txn-info-card animate-fadeInRight">
                <h4>Account Summary</h4>
                <div class="txn-summary-row"><span class="ts-label">Account No.</span><span class="ts-value" style="font-family:monospace;font-size:0.82rem;">${account.accountNumber}</span></div>
                <div class="txn-summary-row"><span class="ts-label">Account Type</span><span class="ts-value">${account.type}</span></div>
                <div class="txn-summary-row"><span class="ts-label">Current Balance</span><span class="ts-value" style="color:var(--green);">${Utils.formatCurrency(account.balance)}</span></div>
                <div class="txn-summary-row"><span class="ts-label">IFSC Code</span><span class="ts-value">${account.ifsc}</span></div>
                <hr class="divider" style="margin:0.5rem 0;">
                <div class="alert alert-info" style="font-size:0.78rem;padding:10px 12px;">
                    <i data-lucide="info" width="14" height="14"></i>
                    Deposits are reflected instantly. No charges apply.
                </div>
            </div>
        </div>`;
        return appLayout('deposit', 'Deposit Funds', 'Credit your account', body);
    },

    /* Ã¢â€â‚¬Ã¢â€â‚¬ WITHDRAW Ã¢â€â‚¬Ã¢â€â‚¬ */
    withdraw() {
        const s = DB.session.get();
        if (!s) return '';
        const account = DB.accounts.byId(s.accountId);
        if (!account) { Router.navigate('login'); return ''; }
        const midnight = new Date(); midnight.setHours(0,0,0,0);
        const todayUsed = DB.transactions.sumByType(s.accountId, 'debit', midnight.getTime());
        const remaining = Math.max(0, 50000 - todayUsed);

        const body = `
        <div class="txn-layout">
            <div class="txn-form-card animate-fadeInUp">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:1.75rem;">
                    <div class="stat-icon stat-icon-red" style="width:48px;height:48px;border-radius:var(--r-md);"><i data-lucide="arrow-up-from-line" width="22" height="22"></i></div>
                    <div><h2 style="margin:0;">Withdraw Funds</h2><p style="margin:0;font-size:0.82rem;">Withdraw cash from your account</p></div>
                </div>
                <form id="withdraw-form" onsubmit="handleWithdraw(event)">
                    <div class="form-group" style="margin-bottom:1.25rem;">
                        <label class="form-label">Withdrawal Amount <span class="required">*</span></label>
                        <div class="input-wrapper">
                            <input class="form-input has-icon-left" type="number" id="wd-amount" placeholder="Enter amount" min="1" max="50000" required>
                            <span class="input-icon-left" style="font-weight:700;color:var(--red);">  </span>
                        </div>
                        <div class="amount-quick-btns">
                            ${[500,1000,2000,5000,10000,20000].map(a => `<button type="button" class="amount-btn" onclick="setAmount('wd-amount',${a})">${Utils.formatCurrencyShort(a)}</button>`).join('')}
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:1.25rem;">
                        <label class="form-label">Confirm PIN <span class="required">*</span></label>
                        <div class="input-wrapper">
                            <input class="form-input has-icon-left has-icon-right" type="password" id="wd-pin" placeholder="Enter your PIN" maxlength="6" required>
                            <span class="input-icon-left"><i data-lucide="key" width="16" height="16"></i></span>
                            <span class="input-icon-right" onclick="togglePIN('wd-pin',this)"><i data-lucide="eye" width="16" height="16"></i></span>
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:1.5rem;">
                        <label class="form-label">Remarks (optional)</label>
                        <input class="form-input" type="text" id="wd-remarks" placeholder="Purpose of withdrawal">
                    </div>
                    <div id="wd-error" class="alert alert-danger hidden" style="margin-bottom:1rem;font-size:0.82rem;padding:10px 14px;"></div>
                    <button type="submit" class="btn btn-primary btn-full btn-lg" id="wd-btn">
                        <i data-lucide="arrow-up-from-line" width="18" height="18"></i>
                        Withdraw Funds
                    </button>
                </form>
            </div>
            <div class="txn-info-card animate-fadeInRight">
                <h4>Limits & Balance</h4>
                <div class="txn-summary-row"><span class="ts-label">Current Balance</span><span class="ts-value" style="color:var(--green);">${Utils.formatCurrency(account.balance)}</span></div>
                <div class="txn-summary-row"><span class="ts-label">Daily Limit</span><span class="ts-value">${Utils.formatCurrency(50000)}</span></div>
                <div class="txn-summary-row"><span class="ts-label">Used Today</span><span class="ts-value" style="color:var(--red);">${Utils.formatCurrency(todayUsed)}</span></div>
                <div class="txn-summary-row"><span class="ts-label">Available Today</span><span class="ts-value" style="color:var(--green);">${Utils.formatCurrency(remaining)}</span></div>
                ${account.type === 'Savings' ? `<div class="txn-summary-row"><span class="ts-label">Min Balance</span><span class="ts-value">  500</span></div>` : ''}
                <hr class="divider" style="margin:0.5rem 0;">
                <div class="alert alert-warning" style="font-size:0.78rem;padding:10px 12px;">
                    <i data-lucide="shield" width="14" height="14"></i>
                    PIN required for security. Transactions >   75,000 are flagged.
                </div>
            </div>
        </div>`;
        return appLayout('withdraw', 'Withdraw Funds', 'Debit from your account', body);
    },

    /* Ã¢â€â‚¬Ã¢â€â‚¬ TRANSFER Ã¢â€â‚¬Ã¢â€â‚¬ */
    transfer() {
        const s = DB.session.get();
        if (!s) return '';
        const account = DB.accounts.byId(s.accountId);
        if (!account) { Router.navigate('login'); return ''; }
        const body = `
        <div class="txn-layout">
            <div class="txn-form-card animate-fadeInUp">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:1.75rem;">
                    <div class="stat-icon stat-icon-blue" style="width:48px;height:48px;border-radius:var(--r-md);"><i data-lucide="send" width="22" height="22"></i></div>
                    <div><h2 style="margin:0;">Fund Transfer</h2><p style="margin:0;font-size:0.82rem;">Send money to another   ApkaGullak account</p></div>
                </div>
                <form id="transfer-form" onsubmit="handleTransfer(event)">
                    <div class="form-group" style="margin-bottom:1.25rem;">
                        <label class="form-label">Recipient Account Number <span class="required">*</span></label>
                        <div class="input-wrapper">
                            <input class="form-input has-icon-left has-icon-right" type="text" id="tr-to-acc" placeholder="Enter 12-digit account number" maxlength="12" oninput="lookupAccount(this.value)">
                            <span class="input-icon-left"><i data-lucide="hash" width="16" height="16"></i></span>
                            <span class="input-icon-right" id="acc-lookup-icon"><i data-lucide="search" width="16" height="16"></i></span>
                        </div>
                        <div id="acc-lookup-result" style="margin-top:6px;font-size:0.82rem;"></div>
                    </div>
                    <div class="form-group" style="margin-bottom:1.25rem;">
                        <label class="form-label">Transfer Amount <span class="required">*</span></label>
                        <div class="input-wrapper">
                            <input class="form-input has-icon-left" type="number" id="tr-amount" placeholder="Enter amount" min="1" max="500000" required>
                            <span class="input-icon-left" style="font-weight:700;color:var(--blue);">  </span>
                        </div>
                        <div class="amount-quick-btns">
                            ${[500,1000,2000,5000,10000].map(a => `<button type="button" class="amount-btn" onclick="setAmount('tr-amount',${a})">${Utils.formatCurrencyShort(a)}</button>`).join('')}
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:1.25rem;">
                        <label class="form-label">Remarks / Purpose</label>
                        <input class="form-input" type="text" id="tr-remarks" placeholder="e.g. Rent, Gift, Business payment...">
                    </div>
                    <div class="form-group" style="margin-bottom:1.5rem;">
                        <label class="form-label">Confirm PIN <span class="required">*</span></label>
                        <div class="input-wrapper">
                            <input class="form-input has-icon-left has-icon-right" type="password" id="tr-pin" placeholder="Enter your PIN" maxlength="6" required>
                            <span class="input-icon-left"><i data-lucide="key" width="16" height="16"></i></span>
                            <span class="input-icon-right" onclick="togglePIN('tr-pin',this)"><i data-lucide="eye" width="16" height="16"></i></span>
                        </div>
                    </div>
                    <div id="tr-error" class="alert alert-danger hidden" style="margin-bottom:1rem;font-size:0.82rem;padding:10px 14px;"></div>
                    <button type="submit" class="btn btn-primary btn-full btn-lg" id="tr-btn">
                        <i data-lucide="send" width="18" height="18"></i>
                        Transfer Funds
                    </button>
                </form>
            </div>
            <div class="txn-info-card animate-fadeInRight">
                <h4>Your Account</h4>
                <div class="txn-summary-row"><span class="ts-label">From Account</span><span class="ts-value" style="font-family:monospace;font-size:0.8rem;">${account.accountNumber}</span></div>
                <div class="txn-summary-row"><span class="ts-label">Balance</span><span class="ts-value" style="color:var(--green);">${Utils.formatCurrency(account.balance)}</span></div>
                <div class="txn-summary-row"><span class="ts-label">Account Type</span><span class="ts-value">${account.type}</span></div>
                <hr class="divider" style="margin:0.5rem 0;">
                <h4>Transfer Info</h4>
                <div id="tr-preview-box" style="font-size:0.82rem;color:var(--text-muted);">
                    Enter destination account number above to see beneficiary details.
                </div>
                <hr class="divider" style="margin:0.5rem 0;">
                <div class="alert alert-info" style="font-size:0.78rem;padding:10px 12px;">
                    <i data-lucide="zap" width="14" height="14"></i>
                    Transfers are instant within   ApkaGullak. IFSC: SECB0001234
                </div>
            </div>
        </div>`;
        return appLayout('transfer', 'Fund Transfer', 'Send money instantly', body);
    },

    /* Ã¢â€â‚¬Ã¢â€â‚¬ HISTORY Ã¢â€â‚¬Ã¢â€â‚¬ */
    history() {
        const s = DB.session.get();
        const body = `
        <div class="animate-fadeInUp">
            <div class="history-header">
                <h2>Transaction History</h2>
                <button class="btn btn-secondary btn-sm" onclick="exportTxnCSV()">
                    <i data-lucide="download" width="14" height="14"></i> Export CSV
                </button>
            </div>
            <div class="history-filters">
                <div class="search-bar" style="flex:1;min-width:200px;">
                    <span class="search-icon"><i data-lucide="search" width="16" height="16"></i></span>
                    <input class="form-input" type="text" id="hist-search" placeholder="Search transactions..." oninput="applyHistoryFilters()">
                </div>
                <select class="form-select" id="hist-type" onchange="applyHistoryFilters()">
                    <option value="all">All Types</option>
                    <option value="credit">Credits</option>
                    <option value="debit">Debits</option>
                </select>
                <input class="form-input" type="date" id="hist-from" onchange="applyHistoryFilters()" style="width:auto;">
                <input class="form-input" type="date" id="hist-to" onchange="applyHistoryFilters()" style="width:auto;">
                <button class="btn btn-ghost btn-sm" onclick="clearHistoryFilters()">Clear</button>
            </div>
            <div id="history-table-wrapper"></div>
            <div id="history-pagination" class="pagination"></div>
        </div>`;
        setTimeout(() => renderHistoryTable(s.accountId, 1), 50);
        return appLayout('history', 'Transaction History', 'Complete record of all transactions', body);
    },

    /* Ã¢â€â‚¬Ã¢â€â‚¬ LOANS Ã¢â€â‚¬Ã¢â€â‚¬ */
    loans() {
        const s = DB.session.get();
        const activeLoans = Loans.getActiveLoans(s.customerId);
        const allLoanHistory = Loans.getLoanHistory(s.customerId);

        const body = `
        <div class="loan-grid animate-fadeInUp">
            <div>
                <h2 style="margin-bottom:1.5rem;">Loan Management</h2>

                ${activeLoans.length ? activeLoans.map(l => `
                <div class="loan-card" style="margin-bottom:1.5rem;">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;">
                        <div>
                            <div style="font-size:0.75rem;color:var(--text-muted);letter-spacing:0.08em;text-transform:uppercase;">Active Loan</div>
                            <h3>${l.type} Loan @ ${l.rate}% p.a.</h3>
                        </div>
                        <span class="badge badge-gold">Active</span>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin-bottom:1rem;">
                        <div><div style="font-size:0.72rem;color:var(--text-muted);">Principal</div><div style="font-weight:700;font-size:1.1rem;">${Utils.formatCurrency(l.principal)}</div></div>
                        <div><div style="font-size:0.72rem;color:var(--text-muted);">Monthly EMI</div><div style="font-weight:700;font-size:1.1rem;color:var(--accent-gold);">${Utils.formatCurrency(l.emi)}</div></div>
                        <div><div style="font-size:0.72rem;color:var(--text-muted);">Remaining</div><div style="font-weight:700;font-size:1.1rem;color:var(--red);">${Utils.formatCurrency(l.remainingAmount)}</div></div>
                    </div>
                    <div class="loan-progress">
                        <div class="loan-progress-fill" style="width:${l.progressPercent}%;"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:var(--text-muted);margin-top:4px;margin-bottom:1rem;">
                        <span>${l.paidMonths}/${l.tenureMonths} months paid</span>
                        <span>${l.progressPercent}% complete</span>
                        <span>Next EMI due: ${Utils.formatDate(new Date(Date.now() + 30*24*3600*1000).toISOString())}</span>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="showPayEMIModal('${l.id}','${l.emi}')">
                        <i data-lucide="credit-card" width="14" height="14"></i>
                        Pay EMI   ${Utils.formatCurrency(l.emi)}
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="showAmortizationModal('${l.id}')" style="margin-left:8px;">
                        <i data-lucide="table" width="14" height="14"></i>
                        Amortization
                    </button>
                </div>`).join('') : `
                <div class="card" style="margin-bottom:1.5rem;">
                    <div class="empty-state" style="padding:2rem 0;">
                        <i data-lucide="landmark" width="36" height="36"></i>
                        <h3>No Active Loans</h3>
                        <p>Apply for a loan using the form on the right.</p>
                    </div>
                </div>`}

                ${allLoanHistory.filter(l => l.status === 'closed').length ? `
                <h3 style="margin-bottom:1rem;">Loan History</h3>
                <div class="table-wrapper">
                    <table>
                        <thead><tr><th>Type</th><th>Principal</th><th>Rate</th><th>Tenure</th><th>Total Paid</th><th>Status</th><th>Start Date</th></tr></thead>
                        <tbody>
                        ${allLoanHistory.filter(l=>l.status==='closed').map(l=>`
                        <tr>
                            <td><span class="td-primary">${l.type}</span></td>
                            <td>${Utils.formatCurrency(l.principal)}</td>
                            <td>${l.rate}%</td>
                            <td>${l.tenureMonths} months</td>
                            <td style="color:var(--green);">${Utils.formatCurrency(l.totalPaid)}</td>
                            <td><span class="badge badge-green">Closed</span></td>
                            <td>${Utils.formatDate(l.startDate)}</td>
                        </tr>`).join('')}
                        </tbody>
                    </table>
                </div>` : ''}
            </div>

            <!-- Apply Loan Form -->
            <div>
                <div class="card" style="position:sticky;top:80px;">
                    <h3 style="margin-bottom:1.25rem;">Apply for Loan</h3>
                    <div class="loan-type-selector">
                        ${Object.entries(Utils.LOAN_TYPES).map(([type, cfg]) => `
                        <div class="loan-type-card ${type==='Personal'?'selected':''}" id="lt-${type}" onclick="selectLoanType('${type}', ${cfg.rate})">
                            <i data-lucide="${cfg.icon}" width="22" height="22" style="color:var(--accent-gold);"></i>
                            <div class="loan-type-name">${type}</div>
                            <div class="loan-type-rate">${cfg.rate}% p.a.</div>
                        </div>`).join('')}
                    </div>
                    <input type="hidden" id="loan-type" value="Personal">
                    <input type="hidden" id="loan-rate" value="12">

                    <div class="form-group" style="margin-bottom:1rem;">
                        <label class="form-label">Loan Amount <span class="required">*</span></label>
                        <div class="input-wrapper">
                            <input class="form-input has-icon-left" type="number" id="loan-amount" placeholder="Enter amount" oninput="updateLoanCalc()">
                            <span class="input-icon-left" style="font-weight:700;color:var(--accent-gold);">  </span>
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:1rem;">
                        <label class="form-label">Tenure (months) <span class="required">*</span></label>
                        <input class="form-input" type="number" id="loan-tenure" placeholder="e.g. 24" oninput="updateLoanCalc()">
                    </div>
                    <div id="loan-calc" class="card" style="margin-bottom:1rem;display:none;background:var(--bg-secondary);">
                        <div class="txn-summary-row"><span class="ts-label">Monthly EMI</span><span class="ts-value" id="calc-emi" style="color:var(--accent-gold);"> </span></div>
                        <div class="txn-summary-row"><span class="ts-label">Total Interest</span><span class="ts-value" id="calc-interest"> </span></div>
                        <div class="txn-summary-row"><span class="ts-label">Total Cost</span><span class="ts-value" id="calc-total"> </span></div>
                    </div>
                    <div class="form-group" style="margin-bottom:1.25rem;">
                        <label class="form-label">Confirm PIN <span class="required">*</span></label>
                        <div class="input-wrapper">
                            <input class="form-input has-icon-right" type="password" id="loan-pin" placeholder="Enter PIN" maxlength="6">
                            <span class="input-icon-right" onclick="togglePIN('loan-pin',this)"><i data-lucide="eye" width="16" height="16"></i></span>
                        </div>
                    </div>
                    <div id="loan-error" class="alert alert-danger hidden" style="margin-bottom:1rem;font-size:0.82rem;padding:10px 14px;"></div>
                    <button class="btn btn-primary btn-full" id="loan-apply-btn" onclick="handleLoanApply()">
                        <i data-lucide="landmark" width="16" height="16"></i>
                        Apply for Loan
                    </button>
                </div>
            </div>
        </div>`;
        return appLayout('loans', 'Loan Management', 'Apply and manage your loans', body);
    },


    /* Ã¢â€â‚¬Ã¢â€â‚¬ ADMIN Ã¢â€â‚¬Ã¢â€â‚¬ */
    admin() {
        const stats = Admin.getStats();
        const customers = Admin.getAllCustomers();
        const fraud = Admin.getFraudAlerts();

        const statCards = [
            { icon: 'users',        label: 'Total Customers',   value: stats.totalCustomers,     cls: 'stat-icon-blue' },
            { icon: 'landmark',     label: 'Total Accounts',    value: stats.totalAccounts,      cls: 'stat-icon-gold' },
            { icon: 'trending-up',  label: 'Total Deposits',    value: Utils.formatCurrencyShort(stats.totalDeposits), cls: 'stat-icon-green' },
            { icon: 'trending-down',label: 'Total Withdrawals', value: Utils.formatCurrencyShort(stats.totalWithdrawals), cls: 'stat-icon-red' },
            { icon: 'receipt',      label: 'Transactions',      value: stats.totalTransactions,  cls: 'stat-icon-purple' },
            { icon: 'alert-triangle',label:'Fraud Flags',       value: stats.flaggedTxns,        cls: 'stat-icon-red' },
            { icon: 'banknote',     label: 'Active Loans',      value: stats.activeLoans,        cls: 'stat-icon-orange' },
            { icon: 'lock',         label: 'Frozen Accounts',   value: stats.frozenAccounts,     cls: 'stat-icon-red' },
        ];

        const body = `
        <div class="animate-fadeInUp">
            <div class="admin-stats-grid">
                ${statCards.map((c,i) => `
                <div class="stat-card stagger-${i+1}">
                    <div class="stat-icon ${c.cls}"><i data-lucide="${c.icon}" width="22" height="22"></i></div>
                    <div>
                        <div class="stat-value">${c.value}</div>
                        <div class="stat-label">${c.label}</div>
                    </div>
                </div>`).join('')}
            </div>

            <div class="admin-content-grid">
                <div>
                    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1rem;">
                        <h2>Customers</h2>
                        <div style="display:flex;gap:0.75rem;align-items:center;">
                            <div class="search-bar">
                                <span class="search-icon"><i data-lucide="search" width="16" height="16"></i></span>
                                <input class="form-input" type="text" id="admin-search" placeholder="Search customers..." oninput="adminSearch(this.value)" style="padding-left:38px;">
                            </div>
                            <button class="btn btn-secondary btn-sm" onclick="Admin.exportCustomersCSV()">
                                <i data-lucide="download" width="14" height="14"></i> Export
                            </button>
                        </div>
                    </div>
                    <div class="table-wrapper" id="admin-customer-table">
                        ${renderAdminCustomerTable(customers)}
                    </div>
                </div>

                <div>
                    <div class="card" style="margin-bottom:1.5rem;">
                        <h3 style="margin-bottom:1rem;">Transaction Overview</h3>
                        <div style="position: relative; height: 180px; width: 100%;">
                            <canvas id="admin-tx-chart"></canvas>
                        </div>
                    </div>

                    <div class="card" style="margin-bottom:1.5rem;">
                        <h3 style="margin-bottom:1rem;display:flex;align-items:center;gap:8px;">
                            <i data-lucide="alert-triangle" width="18" height="18" style="color:var(--red);"></i>
                            Fraud Alerts
                            ${fraud.flaggedCount ? `<span class="badge badge-red">${fraud.flaggedCount}</span>` : ''}
                        </h3>
                        ${fraud.flaggedTxns.length ? fraud.flaggedTxns.slice(0,5).map(t => `
                        <div style="padding:10px 0;border-bottom:1px solid var(--border);">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <div style="font-size:0.82rem;font-weight:600;color:var(--text-primary);">${Utils.sanitize(t.description).substring(0,35)} </div>
                                    <div style="font-size:0.72rem;color:var(--text-muted);">${Utils.formatDateTime(t.timestamp)}</div>
                                </div>
                                <div style="text-align:right;">
                                    <div style="font-size:0.875rem;font-weight:700;color:var(--red);">${Utils.formatCurrency(t.amount)}</div>
                                    <button class="btn btn-ghost btn-sm" style="font-size:0.7rem;padding:3px 8px;" onclick="resolveFlag('${t.id}')">Resolve</button>
                                </div>
                            </div>
                        </div>`).join('') : `<div class="empty-state" style="padding:1.5rem 0;"><i data-lucide="shield-check" width="28" height="28" style="color:var(--green);opacity:0.8;"></i><h3 style="font-size:0.9rem;">No alerts</h3></div>`}
                    </div>

                    <div class="card">
                        <h3 style="margin-bottom:1rem;">Admin Actions</h3>
                        <div style="display:flex;flex-direction:column;gap:0.75rem;">
                            <button class="btn btn-secondary btn-sm" onclick="showAdminCreditModal()">
                                <i data-lucide="plus-circle" width="14" height="14"></i> Credit Customer Account
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="showAdminDebitModalMain()">
                                <i data-lucide="minus-circle" width="14" height="14"></i> Debit Customer Account
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="showFreezeModal()">
                                <i data-lucide="lock" width="14" height="14"></i> Freeze Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        setTimeout(() => {
            const ctx = document.getElementById('admin-tx-chart');
            if (ctx && typeof Chart !== 'undefined') {
                const isLight = document.documentElement.getAttribute('data-theme') === 'light';
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Deposits', 'Withdrawals'],
                        datasets: [{
                            data: [stats.totalDeposits || 0, stats.totalWithdrawals || 0],
                            backgroundColor: ['#10b981', '#ef4444'],
                            borderWidth: 0,
                            hoverOffset: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '75%',
                        plugins: {
                            legend: { 
                                position: 'right', 
                                labels: { color: isLight ? '#475569' : '#94a3b8', font: { family: 'Inter', size: 11 } } 
                            }
                        }
                    }
                });
            }
        }, 50);

        return `${renderSidebar('admin')}
        <div class="main-content">
            ${renderPageHeader('Admin Dashboard', 'System overview & management')}
            <div class="page-body">${body}</div>
        </div>`;
    },

    /* Ã¢â€â‚¬Ã¢â€â‚¬ PROFILE Ã¢â€â‚¬Ã¢â€â‚¬ */
    profile() {
        const s = DB.session.get();
        const customer = DB.customers.byId(s.customerId);
        const account  = DB.accounts.byId(s.accountId);

        const body = `
        <div class="animate-fadeInUp">
            <div class="profile-header">
                <div class="avatar avatar-xl">${Utils.initials(customer.name)}</div>
                <div>
                    <h2>${customer.name}</h2>
                    <p style="margin:0;">Customer since ${Utils.formatDate(customer.createdAt)}</p>
                    <span class="badge badge-green" style="margin-top:6px;">${customer.status.toUpperCase()}</span>
                </div>
                <div style="margin-left:auto;display:flex;gap:0.75rem;">
                    <button class="btn btn-secondary btn-sm" onclick="showChangePINModal()">
                        <i data-lucide="key" width="14" height="14"></i> Change PIN
                    </button>
                </div>
            </div>
            <div class="profile-grid">
                <div class="card">
                    <h3 style="margin-bottom:1.25rem;">Personal Information</h3>
                    <div class="info-row"><span class="info-label">Full Name</span><span class="info-value">${customer.name}</span></div>
                    <div class="info-row"><span class="info-label">Date of Birth</span><span class="info-value">${Utils.formatDate(customer.dob)}</span></div>
                    <div class="info-row"><span class="info-label">Mobile</span><span class="info-value">${customer.phone}</span></div>
                    <div class="info-row"><span class="info-label">Email</span><span class="info-value">${customer.email}</span></div>
                    <div class="info-row"><span class="info-label">Address</span><span class="info-value" style="font-size:0.85rem;">${customer.address}</span></div>
                </div>
                <div class="card">
                    <h3 style="margin-bottom:1.25rem;">Account Details</h3>
                    <div class="info-row"><span class="info-label">Account Number</span><span class="info-value" style="font-family:monospace;">${account.accountNumber}</span></div>
                    <div class="info-row"><span class="info-label">Account Type</span><span class="info-value">${account.type}</span></div>
                    <div class="info-row"><span class="info-label">IFSC Code</span><span class="info-value">${account.ifsc}</span></div>
                    <div class="info-row"><span class="info-label">Branch</span><span class="info-value">${account.branch}</span></div>
                    <div class="info-row"><span class="info-label">Current Balance</span><span class="info-value" style="color:var(--green);font-size:1.1rem;font-weight:700;">${Utils.formatCurrency(account.balance)}</span></div>
                    <div class="info-row"><span class="info-label">Status</span><span class="info-value"><span class="badge ${account.frozen?'badge-red':'badge-green'}">${account.frozen?'Frozen':'Active'}</span></span></div>
                </div>
                <div class="card">
                    <h3 style="margin-bottom:1.25rem;">KYC Information</h3>
                    <div class="info-row"><span class="info-label">PAN Number</span><span class="info-value">${customer.pan}</span></div>
                    <div class="info-row"><span class="info-label">Aadhaar</span><span class="info-value">${customer.aadhaar.replace(/\d(?=\d{4})/g,'*')}</span></div>
                    <div class="info-row"><span class="info-label">KYC Status</span><span class="info-value"><span class="badge badge-green">Verified</span></span></div>
                </div>
                <div class="card">
                    <h3 style="margin-bottom:1.25rem;">Security</h3>
                    <div class="info-row"><span class="info-label">PIN</span><span class="info-value"></span></div>
                    <div class="info-row"><span class="info-label">Last Login</span><span class="info-value">${Utils.formatDateTime(s.loginAt)}</span></div>
                    <div style="margin-top:1rem;">
                        <button class="btn btn-secondary btn-sm" onclick="showChangePINModal()">
                            <i data-lucide="key" width="14" height="14"></i> Change PIN
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        return appLayout('profile', 'My Profile', 'Manage your account information', body);
    }
};

/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
   PAGE-SPECIFIC EVENT HANDLERS & HELPERS
Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ Sidebar toggle Ã¢â€â‚¬Ã¢â€â‚¬ */
function openSidebar()  { document.getElementById('sidebar')?.classList.add('open'); document.getElementById('sidebar-overlay')?.classList.add('open'); }
function closeSidebar() { document.getElementById('sidebar')?.classList.remove('open'); document.getElementById('sidebar-overlay')?.classList.remove('open'); }

/* â”€â”€ Theme Toggle â”€â”€ */
function initTheme() {
    const saved = localStorage.getItem('sb_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    _applyThemeUI(saved);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('sb_theme', next);
    _applyThemeUI(next);
    UI.renderIcons(); // re-render lucide icons after DOM update
}

function _applyThemeUI(theme) {
    const isLight = theme === 'light';

    // â”€â”€ Header button â”€â”€
    const sunH  = document.getElementById('theme-icon-sun');
    const moonH = document.getElementById('theme-icon-moon');
    const lbl   = document.getElementById('theme-label');
    if (sunH)  sunH.style.display  = isLight ? 'block' : 'none';
    if (moonH) moonH.style.display = isLight ? 'none'  : 'block';
    if (lbl)   lbl.textContent     = isLight ? 'Light' : 'Dark';

    // â”€â”€ Sidebar toggle â”€â”€
    const sunS  = document.getElementById('sb-theme-icon-sun');
    const moonS = document.getElementById('sb-theme-icon-moon');
    const lblS  = document.getElementById('sb-theme-label');
    const pill  = document.getElementById('sb-theme-pill-knob');
    if (sunS)  sunS.style.display  = isLight ? 'block' : 'none';
    if (moonS) moonS.style.display = isLight ? 'none'  : 'block';
    if (lblS)  lblS.textContent    = isLight ? 'Light Mode' : 'Dark Mode';
    if (pill)  pill.style.transform = isLight ? 'translateX(16px)' : 'translateX(0)';
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ Auth Ã¢â€â‚¬Ã¢â€â‚¬ */
function switchLoginTab(tab) {
    document.getElementById('login-customer').classList.toggle('hidden', tab !== 'customer');
    document.getElementById('login-admin').classList.toggle('hidden', tab !== 'admin');
    document.getElementById('tab-customer').classList.toggle('active', tab === 'customer');
    document.getElementById('tab-admin').classList.toggle('active', tab === 'admin');
}

function togglePIN(inputId, btn) {
    const inp = document.getElementById(inputId);
    if (!inp) return;
    const ev = inp.type === 'password' ? 'text' : 'password';
    inp.type = ev;
    const icon = btn.querySelector('i');
    if (icon) { icon.setAttribute('data-lucide', ev === 'text' ? 'eye-off' : 'eye'); lucide.createIcons({ nodes: [btn] }); }
}

function handleCustomerLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    const err = document.getElementById('login-error');
    const acc = document.getElementById('login-acc')?.value.trim();
    const pin = document.getElementById('login-pin')?.value.trim();
    UI.setLoading(btn, true);
    err.classList.add('hidden');

    (async () => {
        // Ã¢â€â‚¬ Path 1: MySQL connected Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
        if (API.isConnected()) {
            try {
                const data = await API.login(acc, pin); // throws on wrong creds
                UI.setLoading(btn, false);
                // Always set session from MySQL IDs (bypasses localStorage PIN)
                DB.session.set({
                    type:       'customer',
                    customerId: data.customer.id,
                    accountId:  data.account.id,
                    name:       data.customer.name,
                    loginAt:    new Date().toISOString()
                });
                UI.toast('success', 'Welcome back!', data.customer.name || '');
                Router.navigate('dashboard');
            } catch (apiErr) {
                UI.setLoading(btn, false);
                err.textContent = apiErr.message || 'Login failed.';
                err.classList.remove('hidden');
            }
            return;
        }
        // Ã¢â€â‚¬ Path 2: localStorage fallback (MySQL offline) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
        setTimeout(() => {
            const result = Auth.loginCustomer(acc, pin);
            UI.setLoading(btn, false);
            if (result.success) {
                UI.toast('success', 'Welcome back!', result.session?.name || '');
                Router.navigate('dashboard');
            } else {
                err.textContent = result.error;
                err.classList.remove('hidden');
            }
        }, 600);
    })();
}

function handleAdminLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('admin-login-btn');
    const err = document.getElementById('admin-login-error');
    const u = document.getElementById('admin-user')?.value.trim();
    const p = document.getElementById('admin-pass')?.value.trim();
    UI.setLoading(btn, true);
    err.classList.add('hidden');

    (async () => {
        // Ã¢â€â‚¬ Path 1: Try MySQL Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
        if (API.isConnected()) {
            try {
                await API.adminLogin(u, p);
                // MySQL verified   set session and navigate
                DB.session.set({ type: 'admin', loginAt: new Date().toISOString() });
                UI.setLoading(btn, false);
                UI.toast('success', 'Admin logged in', 'Welcome to the admin portal');
                Router.navigate('admin');
                return;
            } catch (apiErr) {
                // MySQL returned 401 or error   fall through to localStorage
                console.warn('[Admin Login] MySQL failed, trying localStorage:', apiErr.message);
            }
        }
        // Ã¢â€â‚¬ Path 2: localStorage fallback Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
        const result = Auth.loginAdmin(u, p);
        UI.setLoading(btn, false);
        if (result.success) {
            UI.toast('success', 'Admin logged in', 'Welcome to the admin portal');
            Router.navigate('admin');
        } else {
            err.textContent = result.error || 'Invalid admin credentials.';
            err.classList.remove('hidden');
        }
    })();
}

function handleLogout() {
    Auth.logout();
    UI.toast('info', 'Signed out successfully');
    Router.navigate('login');
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ Register steps Ã¢â€â‚¬Ã¢â€â‚¬ */
let _regData = {};

function regGoStep(n) {
    [1,2,3].forEach(i => {
        document.getElementById(`reg-step-${i}`)?.classList.toggle('active', i === n);
        const it = document.getElementById(`step-item-${i}`);
        if (it) { it.classList.toggle('active', i === n); it.classList.toggle('done', i < n); }
    });
}

function regStep1Next() {
    const name    = document.getElementById('reg-name')?.value.trim();
    const dob     = document.getElementById('reg-dob')?.value;
    const phone   = document.getElementById('reg-phone')?.value.trim();
    const email   = document.getElementById('reg-email')?.value.trim();
    const address = document.getElementById('reg-address')?.value.trim();
    const err = document.getElementById('step1-error');
    const errs = [];
    if (!name || name.length < 3)             errs.push('Name must be at least 3 characters.');
    if (!dob)                                   errs.push('Date of birth is required.');
    else { const age = Math.floor((Date.now()-new Date(dob))/(365.25*24*3600*1000)); if(age<18) errs.push('Must be at least 18 years old.'); }
    if (!Utils.validatePhone(phone))            errs.push('Enter a valid 10-digit mobile number.');
    if (!Utils.validateEmail(email))            errs.push('Enter a valid email address.');
    if (!address || address.length < 10)        errs.push('Enter a complete address (min 10 characters).');
    if (errs.length) { err.innerHTML = errs.join('<br>'); err.classList.remove('hidden'); return; }
    err.classList.add('hidden');
    Object.assign(_regData, { name, dob, phone, email, address });
    regGoStep(2);
}

function regStep2Next() {
    const pan      = document.getElementById('reg-pan')?.value.trim().toUpperCase();
    const aadhaar  = document.getElementById('reg-aadhaar')?.value.trim();
    const err = document.getElementById('step2-error');
    const errs = [];
    if (!Utils.validatePAN(pan))        errs.push('Enter a valid PAN (e.g. ABCDE1234F).');
    if (!aadhaar || !/^\d{4}\s?\d{4}\s?\d{4}$/.test(aadhaar.replace(/\s/g,''))) errs.push('Enter a valid 12-digit Aadhaar number.');
    if (errs.length) { err.innerHTML = errs.join('<br>'); err.classList.remove('hidden'); return; }
    err.classList.add('hidden');
    Object.assign(_regData, { pan, aadhaar });
    regGoStep(3);
}

function selectAccountType(type) {
    document.getElementById('acc-savings')?.classList.toggle('selected', type === 'Savings');
    document.getElementById('acc-current')?.classList.toggle('selected', type === 'Current');
    const inp = document.getElementById('reg-acc-type');
    if (inp) inp.value = type;
}

function handleRegister() {
    const deposit    = document.getElementById('reg-deposit')?.value;
    const pin        = document.getElementById('reg-pin')?.value;
    const confirmPin = document.getElementById('reg-confirm-pin')?.value;
    const accType    = document.getElementById('reg-acc-type')?.value;
    const err = document.getElementById('step3-error');
    const btn = document.getElementById('reg-submit-btn');

    if (!btn || !err) return;

    Object.assign(_regData, { initialDeposit: deposit, pin, confirmPin, accountType: accType });
    UI.setLoading(btn, true);
    err.classList.add('hidden');

    (async () => {
        try {
            let result;
            if (API.isConnected()) {
                // MySQL Validation: Validate payload but DO NOT mutate localStorage
                const errors = Auth.validateRegistration(_regData);
                if (errors.length) {
                    UI.setLoading(btn, false);
                    err.innerHTML = errors.join('<br>');
                    err.classList.remove('hidden');
                    return;
                }
                
                const payload = {
                    name: _regData.name, dob: _regData.dob, phone: _regData.phone,
                    email: _regData.email, address: _regData.address,
                    pan: _regData.pan, aadhaar: (_regData.aadhaar || '').replace(/\s/g,''),
                    pin, accountType: accType, initialDeposit: deposit
                };
                
                const apiResult = await API.register(payload);
                result = { success: true, customer: apiResult.customer, account: apiResult.account };
            } else {
                // LocalStorage Fallback: Validate and mutate localStorage synchronously
                const localResult = Auth.registerCustomer(_regData);
                if (!localResult.success) {
                    UI.setLoading(btn, false);
                    const errs = localResult.errors || [localResult.error];
                    err.innerHTML = errs.join('<br>');
                    err.classList.remove('hidden');
                    return;
                }
                result = localResult;
            }

            UI.setLoading(btn, false);
            if (result && result.success) {
                UI.openModal(`
                <div style="text-align:center;padding:1rem;">
                    <div style="width:64px;height:64px;background:var(--green-light);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">
                        <i data-lucide="check-circle" width="32" height="32" style="color:var(--green);"></i>
                    </div>
                    <h2 style="margin-bottom:0.5rem;">Account Created!</h2>
                    <p>Welcome to   ApkaGullak, ${result.customer.name.split(' ')[0]}!</p>
                    <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--r-md);padding:1.25rem;margin:1.5rem 0;text-align:left;">
                        <div class="txn-summary-row"><span class="ts-label">Account Number</span><span class="ts-value" style="font-family:monospace;font-size:0.85rem;">${result.account.accountNumber}</span></div>
                        <div class="txn-summary-row"><span class="ts-label">Account Type</span><span class="ts-value">${result.account.type}</span></div>
                        <div class="txn-summary-row"><span class="ts-label">Opening Balance</span><span class="ts-value" style="color:var(--green);">${Utils.formatCurrency(result.account.balance)}</span></div>
                        <div class="txn-summary-row"><span class="ts-label">IFSC</span><span class="ts-value">${result.account.ifsc}</span></div>
                    </div>
                    <p style="font-size:0.82rem;color:var(--red);"><strong>Save your account number:</strong> ${result.account.accountNumber}</p>
                    <button class="btn btn-primary btn-full" onclick="UI.closeModal();Router.navigate('login');">
                        <i data-lucide="log-in" width="16" height="16"></i> Go to Login
                    </button>
                </div>`);
                UI.renderIcons();
            } else {
                const errs = result.errors || [result.error];
                err.innerHTML = errs.join('<br>');
                err.classList.remove('hidden');
            }
        } catch (e) {
            UI.setLoading(btn, false);
            err.textContent = e.message || 'An unexpected error occurred during registration.';
            err.classList.remove('hidden');
            console.error('[  ApkaGullak] Registration Error:', e);
        }
    })();
}

function handleLogin(e) {
    if (e) e.preventDefault();
    const acc = document.getElementById('login-acc')?.value.trim();
    const pin = document.getElementById('login-pin')?.value;
    const err = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');
    if (!btn || !err) return;

    UI.setLoading(btn, true);
    err.classList.add('hidden');

    setTimeout(async () => {
        let result;
        if (API.isConnected()) {
            try {
                result = await API.login(acc, pin);
            } catch (errApi) {
                UI.setLoading(btn, false);
                err.textContent = errApi.message;
                err.classList.remove('hidden');
                return;
            }
        } else {
            result = Auth.loginCustomer(acc, pin);
        }

        UI.setLoading(btn, false);
        if (result && result.success) {
            UI.toast('success', 'Welcome back!');
            Router.navigate('dashboard');
        } else {
            const errs = result.errors || [result.error];
            err.innerHTML = errs.join('<br>');
            err.classList.remove('hidden');
        }
    }, 800);
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ Deposit Ã¢â€â‚¬Ã¢â€â‚¬ */
function setAmount(inputId, amount) {
    const inp = document.getElementById(inputId);
    if (inp) { inp.value = amount; document.querySelectorAll(`#${inputId} ~ .amount-quick-btns .amount-btn`).forEach(b => b.classList.remove('active')); }
}

function handleDeposit(e) {
    e.preventDefault();
    const s = DB.session.get();
    const btn = document.getElementById('dep-btn');
    const err = document.getElementById('dep-error');
    const amount  = document.getElementById('dep-amount')?.value;
    const desc    = document.getElementById('dep-desc')?.value || 'Cash Deposit';
    const remarks = document.getElementById('dep-remarks')?.value || '';
    if (!amount || Number(amount) <= 0) {
        err.textContent = 'Please enter a valid amount greater than   0.';
        err.classList.remove('hidden');
        return;
    }
    UI.setLoading(btn, true);
    err.classList.add('hidden');

    (async () => {
        try {
            let result;
            if (API.isConnected()) {
                result = await API.deposit(s.accountId, amount, desc, remarks);
                // Normalize raw MySQL row   ensure .timestamp field exists
                if (result.transaction) {
                    result.transaction = API.normTxn(result.transaction);
                }
            } else {
                result = await new Promise(r => setTimeout(() => r(Transactions.deposit(s.accountId, amount, desc, remarks)), 700));
            }
            UI.setLoading(btn, false);
            if (result.success) {
                if (result.warning) UI.toast('warning', 'Security Alert', result.warning, 6000);
                showReceiptModal(result.transaction, result.newBalance, 'Deposit');
            } else {
                err.textContent = result.error;
                err.classList.remove('hidden');
            }
        } catch (e) {
            UI.setLoading(btn, false);
            err.textContent = e.message;
            err.classList.remove('hidden');
        }
    })();
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ Withdraw Ã¢â€â‚¬Ã¢â€â‚¬ */
function handleWithdraw(e) {
    e.preventDefault();
    const s = DB.session.get();
    const btn = document.getElementById('wd-btn');
    const err = document.getElementById('wd-error');
    const amount  = document.getElementById('wd-amount')?.value;
    const pin     = document.getElementById('wd-pin')?.value;
    const remarks = document.getElementById('wd-remarks')?.value || '';

    if (!amount || Number(amount) <= 0) {
        err.textContent = 'Please enter a valid amount greater than   0.';
        err.classList.remove('hidden');
        return;
    }
    if (!pin) {
        err.textContent = 'PIN is required to withdraw funds.';
        err.classList.remove('hidden');
        return;
    }

    UI.setLoading(btn, true);
    err.classList.add('hidden');

    (async () => {
        try {
            let result;
            if (API.isConnected()) {
                // When MySQL is connected: verify PIN locally only if localStorage has it,
                // otherwise let the server handle the transaction (PIN already verified at login)
                const customer = DB.customers.byId(s.customerId);
                if (customer && customer.pin) {
                    // PIN is available in localStorage   verify it
                    if (String(customer.pin).trim() !== String(pin).trim()) {
                        UI.setLoading(btn, false);
                        err.textContent = 'Incorrect PIN.';
                        err.classList.remove('hidden');
                        return;
                    }
                }
                result = await API.withdraw(s.accountId, amount, 'Cash Withdrawal', remarks);
                // Normalize raw MySQL row so receipt has .timestamp
                if (result.transaction) {
                    result.transaction = API.normTxn(result.transaction);
                }
            } else {
                // localStorage path: Transactions.withdraw does its own PIN check
                const customer = DB.customers.byId(s.customerId);
                if (!customer?.pin) {
                    UI.setLoading(btn, false);
                    err.textContent = 'Customer data not found. Please log in again.';
                    err.classList.remove('hidden');
                    return;
                }
                result = await new Promise(r => setTimeout(() => r(Transactions.withdraw(s.accountId, amount, pin, 'Cash Withdrawal', remarks)), 700));
            }
            UI.setLoading(btn, false);
            if (result.success) {
                if (result.warning) UI.toast('warning', 'Security Alert', result.warning, 6000);
                showReceiptModal(result.transaction, result.newBalance, 'Withdrawal');
            } else {
                err.textContent = result.error;
                err.classList.remove('hidden');
            }
        } catch (e) {
            UI.setLoading(btn, false);
            err.textContent = e.message;
            err.classList.remove('hidden');
        }
    })();
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ Transfer Ã¢â€â‚¬Ã¢â€â‚¬ */
const lookupAccount = Utils.debounce(function(value) {
    const el = document.getElementById('acc-lookup-result');
    const icon = document.getElementById('acc-lookup-icon');
    const preview = document.getElementById('tr-preview-box');
    if (!el) return;
    if (!value || value.length < 10) { el.innerHTML = ''; return; }
    const acc = DB.accounts.byNumber(value);
    if (acc) {
        const cust = DB.customers.byId(acc.customerId);
        el.innerHTML = `<span style="color:var(--green);"><i data-lucide="check-circle" width="12" height="12"></i> ${cust?.name}   ${acc.type} Account</span>`;
        if (preview) preview.innerHTML = `
            <div class="txn-summary-row"><span class="ts-label">Beneficiary</span><span class="ts-value">${cust?.name}</span></div>
            <div class="txn-summary-row"><span class="ts-label">Account Type</span><span class="ts-value">${acc.type}</span></div>
            <div class="txn-summary-row"><span class="ts-label">Bank</span><span class="ts-value">  ApkaGullak</span></div>
            <div class="txn-summary-row"><span class="ts-label">IFSC</span><span class="ts-value">${acc.ifsc}</span></div>`;
        if (icon) { icon.innerHTML = '<i data-lucide="check-circle" width="16" height="16" style="color:var(--green);"></i>'; lucide.createIcons({ nodes: [icon] }); }
    } else {
        el.innerHTML = `<span style="color:var(--red);">Account not found.</span>`;
        if (preview) preview.textContent = 'Account not found.';
        if (icon) { icon.innerHTML = '<i data-lucide="x-circle" width="16" height="16" style="color:var(--red);"></i>'; lucide.createIcons({ nodes: [icon] }); }
    }
    lucide.createIcons({ nodes: [el] });
}, 400);

function handleTransfer(e) {
    e.preventDefault();
    const s = DB.session.get();
    const btn = document.getElementById('tr-btn');
    const err = document.getElementById('tr-error');
    const toAcc   = document.getElementById('tr-to-acc')?.value.trim();
    const amount  = document.getElementById('tr-amount')?.value;
    const pin     = document.getElementById('tr-pin')?.value;
    const remarks = document.getElementById('tr-remarks')?.value || '';
    UI.setLoading(btn, true);
    err.classList.add('hidden');

    (async () => {
        try {
            // PIN verification locally
            const customer = DB.customers.byId(s.customerId);
            if (customer?.pin && customer.pin !== pin) {
                UI.setLoading(btn, false);
                err.textContent = 'Incorrect PIN.';
                err.classList.remove('hidden');
                return;
            }
            let result;
            if (API.isConnected()) {
                result = await API.transfer(s.accountId, toAcc, amount, remarks);
                if (result.transaction) result.transaction.timestamp = result.transaction.timestamp || result.transaction.created_at;
            } else {
                result = await new Promise(r => setTimeout(() => r(Transactions.transfer(s.accountId, toAcc, amount, pin, remarks)), 800));
            }
            UI.setLoading(btn, false);
            if (result.success) {
                if (result.warning) UI.toast('warning', 'Security Alert', result.warning, 6000);
                UI.toast('success', 'Transfer Successful', `${Utils.formatCurrency(Number(amount))} sent to ${result.toCustomerName}`);
                const fakeTxn = result.transaction || { txnId: 'TXN'+Date.now(), description: `Transfer to ${toAcc}`, amount: Number(amount), timestamp: new Date().toISOString() };
                showReceiptModal(fakeTxn, result.newBalance, 'Transfer');
            } else {
                err.textContent = result.error;
                err.classList.remove('hidden');
            }
        } catch (e) {
            UI.setLoading(btn, false);
            err.textContent = e.message;
            err.classList.remove('hidden');
        }
    })();
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ Receipt Modal Ã¢â€â‚¬Ã¢â€â‚¬ */
function showReceiptModal(txn, newBalance, type) {
    UI.openModal(`
    <div style="text-align:center;margin-bottom:1.5rem;">
        <div style="width:56px;height:56px;background:var(--green-light);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">
            <i data-lucide="check-circle" width="28" height="28" style="color:var(--green);"></i>
        </div>
        <h2>${type} Successful</h2>
    </div>
    <div class="receipt receipt-animate">
        <div class="receipt-header">
            <strong style="font-size:1rem;">  ApkaGullak</strong><br>
            <small>Official Transaction Receipt</small>
        </div>
        <div style="margin:1rem 0;border-top:1px dashed #ccc;border-bottom:1px dashed #ccc;padding:0.5rem 0;">
            <div class="receipt-row"><span>Txn ID</span><span style="font-size:0.75rem;">${txn.txnId || txn.id}</span></div>
            <div class="receipt-row"><span>Date</span><span>${Utils.formatDateTime(txn.timestamp)}</span></div>
            <div class="receipt-row"><span>Type</span><span>${type.toUpperCase()}</span></div>
            <div class="receipt-row"><span>Description</span><span style="font-size:0.75rem;max-width:140px;text-align:right;">${txn.description}</span></div>
        </div>
        <div class="receipt-row receipt-total"><span>Amount</span><span>  ${txn.amount.toFixed(2)}</span></div>
        <div class="receipt-row"><span>Balance</span><span>  ${newBalance.toFixed(2)}</span></div>
        ${txn.flagged ? '<div style="color:red;font-size:0.75rem;margin-top:0.5rem;text-align:center;">This transaction has been flagged for review</div>' : ''}
        <div style="text-align:center;margin-top:1rem;font-size:0.7rem;color:#888;">Thank you for banking with   ApkaGullak</div>
    </div>
    <div style="display:flex;gap:0.75rem;margin-top:1.5rem;">
        <button class="btn btn-secondary" style="flex:1;" onclick="UI.closeModal();Router.navigate('dashboard');">
            <i data-lucide="layout-dashboard" width="14" height="14"></i> Dashboard
        </button>
        <button class="btn btn-primary" style="flex:1;" onclick="UI.closeModal();">
            <i data-lucide="plus" width="14" height="14"></i> New Transaction
        </button>
    </div>`);
    UI.renderIcons();
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ History Ã¢â€â‚¬Ã¢â€â‚¬ */
let _histPage = 1;

function renderHistoryTable(accountId, page) {
    _histPage = page;
    const type   = document.getElementById('hist-type')?.value || 'all';
    const search = document.getElementById('hist-search')?.value || '';
    const from   = document.getElementById('hist-from')?.value || null;
    const to     = document.getElementById('hist-to')?.value || null;
    const result = Transactions.getFiltered(accountId, { type, fromDate: from, toDate: to, search, page, perPage: 12 });

    const wrapper    = document.getElementById('history-table-wrapper');
    const pagWrapper = document.getElementById('history-pagination');
    if (!wrapper) return;

    if (!result.items.length) {
        wrapper.innerHTML = `<div class="empty-state" style="padding:3rem 0;border:1px solid var(--border);border-radius:var(--r-xl);">
            <i data-lucide="inbox" width="36" height="36"></i><h3>No transactions found</h3><p>Try adjusting your filters</p></div>`;
        if (pagWrapper) pagWrapper.innerHTML = '';
        UI.renderIcons(); return;
    }

    wrapper.innerHTML = `
    <div class="table-wrapper">
        <table>
            <thead><tr><th>Date & Time</th><th>Type</th><th>Description</th><th>Amount</th><th>Balance</th><th>Status</th></tr></thead>
            <tbody>
                ${result.items.map(t => `
                <tr>
                    <td><div class="td-mono" style="font-size:0.78rem;">${Utils.formatDate(t.timestamp)}</div><div style="font-size:0.7rem;color:var(--text-muted);">${Utils.formatTime(t.timestamp)}</div></td>
                    <td><div style="display:flex;align-items:center;gap:8px;">
                        <div class="tx-type-icon ${t.type==='credit'?'tx-credit':'tx-debit'}"><i data-lucide="${t.type==='credit'?'arrow-down-left':'arrow-up-right'}" width="14" height="14"></i></div>
                        <span style="text-transform:capitalize;font-size:0.82rem;">${t.type}</span>
                    </div></td>
                    <td style="max-width:240px;"><div class="td-primary" style="font-size:0.82rem;">${Utils.sanitize(t.description)}</div>${t.txnId?`<div class="td-mono" style="font-size:0.68rem;color:var(--text-muted);">${t.txnId}</div>`:''}</td>
                    <td style="font-weight:700;color:${t.type==='credit'?'var(--green)':'var(--red)'};">${t.type==='credit'?'+':'-'}${Utils.formatCurrency(t.amount)}</td>
                    <td style="font-size:0.82rem;">${Utils.formatCurrency(t.balance)}</td>
                    <td>${t.flagged?'<span class="fraud-flag"><i data-lucide="alert-triangle" width="10" height="10"></i> Flagged</span>':'<span class="badge badge-green">OK</span>'}</td>
                </tr>`).join('')}
            </tbody>
        </table>
    </div>`;

    // Pagination
    if (pagWrapper && result.totalPages > 1) {
        const s = DB.session.get();
        let paginationHTML = `<button class="page-btn" onclick="renderHistoryTable('${s.accountId}',${page-1})" ${page<=1?'disabled':''}></button>`;
        for (let i = 1; i <= result.totalPages; i++) {
            if (i === 1 || i === result.totalPages || Math.abs(i - page) <= 1) {
                paginationHTML += `<button class="page-btn ${i===page?'active':''}" onclick="renderHistoryTable('${s.accountId}',${i})">${i}</button>`;
            } else if (Math.abs(i - page) === 2) {
                paginationHTML += `<span style="color:var(--text-muted);padding:0 4px;"></span>`;
            }
        }
        paginationHTML += `<button class="page-btn" onclick="renderHistoryTable('${s.accountId}',${page+1})" ${page>=result.totalPages?'disabled':''}></button>`;
        pagWrapper.innerHTML = paginationHTML;
    } else if (pagWrapper) { pagWrapper.innerHTML = ''; }

    UI.renderIcons();
}

function applyHistoryFilters() {
    const s = DB.session.get();
    if (s) renderHistoryTable(s.accountId, 1);
}

function clearHistoryFilters() {
    ['hist-search','hist-type','hist-from','hist-to'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = el.tagName === 'SELECT' ? 'all' : '';
    });
    applyHistoryFilters();
}

function exportTxnCSV() {
    const s = DB.session.get();
    if (s) { Transactions.exportToCSV(s.accountId); UI.toast('success','CSV Exported','Transaction history downloaded'); }
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ Loans Ã¢â€â‚¬Ã¢â€â‚¬ */
function selectLoanType(type, rate) {
    Object.keys(Utils.LOAN_TYPES).forEach(t => document.getElementById(`lt-${t}`)?.classList.remove('selected'));
    document.getElementById(`lt-${type}`)?.classList.add('selected');
    const inp = document.getElementById('loan-type');
    if (inp) inp.value = type;
    const rateInp = document.getElementById('loan-rate');
    if (rateInp) rateInp.value = rate;
    updateLoanCalc();
}

function updateLoanCalc() {
    const principal = Number(document.getElementById('loan-amount')?.value);
    const tenure    = Number(document.getElementById('loan-tenure')?.value);
    const rate      = Number(document.getElementById('loan-rate')?.value || 12);
    const calcBox   = document.getElementById('loan-calc');
    if (!principal || !tenure || !calcBox) return;
    const res = Loans.calculate(principal, rate, tenure);
    if (!res) return;
    calcBox.style.display = 'block';
    document.getElementById('calc-emi').textContent      = Utils.formatCurrency(res.emi);
    document.getElementById('calc-interest').textContent = Utils.formatCurrency(res.totalInterest);
    document.getElementById('calc-total').textContent    = Utils.formatCurrency(res.totalCost);
}

function handleLoanApply() {
    const s = DB.session.get();
    const btn = document.getElementById('loan-apply-btn');
    const err = document.getElementById('loan-error');
    const loanType = document.getElementById('loan-type')?.value;
    const amount   = document.getElementById('loan-amount')?.value;
    const tenure   = document.getElementById('loan-tenure')?.value;
    const pin      = document.getElementById('loan-pin')?.value;
    const rate     = Number(document.getElementById('loan-rate')?.value || 12);
    UI.setLoading(btn, true);
    err.classList.add('hidden');

    (async () => {
        try {
            // PIN check locally
            const customer = DB.customers.byId(s.customerId);
            if (customer?.pin && customer.pin !== pin) {
                UI.setLoading(btn, false);
                err.textContent = 'Incorrect PIN.';
                err.classList.remove('hidden');
                return;
            }
            let result;
            if (API.isConnected()) {
                result = await API.applyLoan(s.customerId, s.accountId, loanType, amount, tenure, rate);
            } else {
                result = await new Promise(r => setTimeout(() => r(Loans.apply(s.customerId, s.accountId, loanType, amount, tenure, pin)), 900));
            }
            UI.setLoading(btn, false);
            if (result.success) {
                UI.toast('success', 'Loan Approved!', `${loanType} loan of ${Utils.formatCurrency(Number(amount))} disbursed.`);
                Router.navigate('loans');
            } else {
                err.textContent = result.error;
                err.classList.remove('hidden');
            }
        } catch (e) {
            UI.setLoading(btn, false);
            err.textContent = e.message;
            err.classList.remove('hidden');
        }
    })();
}

function showPayEMIModal(loanId, emi) {
    UI.openModal(`
    <h2 class="modal-title">Pay Loan EMI</h2>
    <div class="modal-body">
        <div class="alert alert-info" style="margin-bottom:1rem;font-size:0.85rem;">EMI Amount: <strong>${Utils.formatCurrency(Number(emi))}</strong></div>
        <div class="form-group">
            <label class="form-label">Confirm PIN</label>
            <div class="input-wrapper">
                <input class="form-input has-icon-right" type="password" id="emi-pin" placeholder="Enter PIN" maxlength="6">
                <span class="input-icon-right" onclick="togglePIN('emi-pin',this)"><i data-lucide="eye" width="16" height="16"></i></span>
            </div>
        </div>
        <div id="emi-error" class="alert alert-danger hidden" style="margin-top:0.75rem;font-size:0.82rem;padding:10px 14px;"></div>
    </div>
    <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-primary" id="emi-pay-btn" onclick="submitEMI('${loanId}')">
            <i data-lucide="credit-card" width="14" height="14"></i> Pay EMI
        </button>
    </div>`);
    UI.renderIcons();
}

function submitEMI(loanId) {
    const s = DB.session.get();
    const btn = document.getElementById('emi-pay-btn');
    const err = document.getElementById('emi-error');
    const pin = document.getElementById('emi-pin')?.value;
    UI.setLoading(btn, true);
    err.classList.add('hidden');

    (async () => {
        try {
            const customer = DB.customers.byId(s.customerId);
            if (customer?.pin && customer.pin !== pin) {
                UI.setLoading(btn, false);
                err.textContent = 'Incorrect PIN.';
                err.classList.remove('hidden');
                return;
            }
            let result;
            if (API.isConnected()) {
                result = await API.payEMI(s.accountId, loanId);
            } else {
                result = await new Promise(r => setTimeout(() => r(Transactions.payEMI(s.accountId, loanId, pin)), 700));
            }
            UI.setLoading(btn, false);
            if (result.success) {
                UI.closeModal();
                UI.toast('success', 'EMI Paid!', result.loanStatus === 'closed' ? ' Congratulations! Loan fully repaid!' : 'EMI payment successful');
                Router.navigate('loans');
            } else {
                err.textContent = result.error;
                err.classList.remove('hidden');
            }
        } catch (e) {
            UI.setLoading(btn, false);
            err.textContent = e.message;
            err.classList.remove('hidden');
        }
    })();
}

function showAmortizationModal(loanId) {
    const loan = DB.loans.byId(loanId);
    if (!loan) return;
    const schedule = Utils.generateAmortization(loan.principal, loan.rate, loan.tenureMonths);
    UI.openModal(`
    <h2 class="modal-title">Amortization Schedule</h2>
    <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:1rem;">${loan.type} Loan   ${Utils.formatCurrency(loan.principal)} @ ${loan.rate}% p.a. for ${loan.tenureMonths} months</p>
    <div class="modal-body emi-schedule">
        <table>
            <thead><tr><th>Month</th><th>EMI</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead>
            <tbody>
            ${schedule.map((r,i) => `
            <tr style="${i<loan.paidMonths?'background:rgba(16,185,129,0.05);':''}" >
                <td>${r.month}${i<loan.paidMonths?' ':''}</td>
                <td>${Utils.formatCurrency(r.emi)}</td>
                <td style="color:var(--green);">${Utils.formatCurrency(r.principal)}</td>
                <td style="color:var(--red);">${Utils.formatCurrency(r.interest)}</td>
                <td>${Utils.formatCurrency(r.balance)}</td>
            </tr>`).join('')}
            </tbody>
        </table>
    </div>
    <div class="modal-footer"><button class="btn btn-primary" onclick="UI.closeModal()">Close</button></div>`, true);
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ Admin helpers Ã¢â€â‚¬Ã¢â€â‚¬ */

/* Ã¢â€â‚¬Ã¢â€â‚¬ Admin helpers Ã¢â€â‚¬Ã¢â€â‚¬ */
function renderAdminCustomerTable(customers) {
    if (!customers.length) return `<div class="empty-state" style="padding:2rem;"><i data-lucide="users" width="32" height="32"></i><h3>No customers found</h3></div>`;
    return `<table>
        <thead><tr><th>Name</th><th>Phone</th><th>Account No.</th><th>Type</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
            ${customers.map(c => `
            <tr>
                <td><div style="display:flex;align-items:center;gap:8px;">
                    <div class="avatar" style="width:30px;height:30px;font-size:0.65rem;">${Utils.initials(c.name)}</div>
                    <div><div class="td-primary" style="font-size:0.82rem;">${Utils.sanitize(c.name)}</div><div style="font-size:0.7rem;color:var(--text-muted);">${c.email}</div></div>
                </div></td>
                <td>${c.phone}</td>
                <td class="td-mono" style="font-size:0.78rem;">${c.primaryAccount?.accountNumber || ' '}</td>
                <td>${c.primaryAccount?.type || ' '}</td>
                <td style="color:var(--green);font-weight:600;">${Utils.formatCurrency(c.totalBalance)}</td>
                <td>${c.status === 'active' ? '<span class="badge badge-green">Active</span>' : '<span class="badge badge-red">Inactive</span>'}
                    ${c.primaryAccount?.frozen ? '<span class="badge badge-red" style="margin-left:4px;">Frozen</span>' : ''}</td>
                <td>
                    <div style="display:flex;gap:4px;">
                        <button class="btn btn-ghost btn-sm" style="padding:4px 8px;font-size:0.7rem;" onclick="showCustomerDetail('${c.id}')">View</button>
                        ${c.primaryAccount?.frozen
                            ? `<button class="btn btn-success btn-sm" style="padding:4px 8px;font-size:0.7rem;" onclick="toggleFreeze('${c.primaryAccount?.id}',false)">Unfreeze</button>`
                            : `<button class="btn btn-danger btn-sm" style="padding:4px 8px;font-size:0.7rem;" onclick="toggleFreeze('${c.primaryAccount?.id}',true)">Freeze</button>`}
                    </div>
                </td>
            </tr>`).join('')}
        </tbody>
    </table>`;
}

function adminSearch(q) {
    const customers = Admin.searchCustomers(q);
    const el = document.getElementById('admin-customer-table');
    if (el) { el.innerHTML = renderAdminCustomerTable(customers); UI.renderIcons(); }
}

function showCustomerDetail(customerId) {
    const profile = Admin.getCustomerProfile(customerId);
    if (!profile) return;
    const { customer, accounts, loans, recentTxns } = profile;
    UI.openModal(`
    <h2 class="modal-title">${customer.name}</h2>
    <div class="modal-body">
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.25rem;">
            <div class="avatar avatar-lg">${Utils.initials(customer.name)}</div>
            <div>
                <div style="font-size:0.82rem;color:var(--text-muted);">Customer ID: ${customer.id}</div>
                <div style="font-size:0.82rem;">${customer.phone} | ${customer.email}</div>
                <div style="font-size:0.82rem;margin-top:2px;">${customer.address}</div>
            </div>
        </div>
        ${accounts.map(a => `
        <div class="card" style="margin-bottom:1rem;">
            <div class="txn-summary-row"><span class="ts-label">Account No.</span><span class="ts-value td-mono">${a.accountNumber}</span></div>
            <div class="txn-summary-row"><span class="ts-label">Type</span><span class="ts-value">${a.type}</span></div>
            <div class="txn-summary-row"><span class="ts-label">Balance</span><span class="ts-value" style="color:var(--green);">${Utils.formatCurrency(a.balance)}</span></div>
            <div class="txn-summary-row"><span class="ts-label">Status</span><span class="ts-value">${a.frozen ? '<span class="badge badge-red">Frozen</span>' : '<span class="badge badge-green">Active</span>'}</span></div>
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.75rem;">
                <button class="btn btn-secondary btn-sm" style="font-size:0.75rem;" onclick="UI.closeModal();showAdminCreditModalFor('${a.id}','${Utils.sanitize(customer.name)}')">
                    <i data-lucide="plus-circle" width="12" height="12"></i> Credit
                </button>
                <button class="btn btn-danger btn-sm" style="font-size:0.75rem;" onclick="UI.closeModal();showAdminDebitModal('${a.id}','${Utils.sanitize(customer.name)}')">
                    <i data-lucide="minus-circle" width="12" height="12"></i> Debit
                </button>
                ${a.frozen
                    ? `<button class="btn btn-success btn-sm" style="font-size:0.75rem;" onclick="UI.closeModal();toggleFreeze('${a.id}',false)"><i data-lucide="unlock" width="12" height="12"></i> Unfreeze</button>`
                    : `<button class="btn btn-warning btn-sm" style="font-size:0.75rem;" onclick="UI.closeModal();toggleFreeze('${a.id}',true)"><i data-lucide="lock" width="12" height="12"></i> Freeze</button>`
                }
            </div>
        </div>`).join('')}
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem;">
            <button class="btn btn-secondary btn-sm" style="font-size:0.75rem;" onclick="UI.closeModal();showAdminResetPINModal('${customer.id}','${Utils.sanitize(customer.name)}')">
                <i data-lucide="key" width="12" height="12"></i> Reset PIN
            </button>
            <button class="btn btn-danger btn-sm" style="font-size:0.75rem;" onclick="confirmDeleteCustomer('${customer.id}','${Utils.sanitize(customer.name)}')">
                <i data-lucide="trash-2" width="12" height="12"></i> Delete Customer
            </button>
        </div>
        ${recentTxns.length ? `<h4 style="margin-bottom:0.75rem;">Recent Transactions</h4>
        ${recentTxns.slice(0,5).map(t=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:0.8rem;">
            <div><div style="color:var(--text-primary);">${Utils.sanitize(t.description).substring(0,35)}</div><div style="color:var(--text-muted);font-size:0.7rem;">${Utils.formatDate(t.timestamp)}</div></div>
            <div style="color:${t.type==='credit'?'var(--green)':'var(--red)'};font-weight:700;">${t.type==='credit'?'+':'-'}${Utils.formatCurrency(t.amount)}</div>
        </div>`).join('')}` : ''}
    </div>
    <div class="modal-footer"><button class="btn btn-primary" onclick="UI.closeModal()">Close</button></div>`, true);
    UI.renderIcons();
}

function toggleFreeze(accountId, freeze) {
    if (!accountId) { UI.toast('error','No account'); return; }
    (async () => {
        try {
            if (API.isConnected()) {
                if (freeze) await API.freezeAccount(accountId, 'Admin action');
                else        await API.unfreezeAccount(accountId);
                await API.refreshFromMySQL();
            }
            // Also update localStorage
            if (freeze) Accounts.freezeAccount(accountId, 'Admin action');
            else        Accounts.unfreezeAccount(accountId);
            UI.toast('success', freeze ? 'Account Frozen' : 'Account Unfrozen',
                     freeze ? 'Account has been frozen.' : 'Account has been unfrozen.');
        } catch (e) {
            UI.toast('error', 'Error', e.message);
        }
        Router.navigate('admin');
    })();
}

function resolveFlag(txnId) {
    (async () => {
        try {
            if (API.isConnected()) await API.resolveFraudFlag(txnId);
            Admin.resolveFraudFlag(txnId);
            UI.toast('success','Flag Resolved','Transaction marked as resolved.');
        } catch(e) {
            UI.toast('error','Error',e.message);
        }
        Router.navigate('admin');
    })();
}

function showAdminCreditModal() {
    const customers = Admin.getAllCustomers();
    UI.openModal(`
    <h2 class="modal-title">Credit Customer Account</h2>
    <div class="modal-body">
        <div class="form-group" style="margin-bottom:1rem;">
            <label class="form-label">Select Customer</label>
            <select class="form-select" id="admin-credit-acc">
                ${customers.map(c => `<option value="${c.primaryAccount?.id}">${c.name}   ${c.primaryAccount?.accountNumber || 'No account'}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Amount</label>
            <div class="input-wrapper"><input class="form-input has-icon-left" type="number" id="admin-credit-amt" placeholder="Enter amount"><span class="input-icon-left" style="color:var(--accent-gold);font-weight:700;">  </span></div>
        </div>
        <div class="form-group" style="margin-top:1rem;">
            <label class="form-label">Description</label>
            <input class="form-input" type="text" id="admin-credit-desc" value="Admin Credit">
        </div>
    </div>
    <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitAdminCredit()">Credit Account</button>
    </div>`);
    UI.renderIcons();
}

function showAdminDebitModalMain() {
    const customers = Admin.getAllCustomers();
    UI.openModal(`
    <h2 class="modal-title">Debit Customer Account</h2>
    <div class="modal-body">
        <div class="alert alert-danger" style="margin-bottom:1rem;font-size:0.82rem;padding:10px 14px;">
            <i data-lucide="alert-triangle" width="14" height="14"></i> This will deduct funds from the customer's account.
        </div>
        <div class="form-group" style="margin-bottom:1rem;">
            <label class="form-label">Select Customer</label>
            <select class="form-select" id="admin-debit-acc">
                ${customers.map(c => `<option value="${c.primaryAccount?.id}">${c.name}   ${c.primaryAccount?.accountNumber || 'No account'}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Amount</label>
            <div class="input-wrapper"><input class="form-input has-icon-left" type="number" id="admin-debit-amt-m" placeholder="Enter amount"><span class="input-icon-left" style="color:var(--red);font-weight:700;">  </span></div>
        </div>
        <div class="form-group" style="margin-top:1rem;">
            <label class="form-label">Description</label>
            <input class="form-input" type="text" id="admin-debit-desc-m" value="Admin Debit">
        </div>
    </div>
    <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-danger" onclick="submitAdminDebitMain()">Debit Account</button>
    </div>`);
    UI.renderIcons();
}

/* Admin Credit pre-filled for a specific account */
function showAdminCreditModalFor(accountId, customerName) {
    UI.openModal(`
    <h2 class="modal-title">Credit Account   ${customerName}</h2>
    <div class="modal-body">
        <div class="form-group">
            <label class="form-label">Amount</label>
            <div class="input-wrapper"><input class="form-input has-icon-left" type="number" id="admin-credit-amt-f" placeholder="Enter amount"><span class="input-icon-left" style="color:var(--accent-gold);font-weight:700;">  </span></div>
        </div>
        <div class="form-group" style="margin-top:1rem;">
            <label class="form-label">Description</label>
            <input class="form-input" type="text" id="admin-credit-desc-f" value="Admin Credit">
        </div>
        <div id="admin-credit-err-f" class="alert alert-danger hidden" style="margin-top:0.75rem;font-size:0.82rem;padding:10px 14px;"></div>
    </div>
    <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-primary" id="admin-credit-btn-f" onclick="submitAdminCreditFor('${accountId}')">
            <i data-lucide="plus-circle" width="14" height="14"></i> Credit Account
        </button>
    </div>`);
    UI.renderIcons();
}

function submitAdminCreditFor(accountId) {
    const btn = document.getElementById('admin-credit-btn-f');
    const err = document.getElementById('admin-credit-err-f');
    const amt  = document.getElementById('admin-credit-amt-f')?.value;
    const desc = document.getElementById('admin-credit-desc-f')?.value || 'Admin Credit';
    if (!amt || Number(amt) <= 0) { err.textContent = 'Enter a valid amount.'; err.classList.remove('hidden'); return; }
    UI.setLoading(btn, true); err.classList.add('hidden');
    (async () => {
        try {
            if (API.isConnected()) { await API.adminCredit(accountId, amt, desc); }
            else { const r = Admin.adminCredit(accountId, amt, desc); if (!r.success) throw new Error(r.error); }
            UI.closeModal();
            UI.toast('success', 'Credit Applied', `${Utils.formatCurrency(Number(amt))} credited successfully`);
            Router.navigate('admin');
        } catch(e) { UI.setLoading(btn, false); err.textContent = e.message; err.classList.remove('hidden'); }
    })();
}

/* Admin Debit from a specific account */
function showAdminDebitModal(accountId, customerName) {
    UI.openModal(`
    <h2 class="modal-title">Debit Account   ${customerName}</h2>
    <div class="modal-body">
        <div class="alert alert-danger" style="margin-bottom:1rem;font-size:0.82rem;padding:10px 14px;">
            <i data-lucide="alert-triangle" width="14" height="14"></i> This will deduct funds from the customer's account.
        </div>
        <div class="form-group">
            <label class="form-label">Amount</label>
            <div class="input-wrapper"><input class="form-input has-icon-left" type="number" id="admin-debit-amt" placeholder="Enter amount"><span class="input-icon-left" style="color:var(--red);font-weight:700;">  </span></div>
        </div>
        <div class="form-group" style="margin-top:1rem;">
            <label class="form-label">Description</label>
            <input class="form-input" type="text" id="admin-debit-desc" value="Admin Adjustment">
        </div>
        <div id="admin-debit-err" class="alert alert-danger hidden" style="margin-top:0.75rem;font-size:0.82rem;padding:10px 14px;"></div>
    </div>
    <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-danger" id="admin-debit-btn" onclick="submitAdminDebit('${accountId}')">
            <i data-lucide="minus-circle" width="14" height="14"></i> Debit Account
        </button>
    </div>`);
    UI.renderIcons();
}

function submitAdminDebit(accountId) {
    const btn = document.getElementById('admin-debit-btn');
    const err = document.getElementById('admin-debit-err');
    const amt  = document.getElementById('admin-debit-amt')?.value;
    const desc = document.getElementById('admin-debit-desc')?.value || 'Admin Adjustment';
    if (!amt || Number(amt) <= 0) { err.textContent = 'Enter a valid amount.'; err.classList.remove('hidden'); return; }
    UI.setLoading(btn, true); err.classList.add('hidden');
    (async () => {
        try {
            if (API.isConnected()) { await API.adminDebit(accountId, amt, desc); }
            else {
                const accs = JSON.parse(localStorage.getItem('sb_accounts') || '[]');
                const idx = accs.findIndex(a => a.id === accountId);
                if (idx === -1) throw new Error('Account not found.');
                if (accs[idx].balance < Number(amt)) throw new Error('Insufficient balance.');
                accs[idx].balance -= Number(amt);
                localStorage.setItem('sb_accounts', JSON.stringify(accs));
            }
            UI.closeModal();
            UI.toast('success', 'Debit Applied', `${Utils.formatCurrency(Number(amt))} debited successfully`);
            Router.navigate('admin');
        } catch(e) { UI.setLoading(btn, false); err.textContent = e.message; err.classList.remove('hidden'); }
    })();
}

/* Admin Reset Customer PIN */
function showAdminResetPINModal(customerId, customerName) {
    UI.openModal(`
    <h2 class="modal-title">Reset PIN   ${customerName}</h2>
    <div class="modal-body">
        <div class="form-group">
            <label class="form-label">New PIN</label>
            <div class="input-wrapper">
                <input class="form-input has-icon-right" type="password" id="admin-new-pin" placeholder="New PIN (4-6 digits)" maxlength="6">
                <span class="input-icon-right" onclick="togglePIN('admin-new-pin',this)"><i data-lucide="eye" width="16" height="16"></i></span>
            </div>
        </div>
        <div class="form-group" style="margin-top:1rem;">
            <label class="form-label">Confirm New PIN</label>
            <div class="input-wrapper">
                <input class="form-input has-icon-right" type="password" id="admin-confirm-pin" placeholder="Confirm PIN" maxlength="6">
                <span class="input-icon-right" onclick="togglePIN('admin-confirm-pin',this)"><i data-lucide="eye" width="16" height="16"></i></span>
            </div>
        </div>
        <div id="admin-pin-err" class="alert alert-danger hidden" style="margin-top:0.75rem;font-size:0.82rem;padding:10px 14px;"></div>
    </div>
    <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-primary" id="admin-pin-btn" onclick="submitAdminResetPIN('${customerId}')">
            <i data-lucide="key" width="14" height="14"></i> Reset PIN
        </button>
    </div>`);
    UI.renderIcons();
}

function submitAdminResetPIN(customerId) {
    const btn = document.getElementById('admin-pin-btn');
    const err = document.getElementById('admin-pin-err');
    const newPin     = document.getElementById('admin-new-pin')?.value;
    const confirmPin = document.getElementById('admin-confirm-pin')?.value;
    if (!newPin || newPin.length < 4) { err.textContent = 'PIN must be at least 4 digits.'; err.classList.remove('hidden'); return; }
    if (newPin !== confirmPin) { err.textContent = 'PINs do not match.'; err.classList.remove('hidden'); return; }
    UI.setLoading(btn, true); err.classList.add('hidden');
    (async () => {
        try {
            if (API.isConnected()) { await API.resetCustomerPIN(customerId, newPin); }
            else { DB.customers.update(customerId, { pin: newPin }); }
            UI.closeModal();
            UI.toast('success', 'PIN Reset', 'Customer PIN has been reset successfully.');
        } catch(e) { UI.setLoading(btn, false); err.textContent = e.message; err.classList.remove('hidden'); }
    })();
}

/* Admin Delete Customer */
function confirmDeleteCustomer(customerId, customerName) {
    UI.openModal(`
    <h2 class="modal-title" style="color:var(--red);">Delete Customer</h2>
    <div class="modal-body">
        <div class="alert alert-danger" style="margin-bottom:1rem;font-size:0.88rem;">
            <i data-lucide="alert-triangle" width="16" height="16"></i>
            <strong>Warning:</strong> This action is irreversible. All accounts, transactions, and loans for <strong>${customerName}</strong> will be permanently deleted.
        </div>
        <p style="font-size:0.85rem;color:var(--text-muted);">Are you sure you want to delete this customer?</p>
        <div id="admin-delete-err" class="alert alert-danger hidden" style="margin-top:0.75rem;font-size:0.82rem;padding:10px 14px;"></div>
    </div>
    <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-danger" id="admin-delete-btn" onclick="submitDeleteCustomer('${customerId}')">
            <i data-lucide="trash-2" width="14" height="14"></i> Delete Permanently
        </button>
    </div>`);
    UI.renderIcons();
}

function submitDeleteCustomer(customerId) {
    const btn = document.getElementById('admin-delete-btn');
    const err = document.getElementById('admin-delete-err');
    UI.setLoading(btn, true); err.classList.add('hidden');
    (async () => {
        try {
            if (API.isConnected()) {
                await API.deleteCustomer(customerId);
                await API.refreshFromMySQL();
            } else {
                // LocalStorage delete
                const accs = JSON.parse(localStorage.getItem('sb_accounts') || '[]').filter(a => a.customerId !== customerId);
                const accIds = JSON.parse(localStorage.getItem('sb_accounts') || '[]').filter(a => a.customerId === customerId).map(a => a.id);
                const txns = JSON.parse(localStorage.getItem('sb_transactions') || '[]').filter(t => !accIds.includes(t.accountId));
                const loans = JSON.parse(localStorage.getItem('sb_loans') || '[]').filter(l => l.customerId !== customerId);
                const custs = JSON.parse(localStorage.getItem('sb_customers') || '[]').filter(c => c.id !== customerId);
                localStorage.setItem('sb_accounts', JSON.stringify(accs));
                localStorage.setItem('sb_transactions', JSON.stringify(txns));
                localStorage.setItem('sb_loans', JSON.stringify(loans));
                localStorage.setItem('sb_customers', JSON.stringify(custs));
            }
            UI.closeModal();
            UI.toast('success', 'Customer Deleted', 'Customer and all associated data have been removed.');
            Router.navigate('admin');
        } catch(e) { UI.setLoading(btn, false); err.textContent = e.message; err.classList.remove('hidden'); }
    })();
}

function submitAdminCredit() {
    const accId = document.getElementById('admin-credit-acc')?.value;
    const amt   = document.getElementById('admin-credit-amt')?.value;
    const desc  = document.getElementById('admin-credit-desc')?.value || 'Admin Credit';
    (async () => {
        try {
            if (API.isConnected()) {
                await API.adminCredit(accId, amt, desc);
            } else {
                const result = Admin.adminCredit(accId, amt, desc);
                if (!result.success) { UI.toast('error','Error',result.error); return; }
            }
            UI.closeModal();
            UI.toast('success','Credit Applied',`${Utils.formatCurrency(Number(amt))} credited successfully`);
            Router.navigate('admin');
        } catch(e) {
            UI.toast('error','Error',e.message);
        }
    })();
}

function submitAdminDebitMain() {
    const accId = document.getElementById('admin-debit-acc')?.value;
    const amt   = document.getElementById('admin-debit-amt-m')?.value;
    const desc  = document.getElementById('admin-debit-desc-m')?.value || 'Admin Debit';
    if (!amt || Number(amt) <= 0) { UI.toast('error','Error','Invalid amount'); return; }
    (async () => {
        try {
            if (API.isConnected()) {
                await API.adminDebit(accId, amt, desc);
            } else {
                const accs = JSON.parse(localStorage.getItem('sb_accounts') || '[]');
                const idx = accs.findIndex(a => a.id === accId);
                if (idx === -1) throw new Error('Account not found.');
                if (accs[idx].balance < Number(amt)) throw new Error('Insufficient balance.');
                accs[idx].balance -= Number(amt);
                localStorage.setItem('sb_accounts', JSON.stringify(accs));
            }
            UI.closeModal();
            UI.toast('success','Debit Applied',`${Utils.formatCurrency(Number(amt))} debited successfully`);
            Router.navigate('admin');
        } catch(e) {
            UI.toast('error','Error',e.message);
        }
    })();
}

function showFreezeModal() {
    const customers = Admin.getAllCustomers().filter(c => c.primaryAccount && !c.primaryAccount.frozen);
    UI.openModal(`
    <h2 class="modal-title">Freeze Account</h2>
    <div class="modal-body">
        <div class="form-group">
            <label class="form-label">Select Account to Freeze</label>
            <select class="form-select" id="freeze-acc-select">
                ${customers.map(c => `<option value="${c.primaryAccount?.id}">${c.name}   ${c.primaryAccount?.accountNumber}</option>`).join('')}
            </select>
        </div>
    </div>
    <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-danger" onclick="toggleFreeze(document.getElementById('freeze-acc-select').value,true);UI.closeModal();">
            <i data-lucide="lock" width="14" height="14"></i> Freeze
        </button>
    </div>`);
    UI.renderIcons();
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ Profile / Change PIN Ã¢â€â‚¬Ã¢â€â‚¬ */
function showChangePINModal() {
    const s = DB.session.get();
    UI.openModal(`
    <h2 class="modal-title">Change PIN</h2>
    <div class="modal-body">
        <div class="form-group" style="margin-bottom:1rem;">
            <label class="form-label">Current PIN</label>
            <div class="input-wrapper"><input class="form-input has-icon-right" type="password" id="old-pin" placeholder="Current PIN" maxlength="6"><span class="input-icon-right" onclick="togglePIN('old-pin',this)"><i data-lucide="eye" width="16" height="16"></i></span></div>
        </div>
        <div class="form-group" style="margin-bottom:1rem;">
            <label class="form-label">New PIN</label>
            <div class="input-wrapper"><input class="form-input has-icon-right" type="password" id="new-pin" placeholder="New PIN (4-6 digits)" maxlength="6"><span class="input-icon-right" onclick="togglePIN('new-pin',this)"><i data-lucide="eye" width="16" height="16"></i></span></div>
        </div>
        <div class="form-group">
            <label class="form-label">Confirm New PIN</label>
            <div class="input-wrapper"><input class="form-input has-icon-right" type="password" id="confirm-new-pin" placeholder="Confirm new PIN" maxlength="6"><span class="input-icon-right" onclick="togglePIN('confirm-new-pin',this)"><i data-lucide="eye" width="16" height="16"></i></span></div>
        </div>
        <div id="pin-change-error" class="alert alert-danger hidden" style="margin-top:0.75rem;font-size:0.82rem;padding:10px 14px;"></div>
    </div>
    <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-primary" id="pin-change-btn" onclick="submitChangePIN()">Change PIN</button>
    </div>`);
    UI.renderIcons();
}

function submitChangePIN() {
    const s = DB.session.get();
    const btn = document.getElementById('pin-change-btn');
    const err = document.getElementById('pin-change-error');
    const oldPin        = document.getElementById('old-pin')?.value;
    const newPin        = document.getElementById('new-pin')?.value;
    const confirmNewPin = document.getElementById('confirm-new-pin')?.value;
    UI.setLoading(btn, true);
    err.classList.add('hidden');

    (async () => {
        try {
            let result;
            if (API.isConnected()) {
                // Validate locally first
                const localResult = Auth.changePIN(s.customerId, oldPin, newPin, confirmNewPin);
                if (!localResult.success) { throw new Error(localResult.error); }
                await API.changePIN(s.customerId, oldPin, newPin);
                result = { success: true };
            } else {
                result = Auth.changePIN(s.customerId, oldPin, newPin, confirmNewPin);
            }
            UI.setLoading(btn, false);
            if (result.success) {
                UI.closeModal();
                UI.toast('success','PIN Changed','Your PIN has been updated successfully.');
            } else {
                err.textContent = result.error;
                err.classList.remove('hidden');
            }
        } catch (e) {
            UI.setLoading(btn, false);
            err.textContent = e.message;
            err.classList.remove('hidden');
        }
    })();
}

/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
   MODAL & GLOBAL SETUP
Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */
document.addEventListener('DOMContentLoaded', async () => {
    // Apply saved theme immediately (before any render)
    initTheme();

    // Modal close
    document.getElementById('modal-close-btn')?.addEventListener('click', UI.closeModal);
    document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal-overlay')) UI.closeModal();
    });

    // Loading animation
    const loadingBar = document.querySelector('.loading-bar-fill');
    if (loadingBar) loadingBar.style.animationDuration = '1.5s';

    // Attempt MySQL connection
    API.init().then(connected => {
        if (connected) {
            console.log('[  ApkaGullak] MySQL connected   data loaded from database');
        } else {
            console.warn('[  ApkaGullak] MySQL offline   using localStorage fallback');
            DB.seed(); // Seed demo data ONLY if offline
        }
    }).catch(() => {
        console.warn('[  ApkaGullak] MySQL offline   using localStorage fallback');
        DB.seed();
    });

    // Show app after loading animation
    setTimeout(() => {
        const ls = document.getElementById('loading-screen');
        if (ls) ls.classList.add('fade-out');
        setTimeout(() => {
            if (ls) ls.style.display = 'none';
            window.addEventListener('hashchange', () => {
                Router.render();
                _applyThemeUI(localStorage.getItem('sb_theme') || 'dark');
                UI.renderIcons();
            });
            Router.render();
            _applyThemeUI(localStorage.getItem('sb_theme') || 'dark');
        }, 600);
    }, 1800);
});
