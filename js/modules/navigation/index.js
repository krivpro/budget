export class NavigationModule {
    constructor() {
        this.currentTab = 'main';
        this.tabContents = document.querySelectorAll('.tab-content');
        this.navItems = document.querySelectorAll('.bottom-nav__item');
    }

    init() {
        console.log('Initializing Navigation Module');
        
        this.setupEventListeners();
        this.showTab('main'); // Показываем главную вкладку по умолчанию
        
        return this;
    }

    setupEventListeners() {
        // Обработчики кликов по навигации
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.dataset.tab;
                if (tab) {
                    this.switchTab(tab);
                }
            });
        });

        // Обработка истории браузера для поддержки кнопок назад/вперед
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.tab) {
                this.showTab(e.state.tab);
            }
        });
    }

    switchTab(tabName) {
        if (this.currentTab === tabName) return;
        
        this.showTab(tabName);
        
        // Обновляем URL без перезагрузки страницы
        const newUrl = `${window.location.pathname}#${tabName}`;
        window.history.pushState({ tab: tabName }, '', newUrl);
    }

    showTab(tabName) {
        // Скрываем все вкладки
        this.tabContents.forEach(content => {
            content.classList.remove('active');
        });

        // Показываем выбранную вкладку
        const targetTab = document.querySelector(`.tab-content[data-tab="${tabName}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        // Обновляем активное состояние навигации
        this.navItems.forEach(item => {
            if (item.dataset.tab === tabName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        this.currentTab = tabName;

        // Прокручиваем вверх при переключении вкладок
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Событие для других модулей
        window.dispatchEvent(new CustomEvent('tab:changed', { 
            detail: { tab: tabName } 
        }));
    }

    getCurrentTab() {
        return this.currentTab;
    }
}

export default NavigationModule;

