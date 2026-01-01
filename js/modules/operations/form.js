import { Utils } from '../../core/utils.js';
import { OPERATION_TYPES } from '../../constants/categories.js';
import { NotificationService } from '../../core/notifications.js';

export class OperationsForm {
    constructor() {
        this.elements = {};
    }

    init(operationsModule) {
        this.module = operationsModule;
        this.cacheElements();
        this.setupEventListeners();
        this.setupCategorySwitching();
    }

    cacheElements() {
        this.elements = {
            amountInput: document.getElementById('amountInput'),
            descriptionInput: document.getElementById('descriptionInput'),
            dateInput: document.getElementById('dateInput'),
            realDateInput: document.getElementById('realDateInput'),
            addButton: document.getElementById('addBtn'),
            categoryItems: document.querySelectorAll('.add .categories__item'),
            expectedFields: document.getElementById('expectedFields')
        };
    }

    setupEventListeners() {
        // Обработчик кнопки добавления
        if (this.elements.addButton) {
            this.elements.addButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAddOperation();
            });
        }

        // Обработчик клавиши Enter
        [this.elements.amountInput, this.elements.descriptionInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.handleAddOperation();
                    }
                });
            }
        });

        // Валидация суммы
        if (this.elements.amountInput) {
            this.elements.amountInput.addEventListener('input', (e) => {
                e.target.value = Utils.cleanAmount(e.target.value);
            });
        }
    }

    setupCategorySwitching() {
        if (this.elements.categoryItems) {
            this.elements.categoryItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Убираем активный класс у всех
                    this.elements.categoryItems.forEach(i => i.classList.remove('active'));
                    
                    // Добавляем активный класс текущему
                    item.classList.add('active');
                });
            });
        }
    }

    handleAddOperation() {
        const activeCategory = document.querySelector('.add .categories__item.active');
        if (!activeCategory) return;

        const operationType = activeCategory.dataset.type;

        // Получаем значения из формы
        const amount = parseFloat(this.elements.amountInput.value.replace(',', '.'));
        const description = this.elements.descriptionInput.value.trim();
        const date = this.elements.realDateInput.value;

        // Валидация
        if (!Utils.validateAmount(amount)) {
            NotificationService.show('Пожалуйста, введите корректную сумму', 'error');
            this.elements.amountInput.focus();
            return;
        }

        if (!description) {
            NotificationService.show('Пожалуйста, введите описание', 'error');
            this.elements.descriptionInput.focus();
            return;
        }

        if (!date) {
            NotificationService.show('Пожалуйста, выберите дату', 'error');
            this.elements.dateInput.focus();
            return;
        }

        // Добавляем операцию (только доходы и расходы)
        const operation = this.module.addOperation({
            type: operationType,
            amount,
            description,
            date
        });

        // Очищаем форму
        this.clearForm();
        
        // Событие для других модулей
        window.dispatchEvent(new CustomEvent('operation:added', { detail: operation }));
    }

    clearForm() {
        if (this.elements.amountInput) this.elements.amountInput.value = '';
        if (this.elements.descriptionInput) this.elements.descriptionInput.value = '';
        if (this.elements.dateInput) this.elements.dateInput.value = '';
        if (this.elements.realDateInput) this.elements.realDateInput.value = '';
        
        // Очищаем дополнительные поля для ожидаемых доходов
        const probabilityInput = document.getElementById('probabilityInput');
        const probabilityValue = document.getElementById('probabilityValue');
        const clientInput = document.getElementById('clientInput');
        const incomeCategory = document.getElementById('incomeCategory');

        if (probabilityInput) probabilityInput.value = 100;
        if (probabilityValue) probabilityValue.textContent = '100%';
        if (clientInput) clientInput.value = '';
        if (incomeCategory) incomeCategory.value = 'freelance';
    }

    getCurrentOperationType() {
        const activeCategory = document.querySelector('.add .categories__item.active');
        return activeCategory ? activeCategory.dataset.type : null;
    }
}

export default OperationsForm;