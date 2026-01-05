// Модуль шапки приложения

class HeaderModule {
    constructor(app) {
        this.app = app;
        this.elements = null;
    }

    async init() {
        console.log('🔧 Header Module: init() called');
        
        // Ждем немного, чтобы DOM точно загрузился
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Инициализируем элементы
        this.cacheElements();
        
        // Если элементы не найдены, пробуем еще раз
        if (!this.elements || !this.elements.income) {
            console.warn('⚠️ Header elements not found, retrying...');
            await new Promise(resolve => setTimeout(resolve, 500));
            this.cacheElements();
        }
        
        // Устанавливаем начальные значения
        this.update();
        
        // Настраиваем слушатели событий
        this.setupEventListeners();
        
        // Настраиваем тултипы
        this.setupTooltips();
        
        console.log('✅ Header Module: initialization complete');
        
        return this;
    }

    cacheElements() {
        console.log('🔍 Header Module: caching elements...');
        
        this.elements = {
            income: document.querySelector('.income__sum'),
            expenses: document.querySelector('.expenses__sum'),
            balance: document.querySelector('.balance__sum'),
            expected: document.querySelector('.expected__sum'),
            planned: document.querySelector('.planned__sum'),
            balanceContainer: document.querySelector('.header__balance')
        };
        
        console.log('📋 Header elements cached:', {
            income: !!this.elements.income,
            expenses: !!this.elements.expenses,
            balance: !!this.elements.balance,
            expected: !!this.elements.expected,
            planned: !!this.elements.planned,
            balanceContainer: !!this.elements.balanceContainer
        });
    }

    setupEventListeners() {
        console.log('🎯 Header Module: setting up event listeners');
        
        // Слушаем события переключения вкладок
        if (this.app && this.app.on) {
            this.app.on('tab:changed', (data) => {
                this.updateHeaderForTab(data.tab);
            });
        }
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
        
        console.log(`🔄 Header updated for tab: ${tabName}`);
    }

    setupTooltips() {
        // Тултипы уже есть в CSS
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

            // Фактические доходы и расходы
            operations.forEach(operation => {
                if (operation.type === 'income') {
                    incomeTotal += operation.amount || 0;
                } else if (operation.type === 'expense') {
                    expensesTotal += operation.amount || 0;
                }
            });

            // Ожидаемые доходы (только ожидающиеся)
            expectedIncomes.forEach(income => {
                if (income.status === 'pending') {
                    expectedTotal += income.amount || 0;
                }
            });

            // Плановые расходы (только не выполненные)
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
            console.error('Header Module: Error calculating totals:', error);
            
            // Демо данные
            return {
                incomeTotal: 15000.50,
                expensesTotal: 8500.75,
                expectedTotal: 5000.00,
                plannedTotal: 3200.25,
                balance: 6500.75
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
        console.log('🔄 Header Module: updating display...');
        
        if (!this.elements) {
            console.error('❌ Header Module: elements not cached');
            this.cacheElements();
        }
        
        const totals = this.calculateTotals();
        
        // Обновляем значения
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
            
            // Обновляем классы
            if (this.elements.balanceContainer) {
                this.elements.balanceContainer.classList.remove('positive', 'negative', 'neutral');
                this.elements.balanceContainer.classList.add(this.getBalanceClass(totals.balance));
            }
        }
        
        console.log('✅ Header Module: update complete');
    }
}

export default HeaderModule;