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
        }
    });
});

// Сохраняем данные перед закрытием страницы
window.addEventListener('beforeunload', () => {
    budgetApp.saveToStorage();
});