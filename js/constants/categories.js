// Категории доходов
export const INCOME_CATEGORIES = {
    freelance: { name: 'Фриланс', color: '#FFB74D' },
    salary: { name: 'Зарплата', color: '#4CAF50' },
    investment: { name: 'Инвестиции', color: '#2196F3' },
    sales: { name: 'Продажи', color: '#9C27B0' },
    other: { name: 'Другое', color: '#607D8B' }
};

// Статусы ожидаемых доходов
export const EXPECTED_STATUSES = {
    PENDING: 'pending',
    RECEIVED: 'received',
    CANCELED: 'canceled'
};

// Типы операций
export const OPERATION_TYPES = {
    INCOME: 'income',
    EXPENSE: 'expense',
    EXPECTED: 'expected',
    PLAN: 'plan'
};
