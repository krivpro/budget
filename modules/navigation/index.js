// Модуль навигации
class NavigationModule {
    constructor(app) {
        this.app = app;
        this.currentTab = 'main';
    }

    async init() {
        this.setupEventListeners();
        return this;
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
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
        
        document.querySelectorAll('.bottom-nav__item').forEach(item => {
            if (item.dataset.tab === tabName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        this.currentTab = tabName;

        if (this.app && this.app.emit) {
            this.app.emit('tab:changed', { tab: tabName });
        }
    }
}

export default NavigationModule;