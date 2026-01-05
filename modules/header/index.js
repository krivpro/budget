// modules/header/index.js
class HeaderModule {
    constructor(app) {
        this.app = app;
        this.elements = null;
    }

    async init() {
        console.log('Header Module initialized');
        this.createHeader();
        this.setupEventListeners();
        this.updateHeaderForTab(this.app.getCurrentTab());
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
        
        // Заглушка - всегда показывает 0
        if (this.elements.income) this.elements.income.textContent = '0,00 Р';
        if (this.elements.expenses) this.elements.expenses.textContent = '0,00 Р';
        if (this.elements.expected) this.elements.expected.textContent = '0,00 Р';
        if (this.elements.planned) this.elements.planned.textContent = '0,00 Р';
        if (this.elements.balance) this.elements.balance.textContent = '0,00 Р';
    }
}

export default HeaderModule;