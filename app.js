// Главный файл приложения - инициализирует систему модулей
import { MODULES_CONFIG } from './constants/modules-config.js';

class BudgetApp {
    constructor() {
        this.modules = {};
        this.config = MODULES_CONFIG;
        this.appContainer = document.getElementById('app');
        this.currentTab = 'main';
    }

    async init() {
        console.log('🚀 Budget App initializing...');
        
        try {
            // Загружаем модули в правильном порядке
            await this.loadModulesInOrder();
            
            // Настраиваем взаимодействие между модулями
            this.setupModuleInteractions();
            
            // Настраиваем навигацию
            this.setupNavigation();
            
            // Показываем активную вкладку
            this.showTab(this.currentTab);
            
            // Скрываем лоадер
            this.hideLoader();
            
            console.log('✅ Budget App initialized successfully');
            
            // Дебаг: выводим список загруженных модулей
            console.log('📦 Loaded modules:', Object.keys(this.modules));
            
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.showError('Не удалось загрузить приложение');
        }
    }

    async loadModulesInOrder() {
        // Определяем порядок загрузки модулей (важные модули сначала)
        const loadOrder = [
            'navigation',    // Навигация нужна первой
            'header',        // Затем шапка
            'ui',           // UI компоненты
            'calendar',     // Календарь для форм
            'operations',   // Основные операции
            'expected-incomes', // Ожидаемые доходы
            'plans',        // Планы
            'chart',        // Графики
            'settings',     // Настройки
        ];
        
        // Загружаем модули по порядку
        for (const moduleName of loadOrder) {
            if (this.config[moduleName]) {
                await this.loadModule(moduleName);
            }
        }
    }

    async loadModule(moduleName) {
        try {
            console.log(`📦 Loading module: ${moduleName}`);
            
            // 1. Загружаем HTML шаблон
            await this.loadModuleTemplate(moduleName);
            
            // 2. Загружаем CSS стили
            await this.loadModuleStyles(moduleName);
            
            // 3. Загружаем и инициализируем JavaScript
            // ПРАВИЛЬНЫЙ ПУТЬ: относительный от корня проекта
            const modulePath = `./modules/${moduleName}/index.js?v=${Date.now()}`;
            
            try {
                const module = await import(modulePath);
                
                if (module.default && typeof module.default === 'function') {
                    // Создаем экземпляр класса и инициализируем
                    const ModuleClass = module.default;
                    const instance = new ModuleClass(this);
                    
                    // Вызываем init если он есть
                    if (typeof instance.init === 'function') {
                        await instance.init();
                    }
                    
                    this.modules[moduleName] = instance;
                    console.log(`✅ Module "${moduleName}" JS loaded and initialized`);
                } else {
                    console.log(`✅ Module "${moduleName}" template and styles loaded (no JS class)`);
                }
            } catch (jsError) {
                console.warn(`⚠️ JavaScript error in module "${moduleName}":`, jsError.message);
                console.log(`✅ Module "${moduleName}" template and styles loaded (JS skipped)`);
            }
            
        } catch (error) {
            console.error(`❌ Failed to load module "${moduleName}":`, error.message);
            // Продолжаем загрузку других модулей
        }
    }

    async loadModuleTemplate(moduleName) {
        try {
            const response = await fetch(`./modules/${moduleName}/template.html`);
            
            if (!response.ok) {
                throw new Error(`Template not found for module: ${moduleName}`);
            }
            
            const html = await response.text();
            
            // Создаем контейнер для модуля
            const moduleContainer = document.createElement('div');
            moduleContainer.className = `module module--${moduleName}`;
            moduleContainer.setAttribute('data-module', moduleName);
            moduleContainer.innerHTML = html;
            
            // Добавляем в основное приложение
            this.appContainer.appendChild(moduleContainer);
            
            console.log(`📄 Template loaded for module: ${moduleName}`);
            
        } catch (error) {
            console.warn(`⚠️ No template found for module "${moduleName}", skipping...`);
        }
    }

    async loadModuleStyles(moduleName) {
        try {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `./modules/${moduleName}/styles.css`;
            link.setAttribute('data-module', moduleName);
            
            // Ждем загрузки стилей
            await new Promise((resolve, reject) => {
                link.onload = resolve;
                link.onerror = () => {
                    console.warn(`⚠️ No styles found for module "${moduleName}"`);
                    resolve(); // Не прерываем загрузку если стилей нет
                };
                document.head.appendChild(link);
            });
            
            console.log(`🎨 Styles loaded for module: ${moduleName}`);
            
        } catch (error) {
            console.warn(`⚠️ Error loading styles for module "${moduleName}":`, error);
        }
    }

    setupNavigation() {
        // Слушаем события переключения вкладок
        this.on('tab:changed', (data) => {
            if (data && data.tab) {
                this.switchTab(data.tab);
            }
        });
    }

    switchTab(tabName) {
        if (this.currentTab === tabName) return;
        
        // Скрываем все вкладки
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Показываем выбранную вкладку
        const targetTab = document.querySelector(`.tab-content[data-tab="${tabName}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        this.currentTab = tabName;
        console.log(`📱 Switched to tab: ${tabName}`);
    }

    showTab(tabName) {
        this.currentTab = tabName;
        
        // Показываем соответствующую вкладку
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
        // Здесь будут настройки взаимодействия между модулями
        console.log('🔗 Setting up module interactions...');
    }

    // API для модулей
    getModule(name) {
        return this.modules[name];
    }

    emit(eventName, data) {
        window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }

    on(eventName, callback) {
        window.addEventListener(eventName, (e) => callback(e.detail));
    }
}

// Создаем и инициализируем приложение
const app = new BudgetApp();

// Инициализируем приложение при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    app.init().catch(console.error);
    
    // Экспортируем приложение в глобальную область для отладки
    window.budgetApp = app;
});

export default app;