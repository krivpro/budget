import { CHART_COLORS } from '../../constants/colors.js';
import { StorageService } from '../../core/storage.js';
import { BudgetCalculator } from '../../core/calculator.js';
import { Utils } from '../../core/utils.js';

export class MonthlyChart {
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

    processData(operations, expectedIncomes, plannedExpenses = []) {
        const monthlyData = {};
        const currentDate = new Date();
        const currentMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;

        // Обрабатываем фактические операции
        operations.forEach(operation => {
            const date = Utils.parseDate(operation.date);
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
                    expected: 0,
                    planned: 0
                };
            }

            if (operation.type === 'income') {
                monthlyData[monthKey].income += operation.amount;
            } else {
                monthlyData[monthKey].expense += operation.amount;
            }
        });

        // Добавляем ожидаемые доходы (для всех месяцев, где они есть)
        expectedIncomes.forEach(income => {
            if (income.status === 'pending') {
                const date = Utils.parseDate(income.date);
                const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

                // Добавляем ожидаемые доходы для всех месяцев
                if (!monthlyData[monthKey]) {
                    const monthName = date.toLocaleDateString('ru-RU', { 
                        month: 'short',
                        year: '2-digit'
                    });
                    monthlyData[monthKey] = {
                        month: monthName,
                        income: 0,
                        expense: 0,
                        expected: 0,
                        planned: 0
                    };
                }

                monthlyData[monthKey].expected += income.amount;
            }
        });

        // Добавляем плановые расходы (для всех месяцев, где они есть)
        plannedExpenses.forEach(plan => {
            if (!plan.completed) {
                const date = Utils.parseDate(plan.date);
                const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

                // Добавляем плановые расходы для всех месяцев
                if (!monthlyData[monthKey]) {
                    const monthName = date.toLocaleDateString('ru-RU', { 
                        month: 'short',
                        year: '2-digit'
                    });
                    monthlyData[monthKey] = {
                        month: monthName,
                        income: 0,
                        expense: 0,
                        expected: 0,
                        planned: 0
                    };
                }

                monthlyData[monthKey].planned += plan.amount;
            }
        });

        // Преобразуем в массивы для графика
        const months = [];
        const incomes = [];
        const expenses = [];
        const expected = [];
        const planned = [];

        // Сортируем по месяцам
        Object.keys(monthlyData)
            .sort()
            .forEach(key => {
                const data = monthlyData[key];
                months.push(data.month);
                incomes.push(data.income);
                expenses.push(data.expense);
                expected.push(data.expected);
                planned.push(data.planned);
            });

        // Берем последние 6 месяцев
        const lastMonths = months.slice(-6);
        const lastIncomes = incomes.slice(-6);
        const lastExpenses = expenses.slice(-6);
        const lastExpected = expected.slice(-6);
        const lastPlanned = planned.slice(-6);

        // Если данных нет, показываем пустой график
        if (lastMonths.length === 0) {
            return {
                labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
                datasets: [
                    {
                        label: 'Фактические доходы',
                        data: [0, 0, 0, 0, 0, 0],
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
                        label: 'Фактические расходы',
                        data: [0, 0, 0, 0, 0, 0],
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
                        data: [0, 0, 0, 0, 0, 0],
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
                        categoryPercentage: 0.85
                    },
                    {
                        label: 'Плановые расходы',
                        data: [0, 0, 0, 0, 0, 0],
                        backgroundColor: CHART_COLORS.expense + '80',
                        borderColor: CHART_COLORS.expense,
                        borderWidth: 2,
                        borderRadius: {
                            topLeft: 10,
                            topRight: 10,
                            bottomLeft: 0,
                            bottomRight: 0
                        },
                        barPercentage: 0.7,
                        categoryPercentage: 0.85,
                        borderDash: [6, 4]
                    }
                ]
            };
        }

        return {
            labels: lastMonths,
            datasets: [
                {
                    label: 'Фактические доходы',
                    data: lastIncomes,
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
                    label: 'Фактические расходы',
                    data: lastExpenses,
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
                    data: lastExpected,
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
                    categoryPercentage: 0.85
                },
                {
                    label: 'Плановые расходы',
                    data: lastPlanned,
                    backgroundColor: CHART_COLORS.expense + '80',
                    borderColor: CHART_COLORS.expense,
                    borderWidth: 2,
                    borderRadius: {
                        topLeft: 10,
                        topRight: 10,
                        bottomLeft: 0,
                        bottomRight: 0
                    },
                    barPercentage: 0.7,
                    categoryPercentage: 0.85,
                    borderDash: [6, 4]
                }
            ]
        };
    }

    getData() {
        return this.data;
    }
}

export default MonthlyChart;