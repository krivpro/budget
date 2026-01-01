import { StorageService } from '../../core/storage.js';
import { NotificationService } from '../../core/notifications.js';
import { Utils } from '../../core/utils.js';
import { OPERATION_TYPES } from '../../constants/categories.js';
import OperationsForm from './form.js';
import OperationsList from './list.js';

export class OperationsModule {
    constructor() {
        this.storage = StorageService;
        this.operations = [];
        this.form = new OperationsForm();
        this.list = new OperationsList();
    }

    init() {
        console.log('Initializing Operations Module');
        
        // Загружаем данные
        this.operations = this.storage.getOperations();
        
        // Инициализируем подмодули
        this.form.init(this);
        this.list.init(this);
        
        return this;
    }

    // Добавить операцию
    addOperation(operationData) {
        const newOperation = {
            id: Utils.generateId(),
            type: operationData.type,
            amount: parseFloat(operationData.amount.toFixed(2)),
            description: operationData.description,
            date: operationData.date,
            createdAt: new Date().toISOString()
        };

        this.operations.push(newOperation);
        this.saveOperations();

        const operationTypeText = operationData.type === 'income' ? 'доход' : 'расход';
        NotificationService.show(`${operationTypeText} "${operationData.description}" успешно добавлен`);

        // Обновляем UI
        this.list.render();
        
        return newOperation;
    }

    // Удалить операцию
    deleteOperation(operationId) {
        const operationIndex = this.operations.findIndex(op => op.id === operationId);
        if (operationIndex === -1) return false;

        const operation = this.operations[operationIndex];
        
        if (NotificationService.confirm(`Удалить операцию "${operation.description}"?`)) {
            this.operations.splice(operationIndex, 1);
            this.saveOperations();
            this.list.render();
            return true;
        }
        
        return false;
    }

    // Фильтровать операции
    filterOperations(filterType) {
        return this.list.filterOperations(filterType);
    }

    // Сохранить операции
    saveOperations() {
        this.storage.saveOperations(this.operations);
    }

    // Получить операции
    getOperations() {
        return [...this.operations];
    }

    // Получить операции по типу
    getOperationsByType(type) {
        return this.operations.filter(op => op.type === type);
    }

    // Получить общую сумму по типу
    getTotalByType(type) {
        return this.operations
            .filter(op => op.type === type)
            .reduce((sum, op) => sum + op.amount, 0);
    }
}

export default OperationsModule;