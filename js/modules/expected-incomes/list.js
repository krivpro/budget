import { BudgetCalculator } from '../../core/calculator.js';
import { Utils } from '../../core/utils.js';
import { INCOME_CATEGORIES } from '../../constants/categories.js';

export class ExpectedList {
    constructor() {
        this.currentFilter = 'all';
    }

    init(expectedModule) {
        this.module = expectedModule;
        this.render();
        this.setupFilterListeners();
        return this;
    }

    render() {
        const expectedContainer = document.querySelector('.expected-content');
        if (!expectedContainer) return;

        // Определяем активную вкладку
        const activeTab = document.querySelector('.expected .categories__item.active');
        const statusFilter = activeTab ? activeTab.dataset.status : 'all';

        this.currentFilter = statusFilter;

        // Фильтруем ожидаемые доходы по статусу
        let filteredIncomes = this.module.getExpectedIncomes();
        if (statusFilter !== 'all') {
            filteredIncomes = filteredIncomes.filter(income => income.status === statusFilter);
        }

        // Сортируем по дате (ближайшие сверху)
        filteredIncomes.sort((a, b) => Utils.parseDate(a.date) - Utils.parseDate(b.date));

        // Создаем HTML
        if (filteredIncomes.length === 0) {
            expectedContainer.innerHTML = this.renderEmptyState();
        } else {
            expectedContainer.innerHTML = filteredIncomes.map(income => this.renderIncomeItem(income)).join('');
        }

        this.setupActionListeners();
    }

    renderIncomeItem(income) {
        const formattedDate = Utils.formatDate(income.date);
        const probabilityClass = Utils.getProbabilityClass(income.probability);
        const categoryInfo = INCOME_CATEGORIES[income.category] || INCOME_CATEGORIES.other;
        
        return `
            <div class="expected-item ${income.status}" data-id="${income.id}">
                <div class="expected-info">
                    <p class="expected-description">${income.description}</p>
                    <div class="expected-details">
                        <span class="expected-date">${formattedDate}</span>
                        ${income.client ? `<span class="expected-client">${income.client}</span>` : ''}
                        <span class="expected-category">${categoryInfo.name}</span>
                        <span class="expected-probability">
                            <div class="probability-indicator ${probabilityClass}"></div>
                            ${income.probability}%
                        </span>
                    </div>
                </div>
                <p class="expected-amount">${BudgetCalculator.formatCurrency(income.amount)} Р</p>
                <div class="expected-actions">
                    ${income.status === 'pending' ? `
                        <button class="expected-btn receive" title="Отметить как полученный">
                            <svg class="expected-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </button>
                        <button class="expected-btn cancel" title="Отменить ожидаемый доход">
                            <svg class="expected-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    ` : ''}
                    <button class="expected-btn delete" title="Удалить">
                        <svg class="expected-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        let message = 'Ожидаемых доходов пока нет';
        let hint = 'Добавьте ожидаемый доход в форме выше';

        if (this.currentFilter === 'pending') {
            message = 'Нет ожидаемых доходов';
            hint = 'Все доходы получены или отменены';
        } else if (this.currentFilter === 'received') {
            message = 'Нет полученных ожидаемых доходов';
            hint = 'Пока нет доходов, отмеченных как полученные';
        } else if (this.currentFilter === 'canceled') {
            message = 'Нет отмененных ожидаемых доходов';
            hint = 'Пока нет отмененных ожидаемых доходов';
        }

        return `
            <div class="list__no-data list__no-data--expected">
                <div class="list__no-data__description">${message}</div>
                <div class="list__no-data__hint">${hint}</div>
            </div>
        `;
    }

    setupFilterListeners() {
        const filterTabs = document.querySelectorAll('.expected .categories__item');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Убираем активный класс у всех
                filterTabs.forEach(item => item.classList.remove('active'));
                // Добавляем активный класс текущему
                tab.classList.add('active');
                // Перерисовываем
                this.render();
            });
        });
    }

    setupActionListeners() {
        // Кнопка "Получен"
        document.querySelectorAll('.expected-btn.receive').forEach(button => {
            button.addEventListener('click', (e) => {
                const expectedItem = e.target.closest('.expected-item');
                const incomeId = expectedItem.dataset.id;
                this.module.markAsReceived(incomeId);
            });
        });

        // Кнопка "Отменить"
        document.querySelectorAll('.expected-btn.cancel').forEach(button => {
            button.addEventListener('click', (e) => {
                const expectedItem = e.target.closest('.expected-item');
                const incomeId = expectedItem.dataset.id;
                this.module.cancelExpectedIncome(incomeId);
            });
        });

        // Кнопка "Удалить"
        document.querySelectorAll('.expected-btn.delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const expectedItem = e.target.closest('.expected-item');
                const incomeId = expectedItem.dataset.id;
                this.module.deleteExpectedIncome(incomeId);
            });
        });
    }

    update() {
        this.render();
    }
}

export default ExpectedList;