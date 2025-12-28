// Константы цветов для графика
const CHART_COLORS = {
    income: '#4CAF50',
    expense: '#FF7653',
    balance: '#FFFFFF',
    grid: '#3B3B3B',
    text: '#8A8A8A',
    background: '#272727'
};

// Структура данных приложения
const budgetApp = {
    // Данные приложения
    data: {
        operations: JSON.parse(localStorage.getItem('budgetOperations')) || [],
        plannedExpenses: JSON.parse(localStorage.getItem('budgetPlannedExpenses')) || [],
        incomeTotal: 0,
        expensesTotal: 0,
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
        this.setupEventListeners();
        this.initCalendar();
        this.initChart();
        console.log('Budget app initialized');
    },
    
    // Расчет итоговых сумм
    calculateTotals() {
        this.data.incomeTotal = 0;
        this.data.expensesTotal = 0;
        
        this.data.operations.forEach(operation => {
            if (operation.type === 'income') {
                this.data.incomeTotal += operation.amount;
            } else if (operation.type === 'expense') {
                this.data.expensesTotal += operation.amount;
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
        const balanceContainer = document.querySelector('.header__balance');
        
        if (incomeElement) {
            incomeElement.textContent = `${this.formatCurrency(this.data.incomeTotal)} Р`;
        }
        
        if (expensesElement) {
            expensesElement.textContent = `${this.formatCurrency(this.data.expensesTotal)} Р`;
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
            });
        });
        
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
        
        // Обработчики для календаря
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
        
        // Обработчики для вкладок планов
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
    },
    
    // Очистка всех данных
    clearAllData() {
        if (this.data.operations.length === 0 && this.data.plannedExpenses.length === 0) {
            this.showNotification('Нет данных для очистки', 'error');
            return;
        }
        
        if (confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
            this.data.operations = [];
            this.data.plannedExpenses = [];
            this.calculateTotals();
            this.renderTotals();
            this.renderOperations();
            this.renderPlans();
            this.renderChart(); // Обновляем график
            this.saveToStorage();
            
            // Показываем уведомление
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
    
    // Добавление новой операции
    addOperation() {
        // Получаем выбранный тип операции
        const activeCategory = document.querySelector('.add .categories__item.active');
        if (!activeCategory) return;
        
        const operationType = activeCategory.textContent.toLowerCase();
        
        // Проверяем, что это не "Планы"
        if (operationType === 'планы') {
            // Переключаемся на вкладку "Добавить" в планах
            const addTab = document.querySelector('.plans .categories__item[data-action="add-new"]');
            if (addTab) {
                const planTabs = document.querySelectorAll('.plans .categories__item');
                planTabs.forEach(item => item.classList.remove('active'));
                addTab.classList.add('active');
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
        
        // Создаем новую операцию
        const newOperation = {
            id: Date.now(),
            type: operationType === 'доходы' ? 'income' : 'expense',
            amount: parseFloat(amount.toFixed(2)),
            description: description,
            date: date,
            createdAt: new Date().toISOString()
        };
        
        // Добавляем в данные
        this.data.operations.push(newOperation);
        
        // Обновляем расчеты
        this.calculateTotals();
        this.renderTotals();
        
        // Сохраняем в localStorage
        this.saveToStorage();
        
        // Перерисовываем список операций
        this.renderOperations();
        
        // Обновляем график
        this.renderChart();
        
        // Очищаем форму
        amountInput.value = '';
        descriptionInput.value = '';
        
        // Очищаем дату
        const dateInput = document.getElementById('dateInput');
        if (dateInput) {
            dateInput.value = '';
        }
        if (realDateInput) {
            realDateInput.value = '';
        }
        
        // Показываем уведомление
        const operationTypeText = operationType === 'доходы' ? 'доход' : 'расход';
        this.showNotification(`${operationTypeText} "${description}" успешно добавлен`);
        
        console.log('Добавлена новая операция:', newOperation);
    },
    
    // Отображение списка операций
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
        if (filteredOperations.length === 0) {
            operationsContainer.innerHTML = `
                <div class="control-panel">
                    <h2 class="control-panel__title">Список операций</h2>
                    <div class="control-panel__categories categories">
                        <div class="categories__item active">Все</div>
                        <div class="categories__item">Доходы</div>
                        <div class="categories__item">Расходы</div>
                    </div>
                </div>
                <div class="list__no-history">Операций пока нет</div>
            `;
            this.setupFilterListeners();
            return;
        }
        
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
    
    // Отображение плановых трат
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
    
    // Отображение списка планов
    renderPlansList(container) {
        // Фильтруем невыполненные планы (выполненные в конце)
        const activePlans = this.data.plannedExpenses.filter(plan => !plan.completed);
        const completedPlans = this.data.plannedExpenses.filter(plan => plan.completed);
        const allPlans = [...activePlans, ...completedPlans];
        
        if (allPlans.length === 0) {
            container.innerHTML = `
                <div class="plans-list">
                    <div class="no-plans">Плановых трат пока нет</div>
                </div>
            `;
            return;
        }
        
        let plansHTML = `
            <div class="plans-list">
        `;
        
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
    
    // Отображение формы добавления плана
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
    
    // Настройка обработчиков для планов
    setupPlanListeners() {
        // Чекбоксы планов
        const planCheckboxes = document.querySelectorAll('.plan-checkbox');
        planCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const planItem = e.target.closest('.plan-item');
                const planId = parseInt(planItem.dataset.id);
                this.togglePlanComplete(planId);
            });
        });
        
        // Кнопки удаления планов
        const deleteButtons = document.querySelectorAll('.plan-delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const planItem = e.target.closest('.plan-item');
                const planId = parseInt(planItem.dataset.id);
                this.deletePlan(planId);
            });
        });
    },
    
    // Настройка обработчиков для встроенной формы
    setupInlinePlanListeners() {
        // Валидация суммы при вводе
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
            
            // Обработчик клавиши Enter
            inlinePlanAmount.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addInlinePlan();
                }
            });
        }
        
        // Обработчик клавиши Enter в описании
        const inlinePlanDescription = document.getElementById('inlinePlanDescription');
        if (inlinePlanDescription) {
            inlinePlanDescription.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addInlinePlan();
                }
            });
        }
        
        // Обработчик для поля даты
        const inlinePlanDate = document.querySelector('.date-input-inline');
        if (inlinePlanDate) {
            inlinePlanDate.addEventListener('click', () => this.openInlinePlanCalendar());
        }
        
        // Обработчик кнопки отмены
        const inlinePlanCancel = document.getElementById('inlinePlanCancel');
        if (inlinePlanCancel) {
            inlinePlanCancel.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToPlansList();
            });
        }
        
        // Обработчик кнопки сохранения
        const inlinePlanSave = document.getElementById('inlinePlanSave');
        if (inlinePlanSave) {
            inlinePlanSave.addEventListener('click', (e) => {
                e.preventDefault();
                this.addInlinePlan();
            });
        }
    },
    
    // Переключение состояния плана (выполнено/не выполнено)
    togglePlanComplete(planId) {
        const planIndex = this.data.plannedExpenses.findIndex(plan => plan.id === planId);
        if (planIndex !== -1) {
            const isCompleted = !this.data.plannedExpenses[planIndex].completed;
            this.data.plannedExpenses[planIndex].completed = isCompleted;
            this.saveToStorage();
            this.renderPlans();
            
            // Показываем уведомление
            const plan = this.data.plannedExpenses[planIndex];
            const status = isCompleted ? 'выполнена' : 'не выполнена';
            this.showNotification(`Плановая трата "${plan.description}" отмечена как ${status}`);
        }
    },
    
    // Удаление плана
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
    
    // Переключение на вкладку списка
    switchToPlansList() {
        const listTab = document.querySelector('.plans .categories__item[data-action="show-list"]');
        if (listTab) {
            // Убираем активный класс у всех
            document.querySelectorAll('.plans .categories__item').forEach(item => {
                item.classList.remove('active');
            });
            // Добавляем активный класс вкладке "Список"
            listTab.classList.add('active');
            // Перерисовываем планы
            this.renderPlans();
        }
    },
    
    // Добавление плана через встроенную форму
    addInlinePlan() {
        const inlinePlanAmount = document.getElementById('inlinePlanAmount');
        const inlinePlanDescription = document.getElementById('inlinePlanDescription');
        const realInlinePlanDate = document.getElementById('realInlinePlanDate');
        
        // Валидация
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
        
        // Создаем новый план
        const newPlan = {
            id: Date.now(),
            amount: parseFloat(amount.toFixed(2)),
            description: description,
            date: date,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        // Добавляем в данные
        this.data.plannedExpenses.push(newPlan);
        
        // Сохраняем в localStorage
        this.saveToStorage();
        
        // Очищаем форму
        inlinePlanAmount.value = '';
        inlinePlanDescription.value = '';
        
        const inlinePlanDate = document.getElementById('inlinePlanDate');
        if (inlinePlanDate) {
            inlinePlanDate.value = '';
        }
        if (realInlinePlanDate) {
            realInlinePlanDate.value = '';
        }
        
        // Переключаемся на вкладку списка
        this.switchToPlansList();
        
        // Показываем уведомление
        this.showNotification(`Плановая трата "${description}" успешно добавлена`);
        
        console.log('Добавлена новая плановая трата:', newPlan);
    },
    
    // Инициализация графика
    initChart() {
        this.renderChart();
    },
    
    // Получение данных для графика
    getChartData() {
        const activeTab = document.querySelector('.chart .categories__item.active');
        const chartType = activeTab ? activeTab.dataset.chartType : 'monthly';
        
        if (chartType === 'monthly') {
            return this.getMonthlyData();
        } else {
            return this.getCategoryData();
        }
    },
    
    // Получение данных по месяцам
    getMonthlyData() {
        // Группируем операции по месяцам
        const monthlyData = {};
        
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
                    expense: 0
                };
            }
            
            if (operation.type === 'income') {
                monthlyData[monthKey].income += operation.amount;
            } else {
                monthlyData[monthKey].expense += operation.amount;
            }
        });
        
        // Преобразуем в массивы для графика
        const months = [];
        const incomes = [];
        const expenses = [];
        
        // Сортируем по месяцам
        Object.keys(monthlyData)
            .sort()
            .forEach(key => {
                const data = monthlyData[key];
                months.push(data.month);
                incomes.push(data.income);
                expenses.push(data.expense);
            });
        
        // Берем последние 6 месяцев или все, если меньше
        const lastMonths = months.slice(-6);
        const lastIncomes = incomes.slice(-6);
        const lastExpenses = expenses.slice(-6);
        
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
                }
            ]
        };
    },
    
    // Получение данных по категориям
    getCategoryData() {
        // Группируем по описаниям (категориям)
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
        
        // Преобразуем в массив и сортируем по общей сумме
        const categories = Object.entries(categoryData)
            .map(([name, data]) => ({
                name,
                total: data.total,
                color: data.income > data.expense ? CHART_COLORS.income : CHART_COLORS.expense
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 8); // Берем топ-8 категорий
        
        // Если данных нет, показываем пустой график
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
    
    // Рендеринг графика
    renderChart() {
        const canvas = document.getElementById('budgetChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Очищаем предыдущий график
        if (this.chart) {
            this.chart.destroy();
        }
        
        const chartData = this.getChartData();
        const activeTab = document.querySelector('.chart .categories__item.active');
        const chartType = activeTab ? activeTab.dataset.chartType : 'monthly';
        
        // Определяем тип графика
        const isMonthlyChart = chartType === 'monthly';
        
        // Создаем новый график
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: isMonthlyChart,
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
                            maxRotation: isMonthlyChart ? 0 : 45
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
        
        // Обновляем статистику
        this.updateChartStats();
    },
    
    // Обновление статистики под графиком
    updateChartStats() {
        if (this.data.operations.length === 0) {
            this.updateEmptyStats();
            return;
        }
        
        const incomeElements = this.data.operations.filter(op => op.type === 'income');
        const expenseElements = this.data.operations.filter(op => op.type === 'expense');
        
        // Средний доход
        const avgIncome = incomeElements.length > 0 
            ? incomeElements.reduce((sum, op) => sum + op.amount, 0) / incomeElements.length
            : 0;
        
        // Средний расход
        const avgExpense = expenseElements.length > 0
            ? expenseElements.reduce((sum, op) => sum + op.amount, 0) / expenseElements.length
            : 0;
        
        // Общий баланс
        const totalBalance = this.data.balance || 0;
        
        // Обновляем DOM
        const avgIncomeElement = document.querySelector('.chart-stat__value.income');
        const avgExpenseElement = document.querySelector('.chart-stat__value.expense');
        const totalBalanceElement = document.querySelector('.chart-stat__value.balance');
        
        if (avgIncomeElement) {
            avgIncomeElement.textContent = `${this.formatCurrency(avgIncome)} Р`;
        }
        
        if (avgExpenseElement) {
            avgExpenseElement.textContent = `${this.formatCurrency(avgExpense)} Р`;
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
        
        if (avgIncomeElement) avgIncomeElement.textContent = '0,00 Р';
        if (avgExpenseElement) avgExpenseElement.textContent = '0,00 Р';
        if (totalBalanceElement) {
            totalBalanceElement.textContent = '0,00 Р';
            totalBalanceElement.style.color = '#FFFFFF';
        }
    },
    
    // Инициализация календаря
    initCalendar() {
        this.currentSelectedDate = new Date();
        this.renderCalendar();
    },
    
    // Открытие календаря
    openCalendar() {
        const calendarModal = document.getElementById('calendarModal');
        if (calendarModal) {
            calendarModal.classList.add('active');
            // Обновляем календарь на текущий месяц
            this.currentSelectedDate = new Date();
            this.renderCalendar();
            // Блокируем скролл страницы
            document.body.style.overflow = 'hidden';
        }
    },
    
    // Открытие календаря для встроенной формы
    openInlinePlanCalendar() {
        const inlinePlanDate = document.getElementById('inlinePlanDate');
        const realInlinePlanDate = document.getElementById('realInlinePlanDate');
        
        // Сохраняем ссылки на элементы
        this.currentPlanDateInput = inlinePlanDate;
        this.currentRealPlanDateInput = realInlinePlanDate;
        
        // Открываем календарь
        this.openCalendar();
    },
    
    // Закрытие календаря
    closeCalendar() {
        const calendarModal = document.getElementById('calendarModal');
        if (calendarModal) {
            calendarModal.classList.remove('active');
            // Разблокируем скролл страницы
            document.body.style.overflow = '';
            
            // Очищаем ссылки на элементы формы
            this.currentPlanDateInput = null;
            this.currentRealPlanDateInput = null;
        }
    },
    
    // Рендеринг календаря
    renderCalendar() {
        const calendarDays = document.getElementById('calendarDays');
        const calendarTitle = document.getElementById('calendarTitle');
        
        if (!calendarDays || !calendarTitle) return;
        
        const year = this.currentSelectedDate.getFullYear();
        const month = this.currentSelectedDate.getMonth();
        
        // Устанавливаем заголовок
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        calendarTitle.textContent = `${monthNames[month]} ${year}`;
        
        // Очищаем дни
        calendarDays.innerHTML = '';
        
        // Добавляем названия дней недели
        const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        dayNames.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day-name';
            dayElement.textContent = day;
            calendarDays.appendChild(dayElement);
        });
        
        // Получаем первый день месяца
        const firstDay = new Date(year, month, 1);
        // Получаем последний день месяца
        const lastDay = new Date(year, month + 1, 0);
        // Начинаем с понедельника
        let startDay = firstDay.getDay();
        if (startDay === 0) startDay = 7; // Воскресенье становится 7
        startDay -= 1; // Приводим к 0-6, где 0 - понедельник
        
        // Добавляем пустые дни для начала месяца
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDay - 1; i >= 0; i--) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = prevMonthLastDay - i;
            calendarDays.appendChild(dayElement);
        }
        
        // Добавляем дни месяца
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Определяем, для какой формы проверяем выбранную дату
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
            
            // Проверяем, сегодня ли это
            if (dayDate.getTime() === today.getTime()) {
                dayElement.classList.add('today');
            }
            
            // Проверяем, выбрана ли эта дата
            if (currentDateValue) {
                const selectedDate = new Date(currentDateValue);
                selectedDate.setHours(0, 0, 0, 0);
                
                if (dayDate.getTime() === selectedDate.getTime()) {
                    dayElement.classList.add('selected');
                }
            }
            
            // Обработчик клика
            dayElement.addEventListener('click', () => this.selectDate(dayDate));
            
            // Обработчик клавиши Enter
            dayElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.selectDate(dayDate);
                }
            });
            
            calendarDays.appendChild(dayElement);
        }
    },
    
    // Выбор даты
    selectDate(date) {
        const formattedDate = date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        // Проверяем, для какой формы выбираем дату
        if (this.currentPlanDateInput && this.currentRealPlanDateInput) {
            // Для встроенной формы плана
            this.currentPlanDateInput.value = formattedDate;
            this.currentRealPlanDateInput.value = date.toISOString().split('T')[0];
        } else {
            // Для основной формы
            const dateInput = document.getElementById('dateInput');
            const realDateInput = document.getElementById('realDateInput');
            
            if (dateInput) {
                dateInput.value = formattedDate;
            }
            if (realDateInput) {
                realDateInput.value = date.toISOString().split('T')[0];
            }
        }
        
        // Закрываем календарь
        this.closeCalendar();
    },
    
    // Переключение месяца
    changeMonth(direction) {
        const newDate = new Date(this.currentSelectedDate);
        newDate.setMonth(newDate.getMonth() + direction);
        this.currentSelectedDate = newDate;
        this.renderCalendar();
    },
    
    // Установить сегодняшнюю дату
    setToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.selectDate(today);
        this.currentSelectedDate = today;
        this.renderCalendar();
    },
    
    // Очистить дату
    clearDate() {
        // Определяем, для какой формы очищаем
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
    
    // Загружаем данные из localStorage при загрузке
    window.addEventListener('storage', (e) => {
        if (e.key === 'budgetOperations' || e.key === 'budgetPlannedExpenses') {
            budgetApp.data.operations = JSON.parse(localStorage.getItem('budgetOperations')) || [];
            budgetApp.data.plannedExpenses = JSON.parse(localStorage.getItem('budgetPlannedExpenses')) || [];
            budgetApp.calculateTotals();
            budgetApp.renderTotals();
            budgetApp.renderOperations();
            budgetApp.renderPlans();
            budgetApp.renderChart();
        }
    });
});

// Сохраняем данные перед закрытием страницы
window.addEventListener('beforeunload', () => {
    budgetApp.saveToStorage();
});