import { Utils } from '../../core/utils.js';
import { NotificationService } from '../../core/notifications.js';
import { EXPECTED_STATUSES } from '../../constants/categories.js';

export class ExpectedForm {
    constructor() {
        this.elements = {};
    }

    init(expectedModule) {
        this.module = expectedModule;
        this.cacheElements();
        this.setupEventListeners();
        return this;
    }

    cacheElements() {
        this.elements = {
            amountInput: document.getElementById('expectedAmountInput'),
            descriptionInput: document.getElementById('expectedDescriptionInput'),
            dateInput: document.getElementById('expectedDateInput'),
            realDateInput: document.getElementById('realExpectedDateInput'),
            probabilityInput: document.getElementById('probabilityInput'),
            probabilityValue: document.getElementById('probabilityValue'),
            clientInput: document.getElementById('clientInput'),
            incomeCategory: document.getElementById('incomeCategory'),
            addButton: document.getElementById('expectedAddBtn')
        };
    }

    setupEventListeners() {
        // Обработчик кнопки добавления
        if (this.elements.addButton) {
            this.elements.addButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAddExpectedIncome();
            });
        }

        // Обработчик клавиши Enter
        [this.elements.amountInput, this.elements.descriptionInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.handleAddExpectedIncome();
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

        // Обработчик слайдера вероятности
        if (this.elements.probabilityInput && this.elements.probabilityValue) {
            this.elements.probabilityInput.addEventListener('input', (e) => {
                this.elements.probabilityValue.textContent = `${e.target.value}%`;
            });
        }

        // Обработчик клика по полю даты
        if (this.elements.dateInput) {
            this.elements.dateInput.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('calendar:open', {
                    detail: {
                        targetInput: 'expectedDateInput',
                        targetRealInput: 'realExpectedDateInput'
                    }
                }));
            });
        }
    }

    handleAddExpectedIncome() {
        const amount = parseFloat(this.elements.amountInput.value.replace(',', '.'));
        const description = this.elements.descriptionInput.value.trim();
        const date = this.elements.realDateInput.value;
        const probability = this.elements.probabilityInput ? parseInt(this.elements.probabilityInput.value) : 100;
        const client = this.elements.clientInput ? this.elements.clientInput.value.trim() : '';
        const category = this.elements.incomeCategory ? this.elements.incomeCategory.value : 'other';

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

        if (client && client.length > 50) {
            NotificationService.show('Имя клиента слишком длинное', 'error');
            if (this.elements.clientInput) {
                this.elements.clientInput.focus();
            }
            return;
        }

        const newExpectedIncome = {
            id: Utils.generateId(),
            type: 'expected',
            amount: parseFloat(amount.toFixed(2)),
            description: description,
            date: date,
            status: EXPECTED_STATUSES.PENDING,
            probability: probability,
            client: client,
            category: category,
            createdAt: new Date().toISOString(),
            receivedDate: null
        };

        this.module.addExpectedIncome(newExpectedIncome);
        this.clearForm();
    }

    clearForm() {
        if (this.elements.amountInput) this.elements.amountInput.value = '';
        if (this.elements.descriptionInput) this.elements.descriptionInput.value = '';
        if (this.elements.dateInput) this.elements.dateInput.value = '';
        if (this.elements.realDateInput) this.elements.realDateInput.value = '';
        if (this.elements.probabilityInput) this.elements.probabilityInput.value = 100;
        if (this.elements.probabilityValue) this.elements.probabilityValue.textContent = '100%';
        if (this.elements.clientInput) this.elements.clientInput.value = '';
        if (this.elements.incomeCategory) this.elements.incomeCategory.value = 'freelance';
    }

    getFormData() {
        return {
            probability: this.elements.probabilityInput ? parseInt(this.elements.probabilityInput.value) : 100,
            client: this.elements.clientInput ? this.elements.clientInput.value.trim() : '',
            category: this.elements.incomeCategory ? this.elements.incomeCategory.value : 'other'
        };
    }
}

export default ExpectedForm;