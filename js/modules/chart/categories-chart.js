import { CHART_COLORS } from '../../constants/colors.js';
import { StorageService } from '../../core/storage.js';
import { INCOME_CATEGORIES } from '../../constants/categories.js';

export class CategoriesChart {
    constructor() {
        this.data = null;
        this.updateData();
    }

    updateData() {
        const operations = StorageService.getOperations();
        this.data = this.processData(operations);
    }

    processData(operations) {
        const categoryData = {
            income: {},
            expense: {}
        };

        // Обрабатываем операции по категориям
        operations.forEach(operation => {
            if (operation.type === 'income') {
                const category = operation.category || 'other';
                if (!categoryData.income[category]) {
                    categoryData.income[category] = 0;
                }
                categoryData.income[category] += operation.amount;
            } else if (operation.type === 'expense') {
                const category = operation.category || 'other';
                if (!categoryData.expense[category]) {
                    categoryData.expense[category] = 0;
                }
                categoryData.expense[category] += operation.amount;
            }
        });

        // Для доходов используем INCOME_CATEGORIES
        const incomeLabels = [];
        const incomeData = [];
        const incomeColors = [];

        Object.keys(INCOME_CATEGORIES).forEach(category => {
            if (categoryData.income[category] && categoryData.income[category] > 0) {
                incomeLabels.push(INCOME_CATEGORIES[category].name);
                incomeData.push(categoryData.income[category]);
                incomeColors.push(INCOME_CATEGORIES[category].color);
            }
        });

        // Для расходов используем общие категории
        const expenseLabels = [];
        const expenseData = [];
        const expenseColors = [];

        Object.keys(categoryData.expense).forEach(category => {
            if (categoryData.expense[category] > 0) {
                expenseLabels.push(this.getExpenseCategoryName(category));
                expenseData.push(categoryData.expense[category]);
                expenseColors.push(this.getExpenseCategoryColor(category));
            }
        });

        // Если данных нет, показываем пустой график
        if (incomeLabels.length === 0 && expenseLabels.length === 0) {
            return {
                labels: ['Нет данных'],
                datasets: [
                    {
                        label: 'Доходы',
                        data: [0],
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
                        label: 'Расходы',
                        data: [0],
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
                    }
                ]
            };
        }

        // Объединяем доходы и расходы
        const allLabels = [...new Set([...incomeLabels, ...expenseLabels])];
        const incomeDataset = allLabels.map(label => {
            const index = incomeLabels.indexOf(label);
            return index !== -1 ? incomeData[index] : 0;
        });
        const expenseDataset = allLabels.map(label => {
            const index = expenseLabels.indexOf(label);
            return index !== -1 ? expenseData[index] : 0;
        });

        // Создаем массивы цветов с прозрачностью для каждого столбца
        // Важно: массив должен иметь ту же длину, что и массив данных
        const incomeBgColors = [];
        const expenseBgColors = [];
        
        for (let i = 0; i < allLabels.length; i++) {
            const label = allLabels[i];
            
            // Для доходов
            const incomeIndex = incomeLabels.indexOf(label);
            if (incomeIndex !== -1 && incomeColors[incomeIndex]) {
                const color = incomeColors[incomeIndex];
                incomeBgColors.push(color + 'E6');
            } else {
                incomeBgColors.push(CHART_COLORS.income + 'E6');
            }
            
            // Для расходов
            const expenseIndex = expenseLabels.indexOf(label);
            if (expenseIndex !== -1 && expenseColors[expenseIndex]) {
                const color = expenseColors[expenseIndex];
                expenseBgColors.push(color + 'E6');
            } else {
                expenseBgColors.push(CHART_COLORS.expense + 'E6');
            }
        }

        return {
            labels: allLabels.length > 0 ? allLabels : ['Нет данных'],
            datasets: [
                {
                    label: 'Доходы',
                    data: incomeDataset.length > 0 ? incomeDataset : [0],
                    backgroundColor: incomeBgColors.length > 0 && incomeBgColors.length === incomeDataset.length 
                        ? incomeBgColors 
                        : incomeDataset.map(() => CHART_COLORS.income + 'E6'),
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
                    label: 'Расходы',
                    data: expenseDataset.length > 0 ? expenseDataset : [0],
                    backgroundColor: expenseBgColors.length > 0 && expenseBgColors.length === expenseDataset.length
                        ? expenseBgColors
                        : expenseDataset.map(() => CHART_COLORS.expense + 'E6'),
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
                }
            ]
        };
    }

    getExpenseCategoryName(category) {
        const categoryNames = {
            food: 'Еда',
            transport: 'Транспорт',
            utilities: 'Коммунальные',
            shopping: 'Покупки',
            entertainment: 'Развлечения',
            health: 'Здоровье',
            education: 'Образование',
            other: 'Другое'
        };
        return categoryNames[category] || 'Другое';
    }

    getExpenseCategoryColor(category) {
        const categoryColors = {
            food: '#FF9800',
            transport: '#2196F3',
            utilities: '#9C27B0',
            shopping: '#E91E63',
            entertainment: '#00BCD4',
            health: '#4CAF50',
            education: '#3F51B5',
            other: '#607D8B'
        };
        return categoryColors[category] || CHART_COLORS.expense;
    }

    getData() {
        return this.data;
    }
}

export default CategoriesChart;

