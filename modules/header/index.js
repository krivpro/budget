// modules/header/index.js
class HeaderModule {
    constructor(app) {
        this.app = app;
        this.elements = null;
        this.totals = {
            incomeTotal: 0,
            expenseTotal: 0,
            expectedTotal: 0,
            plannedTotal: 0,
            balance: 0
        };
    }

    async init() {
        console.log('Header Module initialized');
        this.createHeader();
        this.setupEventListeners();
        this.updateHeaderForTab(this.app.getCurrentTab());
        this.loadTotals();
        this.update();
        return this;
    }

    createHeader() {
        const appContent = this.app.getContainer();
        
        const headerHTML = `
            <header class="header container">
                <div class="header__logo">budget</div>
                
                <div class="header__item header__income income">
                    <div class="header__title">Доходы</div>
                    <div class="income__sum header__sum sum">0,00 Р</div>
                </div>
                
                <div class="header__item header__expenses expenses">
                    <div class="header__title">Расходы</div>
                    <div class="expenses__sum header__sum sum">0,00 Р</div>
                </div>
                
                <div class="header__item header__balance balance">
                    <div class="header__title">Остаток</div>
                    <div class="balance__sum header__sum sum">0,00 Р</div>
                </div>
                
                <div class="header__item header__expected expected">
                    <div class="header__title">Ожидаемые доходы</div>
                    <div class="expected__sum header__sum sum">0,00 Р</div>
                </div>
                
                <div class="header__item header__planned planned">
                    <div class="header__title">Плановые расходы</div>
                    <div class="planned__sum header__sum sum">0,00 Р</div>
                </div>
            </header>
        `;
        
        const headerDiv = document.createElement('div');
        headerDiv.innerHTML = headerHTML;
        appContent.appendChild(headerDiv.firstElementChild);
        
        this.cacheElements();
    }

    cacheElements() {
        const header = document.querySelector('.header');
        this.elements = {
            header: header,
            income: document.querySelector('.income__sum'),
            expenses: document.querySelector('.expenses__sum'),
            balance: document.querySelector('.balance__sum'),
            expected: document.querySelector('.expected__sum'),
            planned: document.querySelector('.planned__sum'),
            balanceContainer: document.querySelector('.header__balance')
        };
    }

    setupEventListeners() {
        // Слушаем событие смены вкладки
        this.app.on('tab:changed', (data) => {
            if (data && data.tab) {
                console.log('Header: received tab change event:', data.tab);
                this.updateHeaderForTab(data.tab);
            }
        });
        
        // Слушаем обновление операций
        this.app.on('operations:updated', (data) => {
            if (data) {
                console.log('Header: received operations update:', data);
                this.totals.incomeTotal = data.incomeTotal || 0;
                this.totals.expenseTotal = data.expenseTotal || 0;
                this.totals.balance = data.balance || 0;
                this.update();
            }
        });
        
        // Слушаем событие очистки данных
        this.app.on('data:cleared', () => {
            console.log('Header: данные очищены');
            this.totals = {
                incomeTotal: 0,
                expenseTotal: 0,
                expectedTotal: 0,
                plannedTotal: 0,
                balance: 0
            };
            this.update();
        });
    }

    loadTotals() {
        // Загружаем операции для начального расчета
        try {
            const operationsData = localStorage.getItem('budgetOperations');
            if (operationsData) {
                const operations = JSON.parse(operationsData);
                
                this.totals.incomeTotal = operations
                    .filter(op => op.type === 'income')
                    .reduce((sum, op) => sum + (op.amount || 0), 0);
                    
                this.totals.expenseTotal = operations
                    .filter(op => op.type === 'expense')
                    .reduce((sum, op) => sum + (op.amount || 0), 0);
                    
                this.totals.balance = this.totals.incomeTotal - this.totals.expenseTotal;
            }
        } catch (error) {
            console.error('Ошибка загрузки totals:', error);
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

    updateHeaderForTab(tabName) {
        if (!this.elements || !this.elements.header) {
            console.log('Header: elements not found');
            return;
        }
        
        console.log('Header: updating for tab:', tabName);
        
        // Убираем все классы состояний
        this.elements.header.classList.remove('header--main', 'header--expected', 'header--plans', 'header--settings');
        
        // Добавляем класс для текущей вкладки
        switch(tabName) {
            case 'main':
                this.elements.header.classList.add('header--main');
                break;
            case 'expected':
                this.elements.header.classList.add('header--expected');
                break;
            case 'plans':
                this.elements.header.classList.add('header--plans');
                break;
            case 'settings':
                this.elements.header.classList.add('header--settings');
                break;
        }
        
        console.log('Header classes:', this.elements.header.className);
    }

    update() {
        if (!this.elements) return;
        
        // Обновляем значения
        if (this.elements.income) {
            this.elements.income.textContent = `${this.formatCurrency(this.totals.incomeTotal)} Р`;
        }
        
        if (this.elements.expenses) {
            this.elements.expenses.textContent = `${this.formatCurrency(this.totals.expenseTotal)} Р`;
        }
        
        if (this.elements.expected) {
            this.elements.expected.textContent = `${this.formatCurrency(this.totals.expectedTotal)} Р`;
        }
        
        if (this.elements.planned) {
            this.elements.planned.textContent = `${this.formatCurrency(this.totals.plannedTotal)} Р`;
        }
        
        if (this.elements.balance) {
            const balanceText = this.totals.balance > 0 
                ? `+${this.formatCurrency(this.totals.balance)} Р`
                : `${this.formatCurrency(this.totals.balance)} Р`;
            
            this.elements.balance.textContent = balanceText;
            
            if (this.elements.balanceContainer) {
                this.elements.balanceContainer.classList.remove('positive', 'negative', 'neutral');
                this.elements.balanceContainer.classList.add(this.getBalanceClass(this.totals.balance));
            }
        }
        
        console.log('Header updated with totals:', this.totals);
    }
}

export default HeaderModule;