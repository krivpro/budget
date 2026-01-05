// modules/navigation/index.js
class NavigationModule {
    constructor(app) {
        this.app = app;
        this.currentTab = 'main';
    }

    async init() {
        console.log('Navigation Module initialized');
        this.createNavigation();
        this.setupEventListeners();
        return this;
    }

    createNavigation() {
        const appContent = this.app.getContainer();
        
        const navHTML = `
            <nav class="bottom-nav">
                <button class="bottom-nav__item active" data-tab="main" aria-label="Главная">
                    <svg class="bottom-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span class="bottom-nav__label">Главная</span>
                </button>
                <button class="bottom-nav__item" data-tab="expected" aria-label="Ожидаемые доходы">
                    <svg class="bottom-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <span class="bottom-nav__label">Ожидаемые</span>
                </button>
                <button class="bottom-nav__item" data-tab="plans" aria-label="Плановые расходы">
                    <svg class="bottom-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    <span class="bottom-nav__label">Планы</span>
                </button>
                <button class="bottom-nav__item" data-tab="settings" aria-label="Настройки">
                    <svg class="bottom-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
                    </svg>
                    <span class="bottom-nav__label">Настройки</span>
                </button>
            </nav>
        `;
        
        const navDiv = document.createElement('div');
        navDiv.innerHTML = navHTML;
        appContent.appendChild(navDiv.firstElementChild);
    }

    setupEventListeners() {
        const appContent = this.app.getContainer();
        
        appContent.addEventListener('click', (e) => {
            const navItem = e.target.closest('.bottom-nav__item');
            if (navItem) {
                e.preventDefault();
                const tab = navItem.dataset.tab;
                if (tab) {
                    this.switchTab(tab);
                }
            }
        });
    }

    switchTab(tabName) {
        if (this.currentTab === tabName) return;
        
        this.currentTab = tabName;
        this.app.switchTab(tabName);
    }
}

export default NavigationModule;