// Модуль навигации
class NavigationModule {
    constructor(app) {
        this.app = app;
        this.currentTab = 'main';
    }

    async init() {
        console.log('🧭 Navigation Module: init() called');
        
        this.setupEventListeners();
        
        console.log('✅ Navigation Module: initialization complete');
        
        return this;
    }

    setupEventListeners() {
        // Обработчики кликов по навигации
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
        
        // Обновляем активное состояние навигации
        document.querySelectorAll('.bottom-nav__item').forEach(item => {
            if (item.dataset.tab === tabName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        this.currentTab = tabName;

        // Отправляем событие
        if (this.app && this.app.emit) {
            this.app.emit('tab:changed', { tab: tabName });
        }
        
        console.log(`📱 Navigation: switched to tab: ${tabName}`);
    }
}

export default NavigationModule;