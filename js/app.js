// Структура данных приложения
const budgetApp = {
    // Данные приложения
    data: {
        operations: JSON.parse(localStorage.getItem('budgetOperations')) || [],
        plannedExpenses: JSON.parse(localStorage.getItem('budgetPlannedExpenses')) || [],
        incomeTotal: 0,
        expensesTotal: 0
    },
    
    // Текущая выбранная дата для календаря
    currentSelectedDate: null,
    
    // Сохранение в localStorage
    saveToStorage() {
        localStorage.setItem('budgetOperations', JSON.stringify(this.data.operations));
        localStorage.setItem('budgetPlannedExpenses', JSON.stringify(this.data.plannedExpenses));
    },
    
    // Инициализация приложения
    init() {
        this.calculateTotals();
        this.renderTotals();
        this.renderOperations();
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
    },
    
    // Отображение итогов в шапке
    renderTotals() {
        const incomeElement = document.querySelector('.income__sum');
        const expensesElement = document.querySelector('.expenses__sum');
        
        if (incomeElement) {
            incomeElement.textContent = `${this.formatCurrency(this.data.incomeTotal)}`;
        }
        
        if (expensesElement) {
            expensesElement.textContent = `${this.formatCurrency(this.data.expensesTotal)}`;
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
        // Обработчик кнопки добавления
        const addButton = document.querySelector('.add__btn');
        if (addButton) {
            addButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.addOperation();
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
        const clearButton = document.querySelector('.footer__btn');
        if (clearButton) {
            clearButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
                    this.clearAllData();
                }
            });
        }
        
        // Обработчик для поля даты
        const dateInput = document.querySelector('.date-input');
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
    },
    
    // Очистка всех данных
    clearAllData() {
        this.data.operations = [];
        this.data.plannedExpenses = [];
        this.calculateTotals();
        this.renderTotals();
        this.renderOperations();
        this.saveToStorage();
        alert('Все данные удалены');
    },
    
    // Добавление новой операции
    addOperation() {
        // Получаем выбранный тип операции
        const activeCategory = document.querySelector('.add .categories__item.active');
        if (!activeCategory) return;
        
        const operationType = activeCategory.textContent.toLowerCase();
        
        // Проверяем, что это не "Планы" (пока не реализовано)
        if (operationType === 'планы') {
            alert('Добавление плановых трат будет реализовано позже');
            return;
        }
        
        // Получаем значения из формы
        const amountInput = document.querySelector('.add__input[placeholder="Сумма"]');
        const descriptionInput = document.querySelector('.add__input[placeholder="Описание"]');
        const realDateInput = document.getElementById('real-date');
        
        // Валидация
        const amount = parseFloat(amountInput.value);
        const description = descriptionInput.value.trim();
        const date = realDateInput.value;
        
        if (!amount || amount <= 0) {
            alert('Пожалуйста, введите корректную сумму');
            return;
        }
        
        if (!description) {
            alert('Пожалуйста, введите описание');
            return;
        }
        
        if (!date) {
            alert('Пожалуйста, выберите дату');
            return;
        }
        
        // Создаем новую операцию
        const newOperation = {
            id: Date.now(), // Простой ID на основе времени
            type: operationType === 'доходы' ? 'income' : 'expense',
            amount: amount,
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
        const dateInput = document.querySelector('.date-input');
        if (dateInput) {
            dateInput.value = '';
        }
        if (realDateInput) {
            realDateInput.value = '';
        }
        
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
        }
    },
    
    // Закрытие календаря
    closeCalendar() {
        const calendarModal = document.getElementById('calendarModal');
        if (calendarModal) {
            calendarModal.classList.remove('active');
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
        for (let i = 0; i < startDay; i++) {
            const emptyDay = new Date(year, month, -i);
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = emptyDay.getDate();
            calendarDays.appendChild(dayElement);
        }
        
        // Добавляем дни месяца
        const today = new Date();
        const realDateInput = document.getElementById('real-date');
        const currentDateValue = realDateInput ? realDateInput.value : null;
        
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayDate = new Date(year, month, day);
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            dayElement.dataset.date = dayDate.toISOString().split('T')[0];
            
            // Проверяем, сегодня ли это
            if (dayDate.getDate() === today.getDate() &&
                dayDate.getMonth() === today.getMonth() &&
                dayDate.getFullYear() === today.getFullYear()) {
                dayElement.classList.add('today');
            }
            
            // Проверяем, выбрана ли эта дата
            if (currentDateValue) {
                const selectedDate = new Date(currentDateValue);
                if (dayDate.getDate() === selectedDate.getDate() &&
                    dayDate.getMonth() === selectedDate.getMonth() &&
                    dayDate.getFullYear() === selectedDate.getFullYear()) {
                    dayElement.classList.add('selected');
                }
            }
            
            dayElement.addEventListener('click', () => this.selectDate(dayDate));
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
        
        // Обновляем поле ввода
        const dateInput = document.querySelector('.date-input');
        if (dateInput) {
            dateInput.value = formattedDate;
        }
        
        // Обновляем скрытое поле
        const realDateInput = document.getElementById('real-date');
        if (realDateInput) {
            realDateInput.value = date.toISOString().split('T')[0];
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
        this.selectDate(today);
        this.currentSelectedDate = today;
        this.renderCalendar();
    },
    
    // Очистить дату
    clearDate() {
        const dateInput = document.querySelector('.date-input');
        if (dateInput) {
            dateInput.value = '';
        }
        
        const realDateInput = document.getElementById('real-date');
        if (realDateInput) {
            realDateInput.value = '';
        }
        
        this.closeCalendar();
    }
};

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    budgetApp.init();
});