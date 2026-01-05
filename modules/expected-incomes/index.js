class ExpectedIncomesModule {
    constructor(app) {
        this.app = app;
    }

    async init() {
        console.log('Expected Incomes Module initialized');
        this.createTabContent();
        return this;
    }

    createTabContent() {
        const appContent = this.app.getContainer();
        
        let tabContent = appContent.querySelector('.tab-content[data-tab="expected"]');
        
        if (!tabContent) {
            tabContent = document.createElement('div');
            tabContent.className = 'tab-content';
            tabContent.dataset.tab = 'expected';
            appContent.appendChild(tabContent);
        }
        
        tabContent.innerHTML = `
            <div class="expected-content">
                <h2 style="color: white; padding: 20px; text-align: center;">
                    Модуль ожидаемых доходов (заглушка)
                </h2>
            </div>
        `;
        
        console.log('✅ Expected incomes tab content created');
    }
}

export default ExpectedIncomesModule;