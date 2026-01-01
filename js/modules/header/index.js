import { BudgetCalculator } from '../../core/calculator.js';
import { StorageService } from '../../core/storage.js';

export class HeaderModule {
    constructor() {
        this.elements = {
            income: document.querySelector('.income__sum'),
            expenses: document.querySelector('.expenses__sum'),
            balance: document.querySelector('.balance__sum'),
            expected: document.querySelector('.expected__sum'),
            planned: document.querySelector('.planned__sum'),
            balanceContainer: document.querySelector('.header__balance')
        };
    }

    init() {
        this.render();
        this.setupTooltip();
        this.setupTabListener();
        return this;
    }

    setupTabListener() {
        // Слушаем события переключения вкладок
        window.addEventListener('tab:changed', (e) => {
            this.updateHeaderForTab(e.detail.tab);
        });
        
        // Инициализируем для текущей вкладки
        const currentTab = window.location.hash.replace('#', '') || 'main';
        this.updateHeaderForTab(currentTab);
    }

    updateHeaderForTab(tabName) {
        const header = document.querySelector('.header');
        if (!header) return;

        // Убираем все классы состояний
        header.classList.remove('header--main', 'header--expected', 'header--plans', 'header--settings');

        // Добавляем класс для текущей вкладки
        switch(tabName) {
            case 'main':
                header.classList.add('header--main');
                break;
            case 'expected':
                header.classList.add('header--expected');
                break;
            case 'plans':
                header.classList.add('header--plans');
                break;
            case 'settings':
                header.classList.add('header--settings');
                break;
        }
    }

    render() {
        const totals = BudgetCalculator.calculateTotals();
        
        // Обновляем значения
        if (this.elements.income) {
            this.elements.income.textContent = `${BudgetCalculator.formatCurrency(totals.incomeTotal)} Р`;
        }
        
        if (this.elements.expenses) {
            this.elements.expenses.textContent = `${BudgetCalculator.formatCurrency(totals.expensesTotal)} Р`;
        }
        
        if (this.elements.expected) {
            this.elements.expected.textContent = `${BudgetCalculator.formatCurrency(totals.expectedTotal)} Р`;
        }
        
        if (this.elements.planned) {
            this.elements.planned.textContent = `${BudgetCalculator.formatCurrency(totals.plannedTotal)} Р`;
        }
        
        if (this.elements.balance) {
            const balanceText = totals.balance > 0 
                ? `+${BudgetCalculator.formatCurrency(totals.balance)} Р`
                : `${BudgetCalculator.formatCurrency(totals.balance)} Р`;
            
            this.elements.balance.textContent = balanceText;
            
            // Обновляем классы
            if (this.elements.balanceContainer) {
                this.elements.balanceContainer.classList.remove('positive', 'negative', 'neutral');
                this.elements.balanceContainer.classList.add(BudgetCalculator.getBalanceClass(totals.balance));
            }
        }
    }

    setupTooltip() {
        const expectedHeader = document.querySelector('.header__expected');
        if (expectedHeader) {
            let expectedTooltip = expectedHeader.querySelector('.expected-tooltip');
            if (!expectedTooltip) {
                expectedTooltip = document.createElement('div');
                expectedTooltip.className = 'expected-tooltip';
                expectedTooltip.innerHTML = `
                    <div>Ожидаемые доходы</div>
                    <div style="font-size: 11px; margin-top: 2px;">(еще не получены)</div>
                `;
                expectedHeader.appendChild(expectedTooltip);
            }
        }
        
        const plannedHeader = document.querySelector('.header__planned');
        if (plannedHeader) {
            let plannedTooltip = plannedHeader.querySelector('.planned-tooltip');
            if (!plannedTooltip) {
                plannedTooltip = document.createElement('div');
                plannedTooltip.className = 'planned-tooltip';
                plannedTooltip.innerHTML = `
                    <div>Плановые расходы</div>
                    <div style="font-size: 11px; margin-top: 2px;">(еще не выполнены)</div>
                `;
                plannedHeader.appendChild(plannedTooltip);
            }
        }
    }

    // Обновить шапку (вызывается извне)
    update() {
        this.render();
    }
}

export default HeaderModule;