import { CHART_COLORS } from '../../constants/colors.js';
import { StorageService } from '../../core/storage.js';
import { BudgetCalculator } from '../../core/calculator.js';
import { Utils } from '../../core/utils.js';

export class ForecastChart {
    constructor() {
        this.data = null;
        this.updateData();
    }

    updateData() {
        const operations = StorageService.getOperations();
        const expectedIncomes = StorageService.getExpectedIncomes();
        const plannedExpenses = StorageService.getPlannedExpenses();
        this.data = this.processData(operations, expectedIncomes, plannedExpenses);
    }

    processData(operations, expectedIncomes, plannedExpenses) {
        const forecastData = {};
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Рассчитываем средние значения за последние 3 месяца
        const last3Months = [];
        for (let i = 0; i < 3; i++) {
            const date = new Date(currentDate);
            date.setMonth(date.getMonth() - i);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            last3Months.push(monthKey);
        }

        let totalIncome = 0;
        let totalExpense = 0;
        let monthCount = 0;

        operations.forEach(operation => {
            const date = Utils.parseDate(operation.date);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (last3Months.includes(monthKey)) {
                if (operation.type === 'income') {
                    totalIncome += operation.amount;
                } else if (operation.type === 'expense') {
                    totalExpense += operation.amount;
                }
            }
        });

        // Подсчитываем количество месяцев с данными
        const monthsWithData = new Set();
        operations.forEach(operation => {
            const date = Utils.parseDate(operation.date);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            if (last3Months.includes(monthKey)) {
                monthsWithData.add(monthKey);
            }
        });
        monthCount = monthsWithData.size || 1;

        const avgIncome = totalIncome / monthCount;
        const avgExpense = totalExpense / monthCount;

        // Прогноз на следующие 6 месяцев
        const forecastMonths = [];
        const forecastIncomes = [];
        const forecastExpenses = [];
        const expectedIncomesData = [];
        const plannedExpensesData = [];

        for (let i = 0; i < 6; i++) {
            const forecastDate = new Date(currentDate);
            forecastDate.setMonth(forecastDate.getMonth() + i);
            const monthKey = `${forecastDate.getFullYear()}-${(forecastDate.getMonth() + 1).toString().padStart(2, '0')}`;
            const monthName = forecastDate.toLocaleDateString('ru-RU', { 
                month: 'short',
                year: '2-digit'
            });

            forecastMonths.push(monthName);

            // Базовый прогноз на основе средних значений
            let forecastIncome = avgIncome;
            let forecastExpense = avgExpense;

            // Добавляем ожидаемые доходы
            let expectedForMonth = 0;
            expectedIncomes.forEach(income => {
                if (income.status === 'pending') {
                    const incomeDate = Utils.parseDate(income.date);
                    const incomeMonthKey = `${incomeDate.getFullYear()}-${(incomeDate.getMonth() + 1).toString().padStart(2, '0')}`;
                    if (incomeMonthKey === monthKey) {
                        expectedForMonth += income.amount * (income.probability / 100);
                    }
                }
            });

            // Добавляем плановые расходы
            let plannedForMonth = 0;
            plannedExpenses.forEach(plan => {
                if (!plan.completed) {
                    const planDate = Utils.parseDate(plan.date);
                    const planMonthKey = `${planDate.getFullYear()}-${(planDate.getMonth() + 1).toString().padStart(2, '0')}`;
                    if (planMonthKey === monthKey) {
                        plannedForMonth += plan.amount;
                    }
                }
            });

            forecastIncome += expectedForMonth;
            forecastExpense += plannedForMonth;

            forecastIncomes.push(Math.max(0, forecastIncome));
            forecastExpenses.push(Math.max(0, forecastExpense));
            expectedIncomesData.push(expectedForMonth);
            plannedExpensesData.push(plannedForMonth);
        }

        // Если данных нет, показываем пустой график
        if (forecastMonths.length === 0) {
            return {
                labels: ['Нет данных'],
                datasets: [
                    {
                        label: 'Прогноз доходов',
                        data: [0],
                        backgroundColor: CHART_COLORS.income + '80',
                        borderColor: CHART_COLORS.income,
                        borderWidth: 1
                    },
                    {
                        label: 'Прогноз расходов',
                        data: [0],
                        backgroundColor: CHART_COLORS.expense + '80',
                        borderColor: CHART_COLORS.expense,
                        borderWidth: 1
                    }
                ]
            };
        }

        return {
            labels: forecastMonths,
            datasets: [
                {
                    label: 'Прогноз доходов',
                    data: forecastIncomes,
                    backgroundColor: CHART_COLORS.income + 'E6',
                    borderColor: CHART_COLORS.income,
                    borderWidth: 2.5,
                    borderRadius: {
                        topLeft: 10,
                        topRight: 10,
                        bottomLeft: 0,
                        bottomRight: 0
                    },
                    barPercentage: 0.7,
                    categoryPercentage: 0.85
                },
                {
                    label: 'Прогноз расходов',
                    data: forecastExpenses,
                    backgroundColor: CHART_COLORS.expense + 'E6',
                    borderColor: CHART_COLORS.expense,
                    borderWidth: 2.5,
                    borderRadius: {
                        topLeft: 10,
                        topRight: 10,
                        bottomLeft: 0,
                        bottomRight: 0
                    },
                    barPercentage: 0.7,
                    categoryPercentage: 0.85
                },
                {
                    label: 'Ожидаемые доходы',
                    data: expectedIncomesData,
                    backgroundColor: CHART_COLORS.expected + 'E6',
                    borderColor: CHART_COLORS.expected,
                    borderWidth: 2.5,
                    borderRadius: {
                        topLeft: 10,
                        topRight: 10,
                        bottomLeft: 0,
                        bottomRight: 0
                    },
                    barPercentage: 0.7,
                    categoryPercentage: 0.85,
                    hidden: expectedIncomesData.every(val => val === 0)
                }
            ]
        };
    }

    getData() {
        return this.data;
    }
}

export default ForecastChart;

