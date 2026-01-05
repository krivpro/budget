class PlansModule {
    constructor(app) {
        this.app = app;
    }

    async init() {
        console.log('Plans Module initialized');
        this.createTabContent();
        return this;
    }

    createTabContent() {
        const appContent = this.app.getContainer();
        
        let tabContent = appContent.querySelector('.tab-content[data-tab="plans"]');
        
        if (!tabContent) {
            tabContent = document.createElement('div');
            tabContent.className = 'tab-content';
            tabContent.dataset.tab = 'plans';
            appContent.appendChild(tabContent);
        }
        
        tabContent.innerHTML = `
            <div class="plans-content">
                <h2 style="color: white; padding: 20px; text-align: center;">
                    Модуль плановых расходов (заглушка)
                </h2>
            </div>
        `;
        
        console.log('✅ Plans tab content created');
    }
}

export default PlansModule;