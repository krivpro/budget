// modules/settings/index.js
class SettingsModule {
    constructor(app) {
        this.app = app;
    }

    async init() {
        console.log('Settings Module initialized');
        this.createTabContent();
        this.setupEventListeners();
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
                <div class="list settings">
                    <div class="control-panel">
                        <h2 class="control-panel__title">Настройки</h2>
                    </div>
                    
                    <div class="settings-content">
                        <!-- Раздел данных -->
                        <div class="settings-section">
                            <h3 class="settings-section__title">Данные</h3>
                            
                            <!-- Статистика данных -->
                            <div class="settings-item">
                                <div class="settings-item__info">
                                    <div class="settings-item__title">Статистика данных</div>
                                    <div class="settings-item__description" id="dataStats">
                                        Загрузка...
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Очистка всех данных -->
                            <div class="settings-item">
                                <div class="settings-item__info">
                                    <div class="settings-item__title">Очистить все данные</div>
                                    <div class="settings-item__description">
                                        Удалить все операции, ожидаемые доходы и плановые расходы. Это действие нельзя отменить.
                                    </div>
                                </div>
                                <button class="settings-btn settings-btn--danger" id="clearAllDataBtn">
                                    Очистить
                                </button>
                            </div>
                            
                            <!-- Экспорт данных (будет позже) -->
                            <div class="settings-item">
                                <div class="settings-item__info">
                                    <div class="settings-item__title">Экспорт данных</div>
                                    <div class="settings-item__description">
                                        Сохранить все данные в файл (будет добавлено позже)
                                    </div>
                                </div>
                                <button class="settings-btn" id="exportDataBtn" disabled>
                                    Экспорт
                                </button>
                            </div>
                            
                            <!-- Импорт данных (будет позже) -->
                            <div class="settings-item">
                                <div class="settings-item__info">
                                    <div class="settings-item__title">Импорт данных</div>
                                    <div class="settings-item__description">
                                        Загрузить данные из файла (будет добавлено позже)
                                    </div>
                                </div>
                                <button class="settings-btn" id="importDataBtn" disabled>
                                    Импорт
                                </button>
                            </div>
                        </div>
                        
                        <!-- Раздел о приложении -->
                        <div class="settings-section">
                            <h3 class="settings-section__title">О приложении</h3>
                            
                            <div class="settings-item">
                                <div class="settings-item__info">
                                    <div class="settings-item__title">Версия</div>
                                    <div class="settings-item__description">
                                        Budget App v2.0 (модульная версия)
                                    </div>
                                </div>
                            </div>
                            
                            <div class="settings-item">
                                <div class="settings-item__info">
                                    <div class="settings-item__title">Разработчик</div>
                                    <div class="settings-item__description">
                                        Модульная архитектура с независимыми компонентами
                                    </div>
                                </div>
                            </div>
                            
                            <div class="settings-item">
                                <div class="settings-item__info">
                                    <div class="settings-item__title">Оптимизировано для мобильных</div>
                                    <div class="settings-item__description">
                                        Адаптивный дизайн для всех устройств
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        console.log('✅ Settings tab content created');
        
        // Обновляем статистику данных
        setTimeout(() => this.updateDataStats(), 100);
    }

    setupEventListeners() {
        setTimeout(() => {
            // Кнопка очистки данных
            const clearBtn = document.getElementById('clearAllDataBtn');
            if (clearBtn) {
                clearBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleClearAllData();
                });
            }
            
            // Кнопки экспорта/импорта (пока отключены)
            const exportBtn = document.getElementById('exportDataBtn');
            const importBtn = document.getElementById('importDataBtn');
            
            if (exportBtn) {
                exportBtn.title = 'Функция будет добавлена в будущем';
            }
            
            if (importBtn) {
                importBtn.title = 'Функция будет добавлена в будущем';
            }
        }, 100);
    }

    updateDataStats() {
        const statsElement = document.getElementById('dataStats');
        if (!statsElement) return;
        
        try {
            // Получаем данные из localStorage
            const operations = JSON.parse(localStorage.getItem('budgetOperations') || '[]');
            const expectedIncomes = JSON.parse(localStorage.getItem('budgetExpectedIncomes') || '[]');
            const plannedExpenses = JSON.parse(localStorage.getItem('budgetPlannedExpenses') || '[]');
            
            const totalItems = operations.length + expectedIncomes.length + plannedExpenses.length;
            
            if (totalItems === 0) {
                statsElement.textContent = 'Нет сохраненных данных';
                return;
            }
            
            // Форматируем статистику
            const stats = [];
            
            if (operations.length > 0) {
                const incomeCount = operations.filter(op => op.type === 'income').length;
                const expenseCount = operations.filter(op => op.type === 'expense').length;
                stats.push(`Операции: ${operations.length} (${incomeCount} доходов, ${expenseCount} расходов)`);
            }
            
            if (expectedIncomes.length > 0) {
                const pendingCount = expectedIncomes.filter(inc => inc.status === 'pending').length;
                stats.push(`Ожидаемые доходы: ${expectedIncomes.length} (${pendingCount} ожидают)`);
            }
            
            if (plannedExpenses.length > 0) {
                const activeCount = plannedExpenses.filter(plan => !plan.completed).length;
                stats.push(`Плановые расходы: ${plannedExpenses.length} (${activeCount} активны)`);
            }
            
            statsElement.textContent = stats.join(' • ');
            
        } catch (error) {
            console.error('Ошибка при получении статистики данных:', error);
            statsElement.textContent = 'Ошибка загрузки статистики';
        }
    }

    async handleClearAllData() {
        // Получаем UI модуль для уведомлений
        const uiModule = this.app.getModule('ui');
        
        // Проверяем, есть ли данные для очистки
        const operations = JSON.parse(localStorage.getItem('budgetOperations') || '[]');
        const expectedIncomes = JSON.parse(localStorage.getItem('budgetExpectedIncomes') || '[]');
        const plannedExpenses = JSON.parse(localStorage.getItem('budgetPlannedExpenses') || '[]');
        
        const totalItems = operations.length + expectedIncomes.length + plannedExpenses.length;
        
        if (totalItems === 0) {
            if (uiModule && uiModule.showNotification) {
                uiModule.showNotification('Нет данных для очистки', 'error');
            } else {
                alert('Нет данных для очистки');
            }
            return;
        }
        
        // Подтверждение
        const confirmed = confirm(
            `Вы уверены, что хотите удалить ВСЕ данные?\n\n` +
            `Будет удалено:\n` +
            `• ${operations.length} операций\n` +
            `• ${expectedIncomes.length} ожидаемых доходов\n` +
            `• ${plannedExpenses.length} плановых расходов\n\n` +
            `Это действие нельзя отменить!`
        );
        
        if (!confirmed) {
            return;
        }
        
        try {
            // Очищаем все данные
            localStorage.removeItem('budgetOperations');
            localStorage.removeItem('budgetExpectedIncomes');
            localStorage.removeItem('budgetPlannedExpenses');
            
            // Показываем уведомление об успехе
            if (uiModule && uiModule.showNotification) {
                uiModule.showNotification('Все данные успешно удалены', 'success');
            }
            
            // Обновляем статистику
            this.updateDataStats();
            
            // Уведомляем другие модули об очистке
            this.app.emit('data:cleared', {});
            
            console.log('✅ Все данные очищены');
            
        } catch (error) {
            console.error('Ошибка при очистке данных:', error);
            
            if (uiModule && uiModule.showNotification) {
                uiModule.showNotification('Ошибка при очистке данных', 'error');
            }
        }
    }
}

export default SettingsModule;