// Главный файл приложения - инициализирует систему модулей
import { MODULES_CONFIG } from './constants/modules-config.js';

class BudgetApp {
    constructor() {
        this.modules = {};
        this.config = MODULES_CONFIG;
        this.appContainer = document.getElementById('app');
        this.currentTab = 'main';
        this.initialized = false;
    }

    async init() {
        if (this.initialized) {
            return;
        }

        try {
            await this.loadModulesInOrder();
            this.setupModuleInteractions();
            this.setupNavigation();
            this.showTab(this.currentTab);
            this.hideLoader();
            
            this.initialized = true;
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Не удалось загрузить приложение');
            this.hideLoader();
        }
    }

    async loadModulesInOrder() {
        const loadOrder = [
            'navigation',
            'header',
            'ui',
            'calendar',
            'operations',
            'expected-incomes',
            'plans',
            'chart',
            'settings',
        ];
        
        for (const moduleName of loadOrder) {
            if (this.config[moduleName]) {
                await this.loadModule(moduleName);
            }
        }
    }

    async loadModule(moduleName) {
        await this.loadModuleTemplate(moduleName);
        await this.loadModuleStyles(moduleName);
        
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
            }
        } catch (error) {
            // Игнорируем ошибки загрузки JS модуля
        }
    }

    async loadModuleTemplate(moduleName) {
        try {
            const response = await fetch(`./modules/${moduleName}/template.html`);
            
            if (response.ok) {
                const html = await response.text();
                
                const moduleContainer = document.createElement('div');
                moduleContainer.className = `module module--${moduleName}`;
                moduleContainer.setAttribute('data-module', moduleName);
                moduleContainer.innerHTML = html;
                
                this.appContainer.appendChild(moduleContainer);
            }
        } catch (error) {
            // Игнорируем ошибки загрузки шаблонов
        }
    }

    async loadModuleStyles(moduleName) {
        return new Promise((resolve) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `./modules/${moduleName}/styles.css`;
            link.setAttribute('data-module', moduleName);
            
            link.onload = resolve;
            link.onerror = resolve;
            
            document.head.appendChild(link);
        });
    }

    setupNavigation() {
        this.on('tab:changed', (data) => {
            if (data && data.tab) {
                this.switchTab(data.tab);
            }
        });
    }

    switchTab(tabName) {
        if (this.currentTab === tabName) return;
        
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const targetTab = document.querySelector(`.tab-content[data-tab="${tabName}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        this.currentTab = tabName;
    }

    showTab(tabName) {
        this.currentTab = tabName;
        
        const targetTab = document.querySelector(`.tab-content[data-tab="${tabName}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }

    hideLoader() {
        const loader = document.querySelector('.app-loading');
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

    setupModuleInteractions() {
        // Настройки взаимодействия между модулями
    }

    getModule(name) {
        return this.modules[name];
    }

    emit(eventName, data) {
        try {
            window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
        } catch (error) {
            console.error('Error emitting event:', error);
        }
    }

    on(eventName, callback) {
        try {
            window.addEventListener(eventName, (e) => callback(e.detail));
        } catch (error) {
            console.error('Error adding event listener:', error);
        }
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