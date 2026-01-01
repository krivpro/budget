import { StorageService } from './storage.js';

export class BudgetCalculator {
    static calculateTotals() {
        const operations = StorageService.getOperations();
        const expectedIncomes = StorageService.getExpectedIncomes();
        const plannedExpenses = StorageService.getPlannedExpenses();

        let incomeTotal = 0;
        let expensesTotal = 0;
        let expectedTotal = 0;
        let plannedTotal = 0;

        // Фактические доходы и расходы
        operations.forEach(operation => {
            if (operation.type === 'income') {
                incomeTotal += operation.amount;
            } else if (operation.type === 'expense') {
                expensesTotal += operation.amount;
            }
        });

        // Ожидаемые доходы (только ожидающиеся)
        expectedIncomes.forEach(income => {
            if (income.status === 'pending') {
                expectedTotal += income.amount;
            }
        });

        // Плановые расходы (только не выполненные)
        plannedExpenses.forEach(plan => {
            if (!plan.completed) {
                plannedTotal += plan.amount;
            }
        });

        const balance = incomeTotal - expensesTotal;

        return {
            incomeTotal,
            expensesTotal,
            expectedTotal,
            plannedTotal,
            balance
        };
    }

    static formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    static getBalanceClass(balance) {
        if (balance > 0) return 'positive';
        if (balance < 0) return 'negative';
        return 'neutral';
    }

    // Расчет средней статистики
    static calculateAverageStats(operations, expectedIncomes = [], plannedExpenses = []) {
        const incomeOperations = operations.filter(op => op.type === 'income');
        const expenseOperations = operations.filter(op => op.type === 'expense');
        const pendingIncomes = expectedIncomes.filter(inc => inc.status === 'pending');
        const uncompletedPlans = plannedExpenses.filter(plan => !plan.completed);

        const avgIncome = incomeOperations.length > 0 
            ? incomeOperations.reduce((sum, op) => sum + op.amount, 0) / incomeOperations.length
            : 0;

        const avgExpense = expenseOperations.length > 0
            ? expenseOperations.reduce((sum, op) => sum + op.amount, 0) / expenseOperations.length
            : 0;

        // Общая сумма ожидаемых доходов (с учетом вероятности)
        const avgExpected = pendingIncomes.length > 0
            ? pendingIncomes.reduce((sum, inc) => sum + (inc.amount * inc.probability / 100), 0)
            : 0;

        // Общая сумма плановых расходов (не выполненных)
        const plannedTotal = uncompletedPlans.length > 0
            ? uncompletedPlans.reduce((sum, plan) => sum + plan.amount, 0)
            : 0;

        return {
            avgIncome,
            avgExpense,
            avgExpected,
            plannedTotal
        };
    }
}