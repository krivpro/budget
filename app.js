// Главный файл приложения - инициализирует систему модулей
import { MODULES_CONFIG } from './constants/modules-config.js';

class BudgetApp {
    constructor() {
        this.modules = {};
        this.config = MODULES_CONFIG;
        this.appContainer = document.getElementById('app');
        this.currentTab = 'main';
        this.initialized = false;
        this.eventListeners = new Map();
    }

    async init() {
        if (this.initialized) {
            return;
        }

        try {
            // 1. Создаем основную структуру приложения
            this.createAppStructure();
            
            // 2. Загружаем модули в правильном порядке
            await this.loadModules();
            
            // 3. Инициализируем вкладки
            this.initTabs();
            
            // 4. Показываем приложение
            this.showApp();
            
            this.initialized = true;
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Не удалось загрузить приложение');
            this.hideLoader();
        }
    }

    createAppStructure() {
        // Создаем основной контейнер для контента
        this.appContent = document.createElement('div');
        this.appContent.className = 'app-content';
        this.appContent.style.display = 'none';
        this.appContainer.appendChild(this.appContent);

        // Создаем контейнер для модальных окон
        this.modalsContainer = document.createElement('div');
        this.modalsContainer.id = 'modals-container';
        this.appContainer.appendChild(this.modalsContainer);
    }

    async loadModules() {
        // Порядок загрузки важен!
        const loadOrder = [
            'ui',           // Сначала общие UI компоненты
            'header',       // Потом шапка
            'navigation',   // Потом навигация
            'calendar',     // Календарь нужен для форм
            'chart',        // Графики для главной вкладки
            'operations',   // Главная вкладка
            'expected-incomes', // Вкладка ожидаемых доходов
            'plans',        // Вкладка планов
            'settings',     // Вкладка настроек
        ];
        
        for (const moduleName of loadOrder) {
            if (this.config[moduleName]) {
                try {
                    await this.loadSingleModule(moduleName);
                } catch (error) {
                    console.warn(`Module ${moduleName} failed to load:`, error);
                    // Продолжаем загрузку других модулей
                }
            }
        }
    }

    async loadSingleModule(moduleName) {
        // Загружаем модуль
        const modulePath = `./modules/${moduleName}/index.js`;
        
        try {
            const module = await import(modulePath);
            
            if (module.default && typeof module.default === 'function') {
                const ModuleClass = module.default;
                const instance = new ModuleClass(this);
                
                if (typeof instance.init === 'function') {
                    await instance.init();
                }
                
                this.modules[moduleName] = instance;
                console.log(`✅ Module "${moduleName}" loaded`);
            }
        } catch (error) {
            console.error(`❌ Failed to load module "${moduleName}":`, error);
            throw error;
        }
    }

    initTabs() {
        // По умолчанию показываем главную вкладку
        this.switchTab('main');
    }

    switchTab(tabName) {
        if (this.currentTab === tabName) return;
        
        this.currentTab = tabName;
        
        // Скрываем все вкладки
        const tabContents = this.appContent.querySelectorAll('.tab-content');
        tabContents.forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Показываем выбранную вкладку
        const targetTab = this.appContent.querySelector(`.tab-content[data-tab="${tabName}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        // Обновляем активное состояние в навигации
        const navItems = this.appContent.querySelectorAll('.bottom-nav__item');
        navItems.forEach(item => {
            if (item.dataset.tab === tabName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Уведомляем модули о смене вкладки
        this.emit('tab:changed', { tab: tabName });
    }

    showApp() {
        // Скрываем лоадер
        this.hideLoader();
        
        // Показываем контент
        this.appContent.style.display = 'block';
    }

    hideLoader() {
        const loader = this.appContainer.querySelector('.app-loading');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.remove();
                }
            }, 300);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'notification notification--error';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // Event system
    emit(eventName, data) {
        const listeners = this.eventListeners.get(eventName) || [];
        listeners.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for "${eventName}":`, error);
            }
        });
        
        // Также диспатчим DOM событие для совместимости
        window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }

    on(eventName, callback) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(callback);
        
        // Также слушаем DOM события для совместимости
        window.addEventListener(eventName, (e) => callback(e.detail));
    }

    // Public API для модулей
    getContainer() {
        return this.appContent;
    }

    getModalsContainer() {
        return this.modalsContainer;
    }

    getCurrentTab() {
        return this.currentTab;
    }

    getModule(name) {
        return this.modules[name];
    }
}

const app = new BudgetApp();

document.addEventListener('DOMContentLoaded', () => {
    app.init().catch(error => {
        console.error('Critical app error:', error);
        app.showError('Критическая ошибка приложения');
    });
});

window.budgetApp = app;

export default app;