// modules/operations/index.js
import { OperationsStorage } from './storage.js';

class OperationsModule {
    constructor(app) {
        this.app = app;
        this.operations = [];
        this.currentFilter = 'all';
    }

    async init() {
        console.log('Operations Module initialized');
        this.operations = OperationsStorage.getOperations();
        
        // Проверяем данные
        console.log('Загружено операций:', this.operations.length);
        if (this.operations.length > 0) {
            console.log('Пример операции:', this.operations[0]);
        }
        
        this.createTabContent();
        this.setupEventListeners();
        this.renderOperations();
        this.updateStats();
        return this;
    }

    createTabContent() {
        const appContent = this.app.getContainer();
        
        let tabContent = appContent.querySelector('.tab-content[data-tab="main"]');
        
        if (!tabContent) {
            tabContent = document.createElement('div');
            tabContent.className = 'tab-content';
            tabContent.dataset.tab = 'main';
            appContent.appendChild(tabContent);
        }
        
        if (this.app.getCurrentTab() === 'main') {
            tabContent.classList.add('active');
        }
        
        tabContent.innerHTML = `
            <div class="operations-content">
                <!-- Форма добавления операции -->
                <div class="add">
                    <div class="control-panel">
                        <h2 class="control-panel__title">Добавить операцию</h2>
                        <div class="control-panel__categories categories">
                            <div class="categories__item active" data-type="income">Доходы</div>
                            <div class="categories__item" data-type="expense">Расходы</div>
                        </div>
                    </div>
                    
                    <input type="text" class="add__input" id="amountInput" placeholder="Сумма" inputmode="decimal">
                    
                    <input type="text" class="add__input" id="descriptionInput" placeholder="Описание" maxlength="100">
                    
                    <input type="text" class="add__input date-input" id="dateInput" placeholder="Выберите дату" readonly>
                    <input type="date" id="realDateInput" class="visually-hidden">
                    
                    <a href="#" class="add__btn" id="addBtn">+ Добавить операцию</a> 
                </div>
                
                <!-- История операций -->
                <div class="list history">
                    <div class="control-panel">
                        <h2 class="control-panel__title">Список операций</h2>
                        <div class="control-panel__categories categories">
                            <div class="categories__item active" data-filter="all">Все</div>
                            <div class="categories__item" data-filter="income">Доходы</div>
                            <div class="categories__item" data-filter="expense">Расходы</div>
                        </div>
                    </div>
                    <div class="history-content">
                        <!-- Операции будут здесь -->
                    </div>
                </div>
            </div>
        `;
        
        console.log('✅ Operations tab content created');
    }

