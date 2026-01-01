import { StorageService } from '../../core/storage.js';
import { NotificationService } from '../../core/notifications.js';
import { Utils } from '../../core/utils.js';
import { INCOME_CATEGORIES, EXPECTED_STATUSES } from '../../constants/categories.js';
import ExpectedForm from './form.js';
import ExpectedList from './list.js';

export class ExpectedIncomesModule {
    constructor() {
        this.storage = StorageService;
        this.expectedIncomes = [];
        this.form = new ExpectedForm();
        this.list = new ExpectedList();
    }

    init() {
        console.log('Initializing Expected Incomes Module');
        
        // Загружаем данные
        this.expectedIncomes = this.storage.getExpectedIncomes();
        
        // Инициализируем подмодули
        this.form.init(this);
        this.list.init(this);
        
        // Слушаем события
        this.setupEventListeners();
        
        return this;
    }

    setupEventListeners() {
        // События обрабатываются формой напрямую
    }

    // Добавить ожидаемый доход
    addExpectedIncome(incomeData) {
        this.expectedIncomes.push(incomeData);
        this.saveExpectedIncomes();

        NotificationService.show(`Ожидаемый доход "${incomeData.description}" успешно добавлен`);
        this.list.render();
        
        // Событие для других модулей
        window.dispatchEvent(new CustomEvent('expected-income:added', { detail: incomeData }));
        
        return incomeData;
    }

    // Отметить как полученный
    markAsReceived(incomeId) {
        const incomeIndex = this.expectedIncomes.findIndex(income => income.id === incomeId);
        if (incomeIndex === -1) return false;

        const income = this.expectedIncomes[incomeIndex];
        
        // Обновляем статус
        income.status = EXPECTED_STATUSES.RECEIVED;
        income.receivedDate = new Date().toISOString().split('T')[0];
        
        this.saveExpectedIncomes();
        this.list.render();
        
        // Событие для добавления в фактические доходы
        window.dispatchEvent(new CustomEvent('expected-income:received', { detail: income }));
        
        NotificationService.show(`Доход "${income.description}" получен и добавлен в фактические доходы`);
        return true;
    }

    // Отменить ожидаемый доход
    cancelExpectedIncome(incomeId) {
        const incomeIndex = this.expectedIncomes.findIndex(income => income.id === incomeId);
        if (incomeIndex === -1) return false;

        const income = this.expectedIncomes[incomeIndex];
        
        if (NotificationService.confirm(`Отменить ожидаемый доход "${income.description}"?`)) {
            income.status = EXPECTED_STATUSES.CANCELED;
            this.saveExpectedIncomes();
            this.list.render();
            
            NotificationService.show(`Ожидаемый доход "${income.description}" отменен`);
            return true;
        }
        
        return false;
    }

    // Удалить ожидаемый доход
    deleteExpectedIncome(incomeId) {
        const incomeIndex = this.expectedIncomes.findIndex(income => income.id === incomeId);
        if (incomeIndex === -1) return false;

        const income = this.expectedIncomes[incomeIndex];
        
        const statusText = income.status === 'pending' ? 'ожидаемый' : income.status;
        
        if (NotificationService.confirm(`Удалить ${statusText} доход "${income.description}"?`)) {
            this.expectedIncomes.splice(incomeIndex, 1);
            this.saveExpectedIncomes();
            this.list.render();
            
            NotificationService.show(`Доход "${income.description}" удален`);
            return true;
        }
        
        return false;
    }

    // Сохранить ожидаемые доходы
    saveExpectedIncomes() {
        this.storage.saveExpectedIncomes(this.expectedIncomes);
    }

    // Получить ожидаемые доходы
    getExpectedIncomes() {
        return [...this.expectedIncomes];
    }

    // Получить ожидаемые доходы по статусу
    getExpectedIncomesByStatus(status) {
        return this.expectedIncomes.filter(income => income.status === status);
    }

    // Получить общую сумму ожидаемых доходов
    getTotalExpected() {
        return this.expectedIncomes
            .filter(income => income.status === EXPECTED_STATUSES.PENDING)
            .reduce((sum, inc) => sum + inc.amount, 0);
    }
}

export default ExpectedIncomesModule;