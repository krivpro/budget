// Главный файл приложения
import HeaderModule from './modules/header/index.js';
import OperationsModule from './modules/operations/index.js';
import ExpectedIncomesModule from './modules/expected-incomes/index.js';
import PlansModule from './modules/plans/index.js';
import ChartModule from './modules/chart/index.js';
import CalendarModule from './modules/calendar/index.js';
import NavigationModule from './modules/navigation/index.js';
import CollapsibleModule from './modules/collapsible/index.js';
import { StorageService } from './core/storage.js';
import { NotificationService } from './core/notifications.js';
import { UIComponents } from './modules/ui/components.js';

class BudgetApp {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) {
            console.warn('App already initialized');
            return;
        }

        console.log('🚀 Budget App initializing...');

        try {
            // Проверяем поддержку localStorage
            if (!StorageService.isSupported()) {
                NotificationService.show('Ваш браузер не поддерживает сохранение данных', 'error');
                return;
            }

            // Инициализируем модули
            await this.initializeModules();

            // Настраиваем общие обработчики
            this.setupGlobalEventListeners();

            // Настраиваем очистку данных
            UIComponents.initClearData(() => this.handleClearData());

            this.isInitialized = true;
            console.log('✅ Budget App initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            NotificationService.show('Не удалось загрузить приложение', 'error');
        }
    }

    async initializeModules() {
        // Инициализируем модули в правильном порядке
        const navigation = new NavigationModule().init();
        const header = new HeaderModule().init();
        const calendar = new CalendarModule().init();
        const operations = new OperationsModule().init();
        const expected = new ExpectedIncomesModule().init();
        const plans = new PlansModule().init();
        const chart = new ChartModule().init();
        const collapsible = new CollapsibleModule().init();

        // Ждем завершения инициализации, если модули возвращают Promise
        this.modules = {
            navigation: await Promise.resolve(navigation),
            header: await Promise.resolve(header),
            calendar: await Promise.resolve(calendar),
            operations: await Promise.resolve(operations),
            expected: await Promise.resolve(expected),
            plans: await Promise.resolve(plans),
            chart: await Promise.resolve(chart),
            collapsible: await Promise.resolve(collapsible)
        };

        // Настраиваем межмодульное взаимодействие
        this.setupModuleInteractions();
    }

    setupModuleInteractions() {
        // Когда добавляется операция
        window.addEventListener('operation:added', (event) => {
            this.modules.header.update();
            this.modules.chart.update();
        });

        // Когда добавляется ожидаемый доход
        window.addEventListener('expected-income:added', (event) => {
            this.modules.header.update();
            this.modules.chart.update();
        });

        // Когда ожидаемый доход получен
        window.addEventListener('expected-income:received', (event) => {
            const income = event.detail;
            
            // Добавляем как фактический доход
            this.modules.operations.addOperation({
                type: 'income',
                amount: income.amount,
                description: income.description,
                date: income.receivedDate
            });
        });

        // Когда ожидаемый доход отменен
        window.addEventListener('expected-income:canceled', () => {
            this.modules.header.update();
            this.modules.chart.update();
        });

        // Когда обновляются операции
        window.addEventListener('operations:updated', () => {
            this.modules.header.update();
            this.modules.chart.update();
        });
    }

    setupGlobalEventListeners() {
        // Событие storage (синхронизация между вкладками)
        window.addEventListener('storage', (e) => {
            if (e.key === 'budgetOperations' || 
                e.key === 'budgetPlannedExpenses' || 
                e.key === 'budgetExpectedIncomes') {
                
                console.log('Storage updated, reloading data...');
                this.reloadData();
            }
        });

        // Сохраняем данные перед закрытием страницы
        window.addEventListener('beforeunload', () => {
            this.saveAllData();
        });

        // Обработчик для сброса формы при переключении вкладок
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('categories__item')) {
                const form = document.querySelector('.add');
                if (form && !form.contains(e.target)) {
                    // Можно добавить сброс формы если нужно
                }
            }
        });
    }

    reloadData() {
        // Перезагружаем данные во всех модулях
        if (this.modules.operations) {
            // Очищаем и перезагружаем операции из storage
            this.modules.operations.operations = this.modules.operations.storage.getOperations();
            // Сбрасываем фильтр на "все"
            if (this.modules.operations.list) {
                this.modules.operations.list.currentFilter = 'all';
            }
            this.modules.operations.list.render();
        }
        
        if (this.modules.expected) {
            // Очищаем и перезагружаем ожидаемые доходы из storage
            this.modules.expected.expectedIncomes = this.modules.expected.storage.getExpectedIncomes();
            // Сбрасываем фильтр на "все"
            if (this.modules.expected.list) {
                this.modules.expected.list.currentFilter = 'all';
                // Устанавливаем активную вкладку "Все"
                const allTab = document.querySelector('.expected .categories__item[data-status="all"]');
                if (allTab) {
                    document.querySelectorAll('.expected .categories__item').forEach(item => item.classList.remove('active'));
                    allTab.classList.add('active');
                }
            }
            this.modules.expected.list.render();
        }
        
        if (this.modules.plans) {
            // Очищаем и перезагружаем планы из storage
            this.modules.plans.plannedExpenses = this.modules.plans.storage.getPlannedExpenses();
            // Переключаемся на вкладку "Список"
            const listTab = document.querySelector('.plans .categories__item[data-action="show-list"]');
            if (listTab) {
                document.querySelectorAll('.plans .categories__item').forEach(item => item.classList.remove('active'));
                listTab.classList.add('active');
            }
            this.modules.plans.list.render();
        }
        
        if (this.modules.header) {
            this.modules.header.update();
        }
        
        if (this.modules.chart) {
            this.modules.chart.update();
        }
    }

    saveAllData() {
        // Данные сохраняются каждым модулем индивидуально
        // Этот метод для комплексного сохранения если нужно
        console.log('Saving all data...');
    }

    handleClearData() {
        const operations = StorageService.getOperations();
        const plannedExpenses = StorageService.getPlannedExpenses();
        const expectedIncomes = StorageService.getExpectedIncomes();

        if (operations.length === 0 && plannedExpenses.length === 0 && expectedIncomes.length === 0) {
            NotificationService.show('Нет данных для очистки', 'error');
            return true;
        }

        if (confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
            StorageService.clearAll();
            
            // Перезагружаем данные во всех модулях
            this.reloadData();
            
            // Очищаем формы
            if (this.modules.operations && this.modules.operations.form) {
                this.modules.operations.form.clearForm();
            }
            
            NotificationService.show('Все данные успешно удалены');
            return true;
        }
        
        return true; // Предотвращаем стандартную обработку
    }

    // Публичное API приложения
    getModule(name) {
        return this.modules[name];
    }

    getAllData() {
        return {
            operations: StorageService.getOperations(),
            plannedExpenses: StorageService.getPlannedExpenses(),
            expectedIncomes: StorageService.getExpectedIncomes()
        };
    }

    exportData() {
        const data = this.getAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.operations) StorageService.saveOperations(data.operations);
            if (data.plannedExpenses) StorageService.savePlannedExpenses(data.plannedExpenses);
            if (data.expectedIncomes) StorageService.saveExpectedIncomes(data.expectedIncomes);
            
            this.reloadData();
            NotificationService.show('Данные успешно импортированы');
            
        } catch (error) {
            NotificationService.show('Ошибка при импорте данных', 'error');
        }
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

// Экспортируем для использования в других модулях если нужно
export default app;