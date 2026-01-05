// Скрипт для создания тестовых данных
console.log('📊 Creating test data...');

// Очищаем старые данные (опционально)
localStorage.removeItem('budgetOperations');
localStorage.removeItem('budgetExpectedIncomes');
localStorage.removeItem('budgetPlannedExpenses');

// Создаем тестовые операции
const testOperations = [
    {
        id: '1',
        type: 'income',
        amount: 50000.50,
        description: 'Зарплата',
        date: '2024-01-15',
        createdAt: '2024-01-15T10:00:00Z'
    },
    {
        id: '2',
        type: 'expense',
        amount: 15000.75,
        description: 'Аренда квартиры',
        date: '2024-01-10',
        createdAt: '2024-01-10T09:00:00Z'
    },
    {
        id: '3',
        type: 'expense',
        amount: 5000.25,
        description: 'Продукты',
        date: '2024-01-12',
        createdAt: '2024-01-12T11:00:00Z'
    }
];

// Создаем тестовые ожидаемые доходы
const testExpectedIncomes = [
    {
        id: '4',
        type: 'expected',
        amount: 20000.00,
        description: 'Фриланс проект',
        date: '2024-01-20',
        status: 'pending',
        probability: 80,
        client: 'Компания А',
        category: 'freelance',
        createdAt: '2024-01-05T14:00:00Z'
    }
];

// Создаем тестовые плановые расходы
const testPlannedExpenses = [
    {
        id: '5',
        amount: 10000.50,
        description: 'Новый телефон',
        date: '2024-02-01',
        completed: false,
        createdAt: '2024-01-01T12:00:00Z'
    }
];

// Сохраняем в localStorage
localStorage.setItem('budgetOperations', JSON.stringify(testOperations));
localStorage.setItem('budgetExpectedIncomes', JSON.stringify(testExpectedIncomes));
localStorage.setItem('budgetPlannedExpenses', JSON.stringify(testPlannedExpenses));

console.log('✅ Test data created successfully!');
console.log('- Operations:', testOperations.length);
console.log('- Expected incomes:', testExpectedIncomes.length);
console.log('- Planned expenses:', testPlannedExpenses.length);

// Показываем уведомление
const notification = document.createElement('div');
notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
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
notification.textContent = '✅ Тестовые данные созданы! Обновите страницу.';
document.body.appendChild(notification);

// Автоматическое удаление
setTimeout(() => {
    if (notification.parentNode) {
        notification.remove();
    }
}, 5000);