    setupEventListeners() {
        // Кнопка добавления операции
        setTimeout(() => {
            const addBtn = document.getElementById('addBtn');
            if (addBtn) {
                addBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleAddOperation();
                });
            }
            
            // Переключение типа операции (доход/расход)
            const categoryItems = document.querySelectorAll('.add .categories__item');
            categoryItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    categoryItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                });
            });
            
            // Фильтры в истории
            const filterItems = document.querySelectorAll('.history .categories__item');
            filterItems.forEach(item => {
                item.addEventListener('click', () => {
                    const filter = item.dataset.filter;
                    this.filterOperations(filter);
                });
            });
            
            // Поле даты - устанавливаем сегодняшнюю дату по умолчанию
            const dateInput = document.getElementById('dateInput');
            const realDateInput = document.getElementById('realDateInput');
            
            if (dateInput && realDateInput) {
                this.setTodayDate(); // Устанавливаем сегодняшнюю дату
                
                dateInput.addEventListener('click', () => {
                    // TODO: Открыть календарь
                    this.showCalendarModal();
                });
            }
            
            // Валидация суммы при вводе
            const amountInput = document.getElementById('amountInput');
            if (amountInput) {
                amountInput.addEventListener('input', (e) => {
                    this.validateAmountInput(e.target);
                });
            }
            
            // Добавление по Enter в поле описания
            const descriptionInput = document.getElementById('descriptionInput');
            if (descriptionInput) {
                descriptionInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.handleAddOperation();
                    }
                });
            }
        }, 100);
    }

    handleAddOperation() {
        // Получаем значения из формы
        const amountInput = document.getElementById('amountInput');
        const descriptionInput = document.getElementById('descriptionInput');
        const realDateInput = document.getElementById('realDateInput');
        
        const amountText = amountInput.value.replace(',', '.');
        const amount = parseFloat(amountText);
        const description = descriptionInput.value.trim();
        const date = realDateInput.value;
        
        console.log('Добавление операции:', { amount, description, date });
        
        // Валидация
        if (!amount || amount <= 0 || isNaN(amount)) {
            this.showError('Пожалуйста, введите корректную сумму');
            amountInput.focus();
            return;
        }
        
        if (!description) {
            this.showError('Пожалуйста, введите описание');
            descriptionInput.focus();
            return;
        }
        
        if (!date) {
            this.showError('Пожалуйста, выберите дату');
            document.getElementById('dateInput').focus();
            return;
        }
        
        // Определяем тип операции
        const activeType = document.querySelector('.add .categories__item.active');
        const type = activeType ? activeType.dataset.type : 'income';
        
        // Создаём операцию
        const operation = {
            id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            type: type,
            amount: parseFloat(amount.toFixed(2)),
            description: description,
            date: date,
            createdAt: new Date().toISOString()
        };
        
        console.log('Создана операция:', operation);
        
        // Добавляем в массив
        this.operations.push(operation);
        
        // Сохраняем
        OperationsStorage.saveOperations(this.operations);
        
        // Показываем уведомление
        this.showSuccess(`${type === 'income' ? 'Доход' : 'Расход'} "${description}" добавлен`);
        
        // Очищаем форму
        amountInput.value = '';
        descriptionInput.value = '';
        // Дата остаётся сегодняшней
        
        // Обновляем UI
        this.renderOperations();
        this.updateStats();
        
        // Уведомляем другие модули
        this.app.emit('operation:added', operation);
    }

    filterOperations(filterType) {
        this.currentFilter = filterType;
        
        // Обновляем активный фильтр
        const filterItems = document.querySelectorAll('.history .categories__item');
        filterItems.forEach(item => {
            if (item.dataset.filter === filterType) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        this.renderOperations();
    }

    renderOperations() {
        const historyContent = document.querySelector('.history-content');
        if (!historyContent) return;
        
        // Фильтруем операции
        let filteredOps = this.operations;
        if (this.currentFilter !== 'all') {
            filteredOps = this.operations.filter(op => op.type === this.currentFilter);
        }
        
        console.log('Отображаем операций:', filteredOps.length);
        
        if (filteredOps.length === 0) {
            const message = this.currentFilter === 'all' 
                ? 'Операций пока нет' 
                : this.currentFilter === 'income' 
                    ? 'Нет доходов' 
                    : 'Нет расходов';
                    
            const hint = this.currentFilter === 'all' 
                ? 'Добавьте первую операцию в форме выше'
                : 'Переключитесь на "Все" или попробуйте другой фильтр';
            
            historyContent.innerHTML = `
                <div class="list__no-data list__no-data--history">
                    <div class="list__no-data__description">${message}</div>
                    <div class="list__no-data__hint">${hint}</div>
                </div>
            `;
            return;
        }
        
        // Сортируем по дате (новые сверху), а при одинаковой дате - по времени создания
        filteredOps.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            const dateDiff = dateB - dateA;
            
            if (dateDiff !== 0) {
                return dateDiff;
            }
            
            const createdAtA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const createdAtB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return createdAtB - createdAtA;
        });
        
        // Рендерим
        historyContent.innerHTML = filteredOps.map(op => this.renderOperation(op)).join('');
    }

    renderOperation(operation) {
        // Проверяем структуру операции
        if (!operation || typeof operation !== 'object') {
            console.error('Некорректная операция:', operation);
            return '';
        }
        
        // Безопасное получение данных
        const type = operation.type || 'income';
        const amount = operation.amount || 0;
        const description = operation.description || 'Без описания';
        const date = operation.date || new Date().toISOString().split('T')[0];
        
        // Форматируем дату
        let formattedDate;
        try {
            const dateObj = new Date(date);
            formattedDate = dateObj.toLocaleDateString('ru-RU');
        } catch (e) {
            formattedDate = 'Некорректная дата';
        }
        
        // Форматируем сумму
        const amountFormatted = amount.toFixed(2).replace('.', ',');
        
        return `
            <div class="operation" data-id="${operation.id || Date.now()}">
                <div class="operation__info">
                    <p class="operation__description">${this.escapeHtml(description)}</p>
                    <p class="operation__date">${formattedDate}</p>
                </div>
                <p class="operation__amount ${type === 'income' ? 'operation__amount--income' : 'operation__amount--expense'}">
                    ${type === 'income' ? '+' : '-'}${amountFormatted} Р
                </p>
            </div>
        `;
    }

    updateStats() {
        // Считаем общие суммы
        const incomeTotal = this.operations
            .filter(op => op.type === 'income')
            .reduce((sum, op) => sum + (op.amount || 0), 0);
            
        const expenseTotal = this.operations
            .filter(op => op.type === 'expense')
            .reduce((sum, op) => sum + (op.amount || 0), 0);
        
        const balance = incomeTotal - expenseTotal;
        
        console.log('Статистика:', { 
            incomeTotal, 
            expenseTotal, 
            balance,
            operationsCount: this.operations.length 
        });
        
        // Уведомляем HeaderModule об обновлении
        this.app.emit('operations:updated', {
            incomeTotal,
            expenseTotal,
            balance
        });
    }

    setTodayDate() {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('ru-RU');
        const dateString = today.toISOString().split('T')[0];
        
        const dateInput = document.getElementById('dateInput');
        const realDateInput = document.getElementById('realDateInput');
        
        if (dateInput) dateInput.value = formattedDate;
        if (realDateInput) realDateInput.value = dateString;
    }

    showCalendarModal() {
        // Временное решение - показываем alert
        alert('Календарь будет добавлен позже. Дата установлена на сегодня.');
        this.setTodayDate();
    }

    validateAmountInput(input) {
        // Очищаем от всех символов кроме цифр и точки/запятой
        let value = input.value.replace(/[^\d,\.]/g, '');
        
        // Заменяем запятую на точку
        value = value.replace(',', '.');
        
        // Удаляем лишние точки
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Ограничиваем до 2 знаков после запятой
        if (parts.length === 2 && parts[1].length > 2) {
            value = parts[0] + '.' + parts[1].substring(0, 2);
        }
        
        input.value = value;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        const uiModule = this.app.getModule('ui');
        if (uiModule && uiModule.showNotification) {
            uiModule.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }

    showSuccess(message) {
        const uiModule = this.app.getModule('ui');
        if (uiModule && uiModule.showNotification) {
            uiModule.showNotification(message, 'success');
        }
    }
}

export default OperationsModule;