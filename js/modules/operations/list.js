import { BudgetCalculator } from '../../core/calculator.js';
import { Utils } from '../../core/utils.js';

export class OperationsList {
    constructor() {
        this.currentFilter = 'all';
    }

    init(operationsModule) {
        this.module = operationsModule;
        this.render();
        this.setupFilterListeners();
        return this;
    }

    render() {
        const operationsContainer = document.querySelector('.history');
        if (!operationsContainer) return;

        // Фильтруем операции
        let filteredOperations = this.module.getOperations();
        if (this.currentFilter !== 'all') {
            filteredOperations = filteredOperations.filter(op => op.type === this.currentFilter);
        }

        // Сортируем по дате (новые сверху), а при одинаковой дате - по времени создания
        filteredOperations.sort((a, b) => {
            const dateA = Utils.parseDate(a.date);
            const dateB = Utils.parseDate(b.date);
            const dateDiff = dateB - dateA;
            
            // Если даты разные, сортируем по дате
            if (dateDiff !== 0) {
                return dateDiff;
            }
            
            // Если даты одинаковые, сортируем по времени создания (новые сверху)
            const createdAtA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const createdAtB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return createdAtB - createdAtA;
        });

        // Создаем HTML
        let operationsHTML = `
            <div class="control-panel">
                <h2 class="control-panel__title">Список операций</h2>
                <div class="control-panel__categories categories">
                    <div class="categories__item ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">Все</div>
                    <div class="categories__item ${this.currentFilter === 'income' ? 'active' : ''}" data-filter="income">Доходы</div>
                    <div class="categories__item ${this.currentFilter === 'expense' ? 'active' : ''}" data-filter="expense">Расходы</div>
                </div>
            </div>
        `;

        if (filteredOperations.length === 0) {
            operationsHTML += this.renderEmptyState();
        } else {
            operationsHTML += filteredOperations.map(operation => this.renderOperationItem(operation)).join('');
        }

        operationsContainer.innerHTML = operationsHTML;
        this.setupFilterListeners();
    }

    renderOperationItem(operation) {
        const formattedDate = Utils.formatDate(operation.date);
        const amountClass = operation.type === 'income' ? 'operation__amount--income' : 'operation__amount--expense';
        const amountSign = operation.type === 'income' ? '+' : '-';
        
        return `
            <div class="operation" data-id="${operation.id}">
                <div class="operation__info">
                    <p class="operation__description">${operation.description}</p>
                    <p class="operation__date">${formattedDate}</p>
                </div>
                <p class="operation__amount ${amountClass}">${amountSign}${BudgetCalculator.formatCurrency(operation.amount)} Р</p>
            </div>
        `;
    }

    renderEmptyState() {
        const allOperations = this.module.getOperations();
        let message = 'Операций пока нет';
        let hint = 'Добавьте первую операцию в форме выше';

        if (allOperations.length > 0) {
            if (this.currentFilter === 'all') {
                message = 'Нет операций';
            } else if (this.currentFilter === 'income') {
                message = 'Нет доходов';
                hint = 'Переключитесь на "Все" или "Расходы"';
            } else if (this.currentFilter === 'expense') {
                message = 'Нет расходов';
                hint = 'Переключитесь на "Все" или "Доходы"';
            }
        }

        return `
            <div class="list__no-data list__no-data--history">
                <div class="list__no-data__description">${message}</div>
                <div class="list__no-data__hint">${hint}</div>
            </div>
        `;
    }

    setupFilterListeners() {
        const filterItems = document.querySelectorAll('.history .categories__item');
        filterItems.forEach(item => {
            item.addEventListener('click', () => {
                const filter = item.dataset.filter;
                this.filterOperations(filter);
            });
        });
    }

    filterOperations(filterType) {
        this.currentFilter = filterType;
        this.render();
        
        // Событие для других модулей
        window.dispatchEvent(new CustomEvent('operations:filtered', { 
            detail: { filter: filterType }
        }));
    }

    update() {
        this.render();
    }
}

export default OperationsList;