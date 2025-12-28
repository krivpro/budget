// Структура данных приложения
const budgetApp = {
    // Данные приложения
    data: {
        operations: JSON.parse(localStorage.getItem('budgetOperations')) || [],
        plannedExpenses: JSON.parse(localStorage.getItem('budgetPlannedExpenses')) || [],
        incomeTotal: 0,
        expensesTotal: 0
    },
    
    // Сохранение в localStorage
    saveToStorage() {
        localStorage.setItem('budgetOperations', JSON.stringify(this.data.operations));
        localStorage.setItem('budgetPlannedExpenses', JSON.stringify(this.data.plannedExpenses));
    },
    
    // Инициализация приложения
    init() {
        this.calculateTotals();
        this.renderTotals();
        this.setupEventListeners();
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
        }).format(amount) + ' Р';
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
        const categoryItems = document.querySelectorAll('.categories__item');
        categoryItems.forEach(item => {
            item.addEventListener('click', () => {
                // Убираем активный класс у всех
                categoryItems.forEach(i => i.classList.remove('active'));
                // Добавляем активный класс текущему
                item.classList.add('active');
            });
        });
    },
    
    // Добавление новой операции
    addOperation() {
        // Получаем выбранный тип операции
        const activeCategory = document.querySelector('.categories .active');
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
        const dateInput = document.querySelector('input[type="date"]');
        
        // Валидация
        const amount = parseFloat(amountInput.value);
        const description = descriptionInput.value.trim();
        const date = dateInput.value;
        
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
        
        // Очищаем форму
        amountInput.value = '';
        descriptionInput.value = '';
        dateInput.value = '';
        
        console.log('Добавлена новая операция:', newOperation);
    }
};

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    budgetApp.init();
});