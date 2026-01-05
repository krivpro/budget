// Модуль шапки приложения

class HeaderModule {
    constructor(app) {
        this.app = app;
        this.elements = null;
    }

    async init() {
        this.cacheElements();
        this.update();
        this.setupEventListeners();
        return this;
    }

    cacheElements() {
        this.elements = {
            income: document.querySelector('.income__sum'),
            expenses: document.querySelector('.expenses__sum'),
            balance: document.querySelector('.balance__sum'),
            expected: document.querySelector('.expected__sum'),
            planned: document.querySelector('.planned__sum'),
            balanceContainer: document.querySelector('.header__balance')
        };
    }

    setupEventListeners() {
        if (this.app && this.app.on) {
            this.app.on('tab:changed', (data) => {
                this.updateHeaderForTab(data.tab);
            });
        }
    }

    updateHeaderForTab(tabName) {
        const header = document.querySelector('.header');
        if (!header) return;

        header.classList.remove('header--main', 'header--expected', 'header--plans', 'header--settings');

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

    calculateTotals() {
        try {
            const operations = JSON.parse(localStorage.getItem('budgetOperations') || '[]');
            const expectedIncomes = JSON.parse(localStorage.getItem('budgetExpectedIncomes') || '[]');
            const plannedExpenses = JSON.parse(localStorage.getItem('budgetPlannedExpenses') || '[]');
            
            let incomeTotal = 0;
            let expensesTotal = 0;
            let expectedTotal = 0;
            let plannedTotal = 0;

            operations.forEach(operation => {
                if (operation.type === 'income') {
                    incomeTotal += operation.amount || 0;
                } else if (operation.type === 'expense') {
                    expensesTotal += operation.amount || 0;
                }
            });

            expectedIncomes.forEach(income => {
                if (income.status === 'pending') {
                    expectedTotal += income.amount || 0;
                }
            });

            plannedExpenses.forEach(plan => {
                if (!plan.completed) {
                    plannedTotal += plan.amount || 0;
                }
            });

            const balance = incomeTotal - expensesTotal;

            return {
                incomeTotal,
                expensesTotal,
                expectedTotal,
                plannedTotal,
                balance
            };
            
        } catch (error) {
            return {
                incomeTotal: 0,
                expensesTotal: 0,
                expectedTotal: 0,
                plannedTotal: 0,
                balance: 0
            };
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    getBalanceClass(balance) {
        if (balance > 0) return 'positive';
        if (balance < 0) return 'negative';
        return 'neutral';
    }

    update() {
        if (!this.elements) {
            this.cacheElements();
        }
        
        const totals = this.calculateTotals();
        
        if (this.elements.income) {
            this.elements.income.textContent = `${this.formatCurrency(totals.incomeTotal)} Р`;
        }
        
        if (this.elements.expenses) {
            this.elements.expenses.textContent = `${this.formatCurrency(totals.expensesTotal)} Р`;
        }
        
        if (this.elements.expected) {
            this.elements.expected.textContent = `${this.formatCurrency(totals.expectedTotal)} Р`;
        }
        
        if (this.elements.planned) {
            this.elements.planned.textContent = `${this.formatCurrency(totals.plannedTotal)} Р`;
        }
        
        if (this.elements.balance) {
            const balanceText = totals.balance > 0 
                ? `+${this.formatCurrency(totals.balance)} Р`
                : `${this.formatCurrency(totals.balance)} Р`;
            
            this.elements.balance.textContent = balanceText;
            
            if (this.elements.balanceContainer) {
                this.elements.balanceContainer.classList.remove('positive', 'negative', 'neutral');
                this.elements.balanceContainer.classList.add(this.getBalanceClass(totals.balance));
            }
        }
    }
}

export default HeaderModule;