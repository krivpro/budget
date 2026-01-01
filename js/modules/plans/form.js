import { Utils } from '../../core/utils.js';
import { NotificationService } from '../../core/notifications.js';

export class PlansForm {
    constructor() {
        this.elements = {};
    }

    init(plansModule) {
        this.module = plansModule;
        this.cacheElements();
        this.setupEventListeners();
        return this;
    }

    cacheElements() {
        this.elements = {
            amountInput: document.getElementById('planAmountInput'),
            descriptionInput: document.getElementById('planDescriptionInput'),
            dateInput: document.getElementById('planDateInput'),
            realDateInput: document.getElementById('realPlanDateInput'),
            addButton: document.getElementById('planAddBtn')
        };
    }

    setupEventListeners() {
        // Обработчик кнопки добавления
        if (this.elements.addButton) {
            this.elements.addButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAddPlan();
            });
        }

        // Обработчик клавиши Enter
        [this.elements.amountInput, this.elements.descriptionInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.handleAddPlan();
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

        // Обработчик клика по полю даты
        if (this.elements.dateInput) {
            this.elements.dateInput.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('calendar:open', {
                    detail: {
                        targetInput: 'planDateInput',
                        targetRealInput: 'realPlanDateInput'
                    }
                }));
            });
        }
    }

    handleAddPlan() {
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

        // Добавляем план
        this.module.addPlan({ amount, description, date });

        // Очищаем форму
        this.clearForm();
    }

    clearForm() {
        if (this.elements.amountInput) this.elements.amountInput.value = '';
        if (this.elements.descriptionInput) this.elements.descriptionInput.value = '';
        if (this.elements.dateInput) this.elements.dateInput.value = '';
        if (this.elements.realDateInput) this.elements.realDateInput.value = '';
    }
}

export default PlansForm;