// Константы цветов для графика
const CHART_COLORS = {
    income: '#4CAF50',
    expense: '#FF7653',
    expected: '#FFB74D',
    balance: '#FFFFFF',
    grid: '#3B3B3B',
    text: '#8A8A8A',
    background: '#272727'
};

// Категории доходов
const INCOME_CATEGORIES = {
    freelance: { name: 'Фриланс', color: '#FFB74D' },
    salary: { name: 'Зарплата', color: '#4CAF50' },
    investment: { name: 'Инвестиции', color: '#2196F3' },
    sales: { name: 'Продажи', color: '#9C27B0' },
    other: { name: 'Другое', color: '#607D8B' }
};

// Структура данных приложения
const budgetApp = {
    // Данные приложения
    data: {
        operations: JSON.parse(localStorage.getItem('budgetOperations')) || [],
        plannedExpenses: JSON.parse(localStorage.getItem('budgetPlannedExpenses')) || [],
        expectedIncomes: JSON.parse(localStorage.getItem('budgetExpectedIncomes')) || [],
        incomeTotal: 0,
        expensesTotal: 0,
        expectedTotal: 0,
        balance: 0
    },
    
    // Текущая выбранная дата для календаря
    currentSelectedDate: null,
    
    // Ссылки на элементы формы плана для календаря
    currentPlanDateInput: null,
    currentRealPlanDateInput: null,
    
    // Объект графика
    chart: null,
    
    // Сохранение в localStorage
    saveToStorage() {
        try {
            localStorage.setItem('budgetOperations', JSON.stringify(this.data.operations));
            localStorage.setItem('budgetPlannedExpenses', JSON.stringify(this.data.plannedExpenses));
            localStorage.setItem('budgetExpectedIncomes', JSON.stringify(this.data.expectedIncomes));
        } catch (error) {
            console.error('Ошибка сохранения в localStorage:', error);
            this.showNotification('Ошибка сохранения данных. Возможно, недостаточно места в хранилище.', 'error');
        }
    },
    
    // Инициализация приложения
    init() {
        this.calculateTotals();
        this.renderTotals();
        this.renderOperations();
        this.renderPlans();
        this.renderExpectedIncomes();
        this.setupEventListeners();
        this.initCalendar();
        this.initChart();
        console.log('Budget app initialized with expected incomes feature');
    },
    
    // Расчет итоговых сумм
    calculateTotals() {
        this.data.incomeTotal = 0;
        this.data.expensesTotal = 0;
        this.data.expectedTotal = 0;
        
        // Рассчитываем фактические доходы и расходы
        this.data.operations.forEach(operation => {
            if (operation.type === 'income') {
                this.data.incomeTotal += operation.amount;
            } else if (operation.type === 'expense') {
                this.data.expensesTotal += operation.amount;
            }
        });
        
        // Рассчитываем ожидаемые доходы (только ожидающиеся)
        this.data.expectedIncomes.forEach(income => {
            if (income.status === 'pending') {
                this.data.expectedTotal += income.amount;
            }
        });
        
        // Рассчитываем остаток
        this.data.balance = this.data.incomeTotal - this.data.expensesTotal;
    },
    
    // Отображение итогов в шапке
    renderTotals() {
        const incomeElement = document.querySelector('.income__sum');
        const expensesElement = document.querySelector('.expenses__sum');
        const balanceElement = document.querySelector('.balance__sum');
        const expectedElement = document.querySelector('.expected__sum');
        const balanceContainer = document.querySelector('.header__balance');
        
        if (incomeElement) {
            incomeElement.textContent = `${this.formatCurrency(this.data.incomeTotal)} Р`;
        }
        
        if (expensesElement) {
            expensesElement.textContent = `${this.formatCurrency(this.data.expensesTotal)} Р`;
        }
        
        if (expectedElement) {
            expectedElement.textContent = `${this.formatCurrency(this.data.expectedTotal)} Р`;
        }
        
        if (balanceElement) {
            const balance = this.data.balance || 0;
            
            // Форматируем с учетом знака
            if (balance > 0) {
                balanceElement.textContent = `+${this.formatCurrency(balance)} Р`;
            } else if (balance < 0) {
                balanceElement.textContent = `${this.formatCurrency(balance)} Р`;
            } else {
                balanceElement.textContent = `${this.formatCurrency(balance)} Р`;
            }
            
            // Обновляем классы для цвета
            if (balanceContainer) {
                balanceContainer.classList.remove('positive', 'negative', 'neutral');
                
                if (balance > 0) {
                    balanceContainer.classList.add('positive');
                } else if (balance < 0) {
                    balanceContainer.classList.add('negative');
                } else {
                    balanceContainer.classList.add('neutral');
                }
            }
        }
        
        // Добавляем тултип для ожидаемых доходов
        const expectedHeader = document.querySelector('.header__expected');
        if (expectedHeader) {
            let expectedTooltip = expectedHeader.querySelector('.expected-tooltip');
            if (!expectedTooltip) {
                expectedTooltip = document.createElement('div');
                expectedTooltip.className = 'expected-tooltip';
                expectedTooltip.innerHTML = `
                    <div>Ожидаемые доходы</div>
                    <div style="font-size: 11px; margin-top: 2px;">(еще не получены)</div>
                `;
                expectedHeader.appendChild(expectedTooltip);
            }
        }
    },
    
    // Форматирование суммы
    formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },
    
    // Настройка обработчиков событий
    setupEventListeners() {
        // Обработчик кнопки добавления операции
        const addButton = document.getElementById('addBtn');
        if (addButton) {
            addButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.addOperation();
            });
        }
        
        // Обработчик клавиши Enter в полях ввода
        const amountInput = document.getElementById('amountInput');
        const descriptionInput = document.getElementById('descriptionInput');
        
        [amountInput, descriptionInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.addOperation();
                    }
                });
            }
        });
        
        // Валидация суммы при вводе
        if (amountInput) {
            amountInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(',', '.');
                value = value.replace(/[^0-9.]/g, '');
                
                // Удаляем лишние точки
                const parts = value.split('.');
                if (parts.length > 2) {
                    value = parts[0] + '.' + parts.slice(1).join('');
                }
                
                // Ограничиваем до 2 знаков после запятой
                if (parts.length === 2 && parts[1].length > 2) {
                    value = parts[0] + '.' + parts[1].substring(0, 2);
                }
                
                e.target.value = value;
            });
        }
        
        // Обработчик переключения категорий в форме добавления
        const addCategoryItems = document.querySelectorAll('.add .categories__item');
        addCategoryItems.forEach(item => {
            item.addEventListener('click', () => {
                // Убираем активный класс у всех
                addCategoryItems.forEach(i => i.classList.remove('active'));
                // Добавляем активный класс текущему
                item.classList.add('active');
                
                // Показываем/скрываем дополнительные поля для ожидаемых доходов
                const expectedFields = document.getElementById('expectedFields');
                if (item.dataset.type === 'expected') {
                    expectedFields.style.display = 'block';
                    // Обновляем текст кнопки
                    const addBtn = document.getElementById('addBtn');
                    if (addBtn) {
                        addBtn.textContent = '+ Добавить ожидаемый доход';
                    }
                } else {
                    expectedFields.style.display = 'none';
                    // Восстанавливаем текст кнопки
                    const addBtn = document.getElementById('addBtn');
                    if (addBtn) {
                        addBtn.textContent = '+ Добавить операцию';
                    }
                }
            });
        });
        
        // Обработчик слайдера вероятности
        const probabilityInput = document.getElementById('probabilityInput');
        const probabilityValue = document.getElementById('probabilityValue');
        if (probabilityInput && probabilityValue) {
            probabilityInput.addEventListener('input', (e) => {
                probabilityValue.textContent = `${e.target.value}%`;
            });
        }
        
        // Обработчик кнопки очистки данных
        const clearButton = document.getElementById('clearBtn');
        if (clearButton) {
            clearButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearAllData();
            });
        }
        
        // Обработчик для поля даты (основная форма)
        const dateInput = document.getElementById('dateInput');
        if (dateInput) {
            dateInput.addEventListener('click', () => this.openCalendar());
        }
        
        // Обработчики для календаря (без изменений)
        const calendarClose = document.getElementById('calendarClose');
        if (calendarClose) {
            calendarClose.addEventListener('click', () => this.closeCalendar());
        }
        
        const calendarPrev = document.getElementById('calendarPrev');
        if (calendarPrev) {
            calendarPrev.addEventListener('click', () => this.changeMonth(-1));
        }
        
        const calendarNext = document.getElementById('calendarNext');
        if (calendarNext) {
            calendarNext.addEventListener('click', () => this.changeMonth(1));
        }
        
        const calendarToday = document.getElementById('calendarToday');
        if (calendarToday) {
            calendarToday.addEventListener('click', () => this.setToday());
        }
        
        const calendarClear = document.getElementById('calendarClear');
        if (calendarClear) {
            calendarClear.addEventListener('click', () => this.clearDate());
        }
        
        const calendarConfirm = document.getElementById('calendarConfirm');
        if (calendarConfirm) {
            calendarConfirm.addEventListener('click', () => this.closeCalendar());
        }
        
        // Закрытие календаря по клику на фон
        const calendarModal = document.getElementById('calendarModal');
        if (calendarModal) {
            calendarModal.addEventListener('click', (e) => {
                if (e.target === calendarModal) {
                    this.closeCalendar();
                }
            });
        }
        
        // Закрытие календаря по клавише Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCalendar();
            }
        });
        
        // Обработчики для вкладок ожидаемых доходов
        const expectedTabs = document.querySelectorAll('.expected .categories__item');
        expectedTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Убираем активный класс у всех
                expectedTabs.forEach(item => item.classList.remove('active'));
                // Добавляем активный класс текущему
                tab.classList.add('active');
                // Перерисовываем ожидаемые доходы
                this.renderExpectedIncomes();
            });
        });
        
        // Обработчики для вкладок планов (без изменений)
        const planTabs = document.querySelectorAll('.plans .categories__item');
        planTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Убираем активный класс у всех
                planTabs.forEach(item => item.classList.remove('active'));
                // Добавляем активный класс текущему
                tab.classList.add('active');
                // Перерисовываем планы
                this.renderPlans();
            });
        });
        
        // Обработчики для вкладок графика
        const chartTabs = document.querySelectorAll('.chart .categories__item');
        chartTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Убираем активный класс у всех
                chartTabs.forEach(item => item.classList.remove('active'));
                // Добавляем активный класс текущему
                tab.classList.add('active');
                // Перерисовываем график
                this.renderChart();
            });
        });
        
        // Обработчик категории "Планы" в основной форме
        const planCategory = document.querySelector('.add .categories__item[data-type="plan"]');
        if (planCategory) {
            planCategory.addEventListener('click', (e) => {
                e.preventDefault();
                // Переключаемся на вкладку "Добавить" в планах
                const addTab = document.querySelector('.plans .categories__item[data-action="add-new"]');
                if (addTab) {
                    // Убираем активный класс у всех
                    planTabs.forEach(item => item.classList.remove('active'));
                    // Добавляем активный класс вкладке "Добавить"
                    addTab.classList.add('active');
                    // Перерисовываем планы
                    this.renderPlans();
                    
                    // Прокручиваем к блоку планов
                    const plansBlock = document.querySelector('.plans');
                    if (plansBlock) {
                        plansBlock.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        }
    },
    
    // Очистка всех данных
    clearAllData() {
        if (this.data.operations.length === 0 && 
            this.data.plannedExpenses.length === 0 &&
            this.data.expectedIncomes.length === 0) {
            this.showNotification('Нет данных для очистки', 'error');
            return;
        }
        
        if (confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
            this.data.operations = [];
            this.data.plannedExpenses = [];
            this.data.expectedIncomes = [];
            this.calculateTotals();
            this.renderTotals();
            this.renderOperations();
            this.renderPlans();
            this.renderExpectedIncomes();
            this.renderChart();
            this.saveToStorage();
            
            this.showNotification('Все данные успешно удалены');
        }
    },
    
    // Показать уведомление
    showNotification(message, type = 'success') {
        // Удаляем существующие уведомления
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Создаем новое уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification__content">${message}</div>
        `;
        
        // Добавляем стили
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#FF7653'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            z-index: 2000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            font-size: 14px;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        // Автоматически удаляем через 3 секунды
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
    },
    
    // Добавление новой операции (обновлено для ожидаемых доходов)
    addOperation() {
        // Получаем выбранный тип операции
        const activeCategory = document.querySelector('.add .categories__item.active');
        if (!activeCategory) return;
        
        const operationType = activeCategory.dataset.type;
        
        // Если это планы - переключаемся на соответствующий раздел
        if (operationType === 'plan') {
            const addTab = document.querySelector('.plans .categories__item[data-action="add-new"]');
            if (addTab) {
                const planTabs = document.querySelectorAll('.plans .categories__item');
                planTabs.forEach(item => item.classList.remove('active'));
                addTab.classList.add('active');
                this.renderPlans();
                
                const plansBlock = document.querySelector('.plans');
                if (plansBlock) {
                    plansBlock.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
            return;
        }
        
        // Получаем значения из формы
        const amountInput = document.getElementById('amountInput');
        const descriptionInput = document.getElementById('descriptionInput');
        const realDateInput = document.getElementById('realDateInput');
        
        // Валидация
        const amount = parseFloat(amountInput.value.replace(',', '.'));
        const description = descriptionInput.value.trim();
        const date = realDateInput.value;
        
        if (!amount || amount <= 0 || isNaN(amount)) {
            this.showNotification('Пожалуйста, введите корректную сумму', 'error');
            amountInput.focus();
            return;
        }
        
        if (!description) {
            this.showNotification('Пожалуйста, введите описание', 'error');
            descriptionInput.focus();
            return;
        }
        
        if (!date) {
            this.showNotification('Пожалуйста, выберите дату', 'error');
            document.getElementById('dateInput').focus();
            return;
        }
        
        // Обрабатываем разные типы операций
        if (operationType === 'expected') {
            // Добавление ожидаемого дохода
            const probabilityInput = document.getElementById('probabilityInput');
            const clientInput = document.getElementById('clientInput');
            const incomeCategory = document.getElementById('incomeCategory');
            
            const probability = probabilityInput ? parseInt(probabilityInput.value) : 100;
            const client = clientInput ? clientInput.value.trim() : '';
            const category = incomeCategory ? incomeCategory.value : 'other';
            
            if (client && client.length > 50) {
                this.showNotification('Имя клиента слишком длинное', 'error');
                clientInput.focus();
                return;
            }
            
            const newExpectedIncome = {
                id: Date.now(),
                type: 'expected',
                amount: parseFloat(amount.toFixed(2)),
                description: description,
                date: date,
                status: 'pending',
                probability: probability,
                client: client,
                category: category,
                createdAt: new Date().toISOString(),
                receivedDate: null
            };
            
            this.data.expectedIncomes.push(newExpectedIncome);
            this.showNotification(`Ожидаемый доход "${description}" успешно добавлен`);
            
            // Перерисовываем ожидаемые доходы
            this.renderExpectedIncomes();
            
        } else {
            // Добавление обычной операции (доход/расход)
            const newOperation = {
                id: Date.now(),
                type: operationType,
                amount: parseFloat(amount.toFixed(2)),
                description: description,
                date: date,
                createdAt: new Date().toISOString()
            };
            
            this.data.operations.push(newOperation);
            
            const operationTypeText = operationType === 'income' ? 'доход' : 'расход';
            this.showNotification(`${operationTypeText} "${description}" успешно добавлен`);
            
            // Перерисовываем операции
            this.renderOperations();
        }
        
        // Общие действия для всех типов операций
        this.calculateTotals();
        this.renderTotals();
        this.saveToStorage();
        this.renderChart();
        
        // Очищаем форму
        amountInput.value = '';
        descriptionInput.value = '';
        
        // Очищаем дополнительные поля для ожидаемых доходов
        const probabilityInput = document.getElementById('probabilityInput');
        const probabilityValue = document.getElementById('probabilityValue');
        const clientInput = document.getElementById('clientInput');
        const incomeCategory = document.getElementById('incomeCategory');
        
        if (probabilityInput) probabilityInput.value = 100;
        if (probabilityValue) probabilityValue.textContent = '100%';
        if (clientInput) clientInput.value = '';
        if (incomeCategory) incomeCategory.value = 'freelance';
        
        // Очищаем дату
        const dateInput = document.getElementById('dateInput');
        if (dateInput) {
            dateInput.value = '';
        }
        if (realDateInput) {
            realDateInput.value = '';
        }
    },
    
    // Отображение списка операций (обновлено с новым стилем)
    renderOperations() {
        const operationsContainer = document.querySelector('.history');
        if (!operationsContainer) return;
        
        // Находим активную категорию фильтра
        const activeFilter = document.querySelector('.history .categories__item.active');
        let filterType = 'all';
        if (activeFilter) {
            const filterText = activeFilter.textContent.toLowerCase();
            if (filterText === 'доходы') filterType = 'income';
            else if (filterText === 'расходы') filterType = 'expense';
        }
        
        // Фильтруем операции
        let filteredOperations = this.data.operations;
        if (filterType !== 'all') {
            filteredOperations = this.data.operations.filter(op => op.type === filterType);
        }
        
        // Сортируем по дате (новые сверху)
        filteredOperations.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Создаем HTML для операций
        let operationsHTML = `
            <div class="control-panel">
                <h2 class="control-panel__title">Список операций</h2>
                <div class="control-panel__categories categories">
                    <div class="categories__item ${filterType === 'all' ? 'active' : ''}">Все</div>
                    <div class="categories__item ${filterType === 'income' ? 'active' : ''}">Доходы</div>
                    <div class="categories__item ${filterType === 'expense' ? 'active' : ''}">Расходы</div>
                </div>
            </div>
        `;
        
        if (filteredOperations.length === 0) {
            operationsHTML += `
                <div class="list__no-data list__no-data--history">
                    <div class="list__no-data__description">
                        ${this.data.operations.length === 0 
                            ? 'Операций пока нет' 
                            : filterType === 'all' 
                                ? 'Нет операций' 
                                : filterType === 'income' 
                                    ? 'Нет доходов' 
                                    : 'Нет расходов'}
                    </div>
                    <div class="list__no-data__hint">
                        ${this.data.operations.length === 0 
                            ? 'Добавьте первую операцию в форме выше' 
                            : filterType === 'income' 
                                ? 'Переключитесь на "Все" или "Расходы"' 
                                : 'Переключитесь на "Все" или "Доходы"'}
                    </div>
                </div>
            `;
        } else {
            filteredOperations.forEach(operation => {
                const formattedDate = this.formatDate(operation.date);
                const amountClass = operation.type === 'income' ? 'operation__amount--income' : 'operation__amount--expense';
                const amountSign = operation.type === 'income' ? '+' : '-';
                
                operationsHTML += `
                    <div class="operation" data-id="${operation.id}">
                        <div class="operation__info">
                            <p class="operation__description">${operation.description}</p>
                            <p class="operation__date">${formattedDate}</p>
                        </div>
                        <p class="operation__amount ${amountClass}">${amountSign}${this.formatCurrency(operation.amount)} Р</p>
                    </div>
                `;
            });
        }
        
        operationsContainer.innerHTML = operationsHTML;
        this.setupFilterListeners();
    },
    
    // Форматирование даты
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },
    
    // Настройка обработчиков фильтров
    setupFilterListeners() {
        const filterItems = document.querySelectorAll('.history .categories__item');
        filterItems.forEach(item => {
            item.addEventListener('click', () => {
                // Убираем активный класс у всех
                filterItems.forEach(i => i.classList.remove('active'));
                // Добавляем активный класс текущему
                item.classList.add('active');
                // Перерисовываем операции
                this.renderOperations();
            });
        });
    },
    
    // Отображение ожидаемых доходов (обновлено с новым стилем)
    renderExpectedIncomes() {
        const expectedContainer = document.querySelector('.expected-content');
        if (!expectedContainer) return;
        
        // Определяем активную вкладку
        const activeTab = document.querySelector('.expected .categories__item.active');
        const statusFilter = activeTab ? activeTab.dataset.status : 'all';
        
        // Фильтруем ожидаемые доходы по статусу
        let filteredIncomes = this.data.expectedIncomes;
        if (statusFilter !== 'all') {
            filteredIncomes = this.data.expectedIncomes.filter(income => income.status === statusFilter);
        }
        
        // Сортируем по дате (ближайшие сверху)
        filteredIncomes.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (filteredIncomes.length === 0) {
            let message = 'Ожидаемых доходов пока нет';
            let hint = 'Добавьте ожидаемый доход в форме выше';
            
            if (statusFilter === 'pending') {
                message = 'Нет ожидаемых доходов';
                hint = 'Все доходы получены или отменены';
            } else if (statusFilter === 'received') {
                message = 'Нет полученных ожидаемых доходов';
                hint = 'Пока нет доходов, отмеченных как полученные';
            } else if (statusFilter === 'canceled') {
                message = 'Нет отмененных ожидаемых доходов';
                hint = 'Пока нет отмененных ожидаемых доходов';
            }
            
            expectedContainer.innerHTML = `
                <div class="list__no-data list__no-data--expected">
                    <div class="list__no-data__description">${message}</div>
                    <div class="list__no-data__hint">${hint}</div>
                </div>
            `;
            return;
        }
        
        let expectedHTML = '';
        
        filteredIncomes.forEach(income => {
            const formattedDate = this.formatDate(income.date);
            const probabilityClass = this.getProbabilityClass(income.probability);
            const categoryInfo = INCOME_CATEGORIES[income.category] || INCOME_CATEGORIES.other;
            
            expectedHTML += `
                <div class="expected-item ${income.status}" data-id="${income.id}">
                    <div class="expected-info">
                        <p class="expected-description">${income.description}</p>
                        <div class="expected-details">
                            <span class="expected-date">${formattedDate}</span>
                            ${income.client ? `<span class="expected-client">${income.client}</span>` : ''}
                            <span class="expected-category">${categoryInfo.name}</span>
                            <span class="expected-probability">
                                <div class="probability-indicator ${probabilityClass}"></div>
                                ${income.probability}%
                            </span>
                        </div>
                    </div>
                    <p class="expected-amount">${this.formatCurrency(income.amount)} Р</p>
                    <div class="expected-actions">
                        ${income.status === 'pending' ? `
                            <button class="expected-btn receive" title="Отметить как полученный">✓</button>
                            <button class="expected-btn cancel" title="Отменить ожидаемый доход">×</button>
                        ` : ''}
                        <button class="expected-btn delete" title="Удалить">🗑</button>
                    </div>
                </div>
            `;
        });
        
        expectedContainer.innerHTML = expectedHTML;
        this.setupExpectedListeners();
    },
    
    // Получение класса вероятности
    getProbabilityClass(probability) {
        if (probability >= 80) return 'high';
        if (probability >= 50) return 'medium';
        return 'low';
    },
    
    // Настройка обработчиков для ожидаемых доходов
    setupExpectedListeners() {
        // Кнопка "Получен"
        const receiveButtons = document.querySelectorAll('.expected-btn.receive');
        receiveButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const expectedItem = e.target.closest('.expected-item');
                const incomeId = parseInt(expectedItem.dataset.id);
                this.markExpectedAsReceived(incomeId);
            });
        });
        
        // Кнопка "Отменить"
        const cancelButtons = document.querySelectorAll('.expected-btn.cancel');
        cancelButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const expectedItem = e.target.closest('.expected-item');
                const incomeId = parseInt(expectedItem.dataset.id);
                this.cancelExpectedIncome(incomeId);
            });
        });
        
        // Кнопка "Удалить"
        const deleteButtons = document.querySelectorAll('.expected-btn.delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const expectedItem = e.target.closest('.expected-item');
                const incomeId = parseInt(expectedItem.dataset.id);
                this.deleteExpectedIncome(incomeId);
            });
        });
    },
    
    // Отметить ожидаемый доход как полученный
    markExpectedAsReceived(incomeId) {
        const incomeIndex = this.data.expectedIncomes.findIndex(income => income.id === incomeId);
        if (incomeIndex === -1) return;
        
        const income = this.data.expectedIncomes[incomeIndex];
        
        // Обновляем статус
        income.status = 'received';
        income.receivedDate = new Date().toISOString().split('T')[0];
        
        // Добавляем как фактический доход
        const newOperation = {
            id: Date.now(),
            type: 'income',
            amount: income.amount,
            description: income.description,
            date: income.receivedDate,
            createdAt: new Date().toISOString(),
            source: 'expected', // Помечаем, что пришло из ожидаемых
            originalExpectedId: incomeId
        };
        
        this.data.operations.push(newOperation);
        
        // Сохраняем и обновляем
        this.calculateTotals();
        this.renderTotals();
        this.renderOperations();
        this.renderExpectedIncomes();
        this.renderChart();
        this.saveToStorage();
        
        this.showNotification(`Доход "${income.description}" получен и добавлен в фактические доходы`);
    },
    
    // Отменить ожидаемый доход
    cancelExpectedIncome(incomeId) {
        const incomeIndex = this.data.expectedIncomes.findIndex(income => income.id === incomeId);
        if (incomeIndex === -1) return;
        
        const income = this.data.expectedIncomes[incomeIndex];
        
        if (confirm(`Отменить ожидаемый доход "${income.description}"?`)) {
            income.status = 'canceled';
            
            this.calculateTotals();
            this.renderTotals();
            this.renderExpectedIncomes();
            this.renderChart();
            this.saveToStorage();
            
            this.showNotification(`Ожидаемый доход "${income.description}" отменен`);
        }
    },
    
    // Удалить ожидаемый доход
    deleteExpectedIncome(incomeId) {
        const incomeIndex = this.data.expectedIncomes.findIndex(income => income.id === incomeId);
        if (incomeIndex === -1) return;
        
        const income = this.data.expectedIncomes[incomeIndex];
        
        if (confirm(`Удалить ${income.status === 'pending' ? 'ожидаемый' : income.status} доход "${income.description}"?`)) {
            this.data.expectedIncomes.splice(incomeIndex, 1);
            
            this.calculateTotals();
            this.renderTotals();
            this.renderExpectedIncomes();
            this.renderChart();
            this.saveToStorage();
            
            this.showNotification(`Доход "${income.description}" удален`);
        }
    },
    
    // Отображение плановых трат (обновлено с новым стилем)
    renderPlans() {
        const plansContainer = document.querySelector('.plans-content');
        if (!plansContainer) return;
        
        // Определяем активную вкладку
        const activeTab = document.querySelector('.plans .categories__item.active');
        const action = activeTab ? activeTab.dataset.action : 'show-list';
        
        if (action === 'show-list') {
            this.renderPlansList(plansContainer);
        } else if (action === 'add-new') {
            this.renderPlansForm(plansContainer);
        }
    },
    
    // Отображение списка планов (обновлено с новым стилем)
    renderPlansList(container) {
        const activePlans = this.data.plannedExpenses.filter(plan => !plan.completed);
        const completedPlans = this.data.plannedExpenses.filter(plan => plan.completed);
        const allPlans = [...activePlans, ...completedPlans];
        
        if (allPlans.length === 0) {
            container.innerHTML = `
                <div class="list__no-data list__no-data--plans">
                    <div class="list__no-data__description">Плановых трат пока нет</div>
                    <div class="list__no-data__hint">Добавьте плановую трату в форме выше</div>
                </div>
            `;
            return;
        }
        
        let plansHTML = `<div class="plans-list">`;
        
        allPlans.forEach(plan => {
            const formattedDate = this.formatDate(plan.date);
            const completedClass = plan.completed ? 'completed' : '';
            
            plansHTML += `
                <div class="plan-item ${completedClass}" data-id="${plan.id}">
                    <input type="checkbox" class="plan-checkbox" ${plan.completed ? 'checked' : ''}>
                    <div class="plan-info">
                        <p class="plan-description">${plan.description}</p>
                        <p class="plan-date">${formattedDate}</p>
                    </div>
                    <p class="plan-amount">${this.formatCurrency(plan.amount)} Р</p>
                    <button class="plan-delete" aria-label="Удалить плановую трату">×</button>
                </div>
            `;
        });
        
        plansHTML += `</div>`;
        container.innerHTML = plansHTML;
        this.setupPlanListeners();
    },
    
    // Отображение формы добавления плана (без изменений)
    renderPlansForm(container) {
        container.innerHTML = `
            <div class="plans-form">
                <div class="plan-form-inline">
                    <div class="form-row">
                        <input type="text" class="form-input" id="inlinePlanAmount" placeholder="Сумма" inputmode="decimal">
                        <div class="form-hint">Введите сумму в рублях</div>
                    </div>
                    
                    <div class="form-row">
                        <input type="text" class="form-input" id="inlinePlanDescription" placeholder="Описание" maxlength="100">
                        <div class="form-hint">Например: "Покупка ноутбука", "Оплата обучения"</div>
                    </div>
                    
                    <div class="form-row">
                        <input type="text" class="form-input date-input-inline" id="inlinePlanDate" placeholder="Планируемая дата" readonly>
                        <div class="form-hint">Нажмите на поле, чтобы выбрать дату</div>
                        <input type="date" id="realInlinePlanDate" class="visually-hidden">
                    </div>
                    
                    <div class="form-actions">
                        <button class="form-btn cancel" id="inlinePlanCancel">Отмена</button>
                        <button class="form-btn save" id="inlinePlanSave">Сохранить</button>
                    </div>
                </div>
            </div>
        `;
        
        this.setupInlinePlanListeners();
    },
    
    // Настройка обработчиков для планов (без изменений)
    setupPlanListeners() {
        const planCheckboxes = document.querySelectorAll('.plan-checkbox');
        planCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const planItem = e.target.closest('.plan-item');
                const planId = parseInt(planItem.dataset.id);
                this.togglePlanComplete(planId);
            });
        });
        
        const deleteButtons = document.querySelectorAll('.plan-delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const planItem = e.target.closest('.plan-item');
                const planId = parseInt(planItem.dataset.id);
                this.deletePlan(planId);
            });
        });
    },
    
    // Настройка обработчиков для встроенной формы планов (без изменений)
    setupInlinePlanListeners() {
        const inlinePlanAmount = document.getElementById('inlinePlanAmount');
        if (inlinePlanAmount) {
            inlinePlanAmount.addEventListener('input', (e) => {
                let value = e.target.value.replace(',', '.');
                value = value.replace(/[^0-9.]/g, '');
                
                const parts = value.split('.');
                if (parts.length > 2) {
                    value = parts[0] + '.' + parts.slice(1).join('');
                }
                
                if (parts.length === 2 && parts[1].length > 2) {
                    value = parts[0] + '.' + parts[1].substring(0, 2);
                }
                
                e.target.value = value;
            });
            
            inlinePlanAmount.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addInlinePlan();
                }
            });
        }
        
        const inlinePlanDescription = document.getElementById('inlinePlanDescription');
        if (inlinePlanDescription) {
            inlinePlanDescription.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addInlinePlan();
                }
            });
        }
        
        const inlinePlanDate = document.querySelector('.date-input-inline');
        if (inlinePlanDate) {
            inlinePlanDate.addEventListener('click', () => this.openInlinePlanCalendar());
        }
        
        const inlinePlanCancel = document.getElementById('inlinePlanCancel');
        if (inlinePlanCancel) {
            inlinePlanCancel.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToPlansList();
            });
        }
        
        const inlinePlanSave = document.getElementById('inlinePlanSave');
        if (inlinePlanSave) {
            inlinePlanSave.addEventListener('click', (e) => {
                e.preventDefault();
                this.addInlinePlan();
            });
        }
    },
    
    // Переключение состояния плана (без изменений)
    togglePlanComplete(planId) {
        const planIndex = this.data.plannedExpenses.findIndex(plan => plan.id === planId);
        if (planIndex !== -1) {
            const isCompleted = !this.data.plannedExpenses[planIndex].completed;
            this.data.plannedExpenses[planIndex].completed = isCompleted;
            this.saveToStorage();
            this.renderPlans();
            
            const plan = this.data.plannedExpenses[planIndex];
            const status = isCompleted ? 'выполнена' : 'не выполнена';
            this.showNotification(`Плановая трата "${plan.description}" отмечена как ${status}`);
        }
    },
    
    // Удаление плана (без изменений)
    deletePlan(planId) {
        const planIndex = this.data.plannedExpenses.findIndex(plan => plan.id === planId);
        if (planIndex === -1) return;
        
        const planDescription = this.data.plannedExpenses[planIndex].description;
        
        if (confirm(`Удалить плановую трату "${planDescription}"?`)) {
            this.data.plannedExpenses = this.data.plannedExpenses.filter(plan => plan.id !== planId);
            this.saveToStorage();
            this.renderPlans();
            
            this.showNotification(`Плановая трата "${planDescription}" удалена`);
        }
    },
    
    // Переключение на вкладку списка планов (без изменений)
    switchToPlansList() {
        const listTab = document.querySelector('.plans .categories__item[data-action="show-list"]');
        if (listTab) {
            document.querySelectorAll('.plans .categories__item').forEach(item => {
                item.classList.remove('active');
            });
            listTab.classList.add('active');
            this.renderPlans();
        }
    },
    
    // Добавление плана через встроенную форму (без изменений)
    addInlinePlan() {
        const inlinePlanAmount = document.getElementById('inlinePlanAmount');
        const inlinePlanDescription = document.getElementById('inlinePlanDescription');
        const realInlinePlanDate = document.getElementById('realInlinePlanDate');
        
        const amount = parseFloat(inlinePlanAmount.value.replace(',', '.'));
        const description = inlinePlanDescription.value.trim();
        const date = realInlinePlanDate.value;
        
        if (!amount || amount <= 0 || isNaN(amount)) {
            this.showNotification('Пожалуйста, введите корректную сумму', 'error');
            inlinePlanAmount.focus();
            return;
        }
        
        if (!description) {
            this.showNotification('Пожалуйста, введите описание', 'error');
            inlinePlanDescription.focus();
            return;
        }
        
        if (!date) {
            this.showNotification('Пожалуйста, выберите дату', 'error');
            document.getElementById('inlinePlanDate').focus();
            return;
        }
        
        const newPlan = {
            id: Date.now(),
            amount: parseFloat(amount.toFixed(2)),
            description: description,
            date: date,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.data.plannedExpenses.push(newPlan);
        this.saveToStorage();
        
        inlinePlanAmount.value = '';
        inlinePlanDescription.value = '';
        
        const inlinePlanDate = document.getElementById('inlinePlanDate');
        if (inlinePlanDate) {
            inlinePlanDate.value = '';
        }
        if (realInlinePlanDate) {
            realInlinePlanDate.value = '';
        }
        
        this.switchToPlansList();
        this.showNotification(`Плановая трата "${description}" успешно добавлена`);
    },
    
    // Инициализация графика
    initChart() {
        this.renderChart();
    },
    
    // Получение данных для графика (обновлено для прогноза)
    getChartData() {
        const activeTab = document.querySelector('.chart .categories__item.active');
        const chartType = activeTab ? activeTab.dataset.chartType : 'monthly';
        
        if (chartType === 'monthly') {
            return this.getMonthlyData();
        } else if (chartType === 'categories') {
            return this.getCategoryData();
        } else if (chartType === 'forecast') {
            return this.getForecastData();
        }
        
        return this.getMonthlyData();
    },
    
    // Получение данных по месяцам (обновлено для ожидаемых доходов)
    getMonthlyData() {
        const monthlyData = {};
        
        // Обрабатываем фактические операции
        this.data.operations.forEach(operation => {
            const date = new Date(operation.date);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('ru-RU', { 
                month: 'short',
                year: '2-digit'
            });
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    month: monthName,
                    income: 0,
                    expense: 0,
                    expected: 0
                };
            }
            
            if (operation.type === 'income') {
                monthlyData[monthKey].income += operation.amount;
            } else {
                monthlyData[monthKey].expense += operation.amount;
            }
        });
        
        // Добавляем ожидаемые доходы (для текущего и будущих месяцев)
        const currentDate = new Date();
        const currentMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
        
        this.data.expectedIncomes.forEach(income => {
            if (income.status === 'pending') {
                const date = new Date(income.date);
                const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                
                // Показываем ожидаемые только для текущего и будущих месяцев
                if (monthKey >= currentMonth) {
                    if (!monthlyData[monthKey]) {
                        const monthName = date.toLocaleDateString('ru-RU', { 
                            month: 'short',
                            year: '2-digit'
                        });
                        monthlyData[monthKey] = {
                            month: monthName,
                            income: 0,
                            expense: 0,
                            expected: 0
                        };
                    }
                    
                    monthlyData[monthKey].expected += income.amount;
                }
            }
        });
        
        // Преобразуем в массивы для графика
        const months = [];
        const incomes = [];
        const expenses = [];
        const expected = [];
        
        // Сортируем по месяцам
        Object.keys(monthlyData)
            .sort()
            .forEach(key => {
                const data = monthlyData[key];
                months.push(data.month);
                incomes.push(data.income);
                expenses.push(data.expense);
                expected.push(data.expected);
            });
        
        // Берем последние 6 месяцев
        const lastMonths = months.slice(-6);
        const lastIncomes = incomes.slice(-6);
        const lastExpenses = expenses.slice(-6);
        const lastExpected = expected.slice(-6);
        
        // Если данных нет, показываем пустой график
        if (lastMonths.length === 0) {
            return {
                labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
                datasets: [
                    {
                        label: 'Доходы',
                        data: [0, 0, 0, 0, 0, 0],
                        backgroundColor: CHART_COLORS.income + '80',
                        borderColor: CHART_COLORS.income,
                        borderWidth: 1,
                        borderRadius: 4,
                        barPercentage: 0.6
                    },
                    {
                        label: 'Расходы',
                        data: [0, 0, 0, 0, 0, 0],
                        backgroundColor: CHART_COLORS.expense + '80',
                        borderColor: CHART_COLORS.expense,
                        borderWidth: 1,
                        borderRadius: 4,
                        barPercentage: 0.6
                    }
                ]
            };
        }
        
        return {
            labels: lastMonths,
            datasets: [
                {
                    label: 'Доходы',
                    data: lastIncomes,
                    backgroundColor: CHART_COLORS.income,
                    borderColor: CHART_COLORS.income,
                    borderWidth: 2,
                    borderRadius: 4,
                    barPercentage: 0.6
                },
                {
                    label: 'Расходы',
                    data: lastExpenses,
                    backgroundColor: CHART_COLORS.expense,
                    borderColor: CHART_COLORS.expense,
                    borderWidth: 2,
                    borderRadius: 4,
                    barPercentage: 0.6
                },
                {
                    label: 'Ожидаемые',
                    data: lastExpected,
                    backgroundColor: CHART_COLORS.expected,
                    borderColor: CHART_COLORS.expected,
                    borderWidth: 2,
                    borderRadius: 4,
                    barPercentage: 0.6,
                    hidden: lastExpected.every(val => val === 0) // Скрываем если все нули
                }
            ]
        };
    },
    
    // Получение данных по категориям (без изменений)
    getCategoryData() {
        const categoryData = {};
        
        this.data.operations.forEach(operation => {
            const category = operation.description;
            const type = operation.type;
            
            if (!categoryData[category]) {
                categoryData[category] = {
                    income: 0,
                    expense: 0,
                    total: 0
                };
            }
            
            if (type === 'income') {
                categoryData[category].income += operation.amount;
            } else {
                categoryData[category].expense += operation.amount;
            }
            
            categoryData[category].total = categoryData[category].income + categoryData[category].expense;
        });
        
        const categories = Object.entries(categoryData)
            .map(([name, data]) => ({
                name,
                total: data.total,
                color: data.income > data.expense ? CHART_COLORS.income : CHART_COLORS.expense
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 8);
        
        if (categories.length === 0) {
            return {
                labels: ['Нет данных'],
                datasets: [{
                    label: 'Данных пока нет',
                    data: [1],
                    backgroundColor: CHART_COLORS.text,
                    borderColor: CHART_COLORS.text,
                    borderWidth: 1,
                    borderRadius: 4
                }]
            };
        }
        
        const labels = categories.map(item => 
            item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name
        );
        
        const data = categories.map(item => item.total);
        const colors = categories.map(item => item.color);
        
        return {
            labels,
            datasets: [{
                label: 'Сумма по категориям',
                data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 2,
                borderRadius: 4
            }]
        };
    },
    
    // Получение данных для прогноза
    getForecastData() {
        // Собираем данные по месяцам (фактические + ожидаемые)
        const forecastData = {};
        const currentDate = new Date();
        
        // Добавляем фактические данные за последние 3 месяца
        for (let i = 2; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('ru-RU', { 
                month: 'short',
                year: '2-digit'
            });
            
            forecastData[monthKey] = {
                month: monthName,
                actual: 0,
                forecast: 0
            };
        }
        
        // Добавляем фактические доходы
        this.data.operations.forEach(operation => {
            if (operation.type === 'income') {
                const date = new Date(operation.date);
                const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                
                if (forecastData[monthKey]) {
                    forecastData[monthKey].actual += operation.amount;
                }
            }
        });
        
        // Добавляем прогноз на текущий месяц (фактические + ожидаемые)
        const currentMonthKey = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
        if (forecastData[currentMonthKey]) {
            forecastData[currentMonthKey].forecast = forecastData[currentMonthKey].actual;
            
            // Добавляем ожидаемые доходы для текущего месяца
            this.data.expectedIncomes.forEach(income => {
                if (income.status === 'pending') {
                    const date = new Date(income.date);
                    const incomeMonthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                    
                    if (incomeMonthKey === currentMonthKey) {
                        forecastData[currentMonthKey].forecast += income.amount * (income.probability / 100);
                    }
                }
            });
        }
        
        // Прогноз на следующий месяц (среднее + ожидаемые)
        const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        const nextMonthKey = `${nextMonth.getFullYear()}-${(nextMonth.getMonth() + 1).toString().padStart(2, '0')}`;
        const nextMonthName = nextMonth.toLocaleDateString('ru-RU', { 
            month: 'short',
            year: '2-digit'
        });
        
        // Рассчитываем средний доход за последние 3 месяца
        let totalActual = 0;
        let monthCount = 0;
        Object.values(forecastData).forEach(data => {
            totalActual += data.actual;
            monthCount++;
        });
        const averageIncome = monthCount > 0 ? totalActual / monthCount : 0;
        
        forecastData[nextMonthKey] = {
            month: nextMonthName,
            actual: 0,
            forecast: averageIncome
        };
        
        // Добавляем ожидаемые доходы на следующий месяц
        this.data.expectedIncomes.forEach(income => {
            if (income.status === 'pending') {
                const date = new Date(income.date);
                const incomeMonthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                
                if (incomeMonthKey === nextMonthKey) {
                    forecastData[nextMonthKey].forecast += income.amount * (income.probability / 100);
                }
            }
        });
        
        // Преобразуем в массивы
        const months = [];
        const actuals = [];
        const forecasts = [];
        
        Object.keys(forecastData)
            .sort()
            .forEach(key => {
                const data = forecastData[key];
                months.push(data.month);
                actuals.push(data.actual);
                forecasts.push(data.forecast);
            });
        
        return {
            labels: months,
            datasets: [
                {
                    label: 'Фактические доходы',
                    data: actuals,
                    backgroundColor: CHART_COLORS.income + '80',
                    borderColor: CHART_COLORS.income,
                    borderWidth: 2,
                    borderRadius: 4,
                    barPercentage: 0.6
                },
                {
                    label: 'Прогноз доходов',
                    data: forecasts,
                    backgroundColor: CHART_COLORS.expected + '80',
                    borderColor: CHART_COLORS.expected,
                    borderWidth: 2,
                    borderRadius: 4,
                    barPercentage: 0.6
                }
            ]
        };
    },
    
    // Рендеринг графика (обновлено)
    renderChart() {
        const canvas = document.getElementById('budgetChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        const chartData = this.getChartData();
        const activeTab = document.querySelector('.chart .categories__item.active');
        const chartType = activeTab ? activeTab.dataset.chartType : 'monthly';
        
        const isMonthlyChart = chartType === 'monthly';
        const isForecastChart = chartType === 'forecast';
        
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: isMonthlyChart || isForecastChart,
                        position: 'top',
                        labels: {
                            color: CHART_COLORS.text,
                            font: {
                                family: "'Inter', sans-serif",
                                size: 12
                            },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#2A2A2A',
                        titleColor: '#FFFFFF',
                        bodyColor: '#FFFFFF',
                        borderColor: CHART_COLORS.grid,
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                const value = context.parsed.y;
                                label += new Intl.NumberFormat('ru-RU', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }).format(value) + ' Р';
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: CHART_COLORS.grid,
                            drawBorder: false,
                            display: true
                        },
                        ticks: {
                            color: CHART_COLORS.text,
                            font: {
                                family: "'Inter', sans-serif",
                                size: 11
                            },
                            maxRotation: isMonthlyChart || isForecastChart ? 0 : 45
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: CHART_COLORS.grid,
                            drawBorder: false
                        },
                        ticks: {
                            color: CHART_COLORS.text,
                            font: {
                                family: "'Inter', sans-serif",
                                size: 11
                            },
                            callback: function(value) {
                                if (value >= 10000) {
                                    return (value / 1000).toFixed(0) + 'k';
                                }
                                return value;
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
        
        this.updateChartStats();
    },
    
    // Обновление статистики под графиком (обновлено)
    updateChartStats() {
        if (this.data.operations.length === 0 && this.data.expectedIncomes.length === 0) {
            this.updateEmptyStats();
            return;
        }
        
        const incomeElements = this.data.operations.filter(op => op.type === 'income');
        const expenseElements = this.data.operations.filter(op => op.type === 'expense');
        const expectedElements = this.data.expectedIncomes.filter(inc => inc.status === 'pending');
        
        // Средний доход
        const avgIncome = incomeElements.length > 0 
            ? incomeElements.reduce((sum, op) => sum + op.amount, 0) / incomeElements.length
            : 0;
        
        // Средний расход
        const avgExpense = expenseElements.length > 0
            ? expenseElements.reduce((sum, op) => sum + op.amount, 0) / expenseElements.length
            : 0;
        
        // Средний ожидаемый доход (с учетом вероятности)
        const avgExpected = expectedElements.length > 0
            ? expectedElements.reduce((sum, inc) => sum + (inc.amount * inc.probability / 100), 0) / expectedElements.length
            : 0;
        
        // Общий баланс
        const totalBalance = this.data.balance || 0;
        
        // Обновляем DOM
        const avgIncomeElement = document.querySelector('.chart-stat__value.income');
        const avgExpenseElement = document.querySelector('.chart-stat__value.expense');
        const totalBalanceElement = document.querySelector('.chart-stat__value.balance');
        const avgExpectedElement = document.querySelector('.chart-stat__value.expected');
        
        if (avgIncomeElement) {
            avgIncomeElement.textContent = `${this.formatCurrency(avgIncome)} Р`;
        }
        
        if (avgExpenseElement) {
            avgExpenseElement.textContent = `${this.formatCurrency(avgExpense)} Р`;
        }
        
        if (avgExpectedElement) {
            avgExpectedElement.textContent = `${this.formatCurrency(avgExpected)} Р`;
        }
        
        if (totalBalanceElement) {
            totalBalanceElement.textContent = `${totalBalance > 0 ? '+' : ''}${this.formatCurrency(totalBalance)} Р`;
            totalBalanceElement.style.color = totalBalance > 0 ? CHART_COLORS.income : 
                                             totalBalance < 0 ? CHART_COLORS.expense : 
                                             '#FFFFFF';
        }
    },
    
    // Обновление статистики при отсутствии данных
    updateEmptyStats() {
        const avgIncomeElement = document.querySelector('.chart-stat__value.income');
        const avgExpenseElement = document.querySelector('.chart-stat__value.expense');
        const totalBalanceElement = document.querySelector('.chart-stat__value.balance');
        const avgExpectedElement = document.querySelector('.chart-stat__value.expected');
        
        if (avgIncomeElement) avgIncomeElement.textContent = '0,00 Р';
        if (avgExpenseElement) avgExpenseElement.textContent = '0,00 Р';
        if (avgExpectedElement) avgExpectedElement.textContent = '0,00 Р';
        if (totalBalanceElement) {
            totalBalanceElement.textContent = '0,00 Р';
            totalBalanceElement.style.color = '#FFFFFF';
        }
    },
    
    // Инициализация календаря (без изменений)
    initCalendar() {
        this.currentSelectedDate = new Date();
        this.renderCalendar();
    },
    
    // Открытие календаря (без изменений)
    openCalendar() {
        const calendarModal = document.getElementById('calendarModal');
        if (calendarModal) {
            calendarModal.classList.add('active');
            this.currentSelectedDate = new Date();
            this.renderCalendar();
            document.body.style.overflow = 'hidden';
        }
    },
    
    // Открытие календаря для встроенной формы (без изменений)
    openInlinePlanCalendar() {
        const inlinePlanDate = document.getElementById('inlinePlanDate');
        const realInlinePlanDate = document.getElementById('realInlinePlanDate');
        
        this.currentPlanDateInput = inlinePlanDate;
        this.currentRealPlanDateInput = realInlinePlanDate;
        
        this.openCalendar();
    },
    
    // Закрытие календаря (без изменений)
    closeCalendar() {
        const calendarModal = document.getElementById('calendarModal');
        if (calendarModal) {
            calendarModal.classList.remove('active');
            document.body.style.overflow = '';
            
            this.currentPlanDateInput = null;
            this.currentRealPlanDateInput = null;
        }
    },
    
    // Рендеринг календаря (без изменений)
    renderCalendar() {
        const calendarDays = document.getElementById('calendarDays');
        const calendarTitle = document.getElementById('calendarTitle');
        
        if (!calendarDays || !calendarTitle) return;
        
        const year = this.currentSelectedDate.getFullYear();
        const month = this.currentSelectedDate.getMonth();
        
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        calendarTitle.textContent = `${monthNames[month]} ${year}`;
        
        calendarDays.innerHTML = '';
        
        const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        dayNames.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day-name';
            dayElement.textContent = day;
            calendarDays.appendChild(dayElement);
        });
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        let startDay = firstDay.getDay();
        if (startDay === 0) startDay = 7;
        startDay -= 1;
        
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDay - 1; i >= 0; i--) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = prevMonthLastDay - i;
            calendarDays.appendChild(dayElement);
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let currentDateValue = null;
        if (this.currentPlanDateInput && this.currentRealPlanDateInput) {
            currentDateValue = this.currentRealPlanDateInput.value;
        } else {
            const realDateInput = document.getElementById('realDateInput');
            currentDateValue = realDateInput ? realDateInput.value : null;
        }
        
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayDate = new Date(year, month, day);
            dayDate.setHours(0, 0, 0, 0);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            dayElement.dataset.date = dayDate.toISOString().split('T')[0];
            dayElement.setAttribute('role', 'button');
            dayElement.setAttribute('tabindex', '0');
            
            if (dayDate.getTime() === today.getTime()) {
                dayElement.classList.add('today');
            }
            
            if (currentDateValue) {
                const selectedDate = new Date(currentDateValue);
                selectedDate.setHours(0, 0, 0, 0);
                
                if (dayDate.getTime() === selectedDate.getTime()) {
                    dayElement.classList.add('selected');
                }
            }
            
            dayElement.addEventListener('click', () => this.selectDate(dayDate));
            
            dayElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.selectDate(dayDate);
                }
            });
            
            calendarDays.appendChild(dayElement);
        }
    },
    
    // Выбор даты (без изменений)
    selectDate(date) {
        const formattedDate = date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        if (this.currentPlanDateInput && this.currentRealPlanDateInput) {
            this.currentPlanDateInput.value = formattedDate;
            this.currentRealPlanDateInput.value = date.toISOString().split('T')[0];
        } else {
            const dateInput = document.getElementById('dateInput');
            const realDateInput = document.getElementById('realDateInput');
            
            if (dateInput) {
                dateInput.value = formattedDate;
            }
            if (realDateInput) {
                realDateInput.value = date.toISOString().split('T')[0];
            }
        }
        
        this.closeCalendar();
    },
    
    // Переключение месяца (без изменений)
    changeMonth(direction) {
        const newDate = new Date(this.currentSelectedDate);
        newDate.setMonth(newDate.getMonth() + direction);
        this.currentSelectedDate = newDate;
        this.renderCalendar();
    },
    
    // Установить сегодняшнюю дату (без изменений)
    setToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.selectDate(today);
        this.currentSelectedDate = today;
        this.renderCalendar();
    },
    
    // Очистить дату (без изменений)
    clearDate() {
        if (this.currentPlanDateInput && this.currentRealPlanDateInput) {
            this.currentPlanDateInput.value = '';
            this.currentRealPlanDateInput.value = '';
        } else {
            const dateInput = document.getElementById('dateInput');
            const realDateInput = document.getElementById('realDateInput');
            
            if (dateInput) {
                dateInput.value = '';
            }
            if (realDateInput) {
                realDateInput.value = '';
            }
        }
        
        this.closeCalendar();
    }
};

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    budgetApp.init();
    
    window.addEventListener('storage', (e) => {
        if (e.key === 'budgetOperations' || e.key === 'budgetPlannedExpenses' || e.key === 'budgetExpectedIncomes') {
            budgetApp.data.operations = JSON.parse(localStorage.getItem('budgetOperations')) || [];
            budgetApp.data.plannedExpenses = JSON.parse(localStorage.getItem('budgetPlannedExpenses')) || [];
            budgetApp.data.expectedIncomes = JSON.parse(localStorage.getItem('budgetExpectedIncomes')) || [];
            budgetApp.calculateTotals();
            budgetApp.renderTotals();
            budgetApp.renderOperations();
            budgetApp.renderPlans();
            budgetApp.renderExpectedIncomes();
            budgetApp.renderChart();
        }
    });
});

// Сохраняем данные перед закрытием страницы
window.addEventListener('beforeunload', () => {
    budgetApp.saveToStorage();
});