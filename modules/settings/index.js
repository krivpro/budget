class SettingsModule {
    constructor(app) {
        this.app = app;
    }

    async init() {
        console.log('Settings Module initialized');
        this.createTabContent();
        return this;
    }

    createTabContent() {
        const appContent = this.app.getContainer();
        
        let tabContent = appContent.querySelector('.tab-content[data-tab="settings"]');
        
        if (!tabContent) {
            tabContent = document.createElement('div');
            tabContent.className = 'tab-content';
            tabContent.dataset.tab = 'settings';
            appContent.appendChild(tabContent);
        }
        
        tabContent.innerHTML = `
            <div class="settings-content">
                <h2 style="color: white; padding: 20px; text-align: center;">
                    Настройки (заглушка)
                </h2>
            </div>
        `;
        
        console.log('✅ Settings tab content created');
    }
}

export default SettingsModule;