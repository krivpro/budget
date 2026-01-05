// modules/operations/index.js
class OperationsModule {
    constructor(app) {
        this.app = app;
    }

    async init() {
        console.log('Operations Module initialized');
        this.createTabContent();
        return this;
    }

    createTabContent() {
        const appContent = this.app.getContainer();
        
        // Создаем контейнер для вкладки "main" если его нет
        let tabContent = appContent.querySelector('.tab-content[data-tab="main"]');
        
        if (!tabContent) {
            tabContent = document.createElement('div');
            tabContent.className = 'tab-content';
            tabContent.dataset.tab = 'main';
            appContent.appendChild(tabContent);
        }
        
        // Если мы на главной вкладке - делаем её активной
        if (this.app.getCurrentTab() === 'main') {
            tabContent.classList.add('active');
        }
        
        // Добавляем содержимое вкладки
        tabContent.innerHTML = `
            <div class="operations-content">
                <h2 style="color: white; padding: 20px; text-align: center;">
                    Модуль операций (заглушка)
                </h2>
                <p style="color: #8A8A8A; text-align: center;">
                    Здесь будет статистика, добавление операций и история
                </p>
            </div>
        `;
        
        console.log('✅ Operations tab content created');
    }
}

export default OperationsModule;