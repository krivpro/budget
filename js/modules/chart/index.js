import { CHART_COLORS } from '../../constants/colors.js';
import { BudgetCalculator } from '../../core/calculator.js';
import { StorageService } from '../../core/storage.js';
import MonthlyChart from './monthly-chart.js';

export class ChartModule {
    constructor() {
        this.chart = null;
        this.monthlyChart = new MonthlyChart();
    }

    init() {
        console.log('Initializing Chart Module');
        
        this.initChart();
        this.setupEventListeners();
        this.updateChartStats();
        
        return this;
    }

    initChart() {
        const canvas = document.getElementById('budgetChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: this.getChartData(),
            options: this.getChartOptions()
        });
    }


    getChartData() {
        return this.monthlyChart.getData();
    }

    getChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(42, 42, 42, 0.95)',
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 12,
                    padding: 12,
                    displayColors: true,
                    titleFont: {
                        family: "'Inter', sans-serif",
                        size: 13,
                        weight: '600'
                    },
                    bodyFont: {
                        family: "'Inter', sans-serif",
                        size: 12,
                        weight: '400'
                    },
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            const value = context.parsed.y;
                            label += BudgetCalculator.formatCurrency(value) + ' Р';
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(139, 139, 139, 0.1)',
                        drawBorder: false,
                        display: true,
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#8A8A8A',
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11,
                            weight: '400'
                        },
                        maxRotation: 0,
                        padding: 8
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(139, 139, 139, 0.1)',
                        drawBorder: false,
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#8A8A8A',
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11,
                            weight: '400'
                        },
                        padding: 8,
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
                duration: 1200,
                easing: 'easeOutCubic'
            },
            elements: {
                bar: {
                    borderRadius: {
                        topLeft: 8,
                        topRight: 8,
                        bottomLeft: 0,
                        bottomRight: 0
                    },
                    borderSkipped: false
                }
            }
        };
    }


    setupEventListeners() {
        // Слушаем обновления данных
        window.addEventListener('operation:added', () => this.update());
        window.addEventListener('expected-income:added', () => this.update());
        window.addEventListener('expected-income:received', () => this.update());
        window.addEventListener('expected-income:canceled', () => this.update());
        window.addEventListener('plan:added', () => this.update());
        window.addEventListener('plan:completed', () => this.update());
        window.addEventListener('plan:deleted', () => this.update());
        
        // Обновляем статистику при переключении на вкладку с графиком
        window.addEventListener('tab:changed', (e) => {
            if (e.detail.tab === 'main') {
                this.updateChartStats();
            }
        });
    }

    renderChart() {
        if (!this.chart) return;

        const newData = this.getChartData();
        this.chart.data = newData;
        this.chart.options = this.getChartOptions();
        this.chart.update();
        
        this.updateChartStats();
    }

    updateChartStats() {
        const operations = StorageService.getOperations();
        const expectedIncomes = StorageService.getExpectedIncomes();
        const plannedExpenses = StorageService.getPlannedExpenses();
        
        const stats = BudgetCalculator.calculateAverageStats(operations, expectedIncomes, plannedExpenses);
        
        // Ищем элементы внутри активной вкладки или в документе
        const mainTab = document.querySelector('.tab-content[data-tab="main"]');
        const searchRoot = mainTab || document;
        
        // Обновляем DOM - используем новые классы stat-card__value
        const avgIncomeElement = searchRoot.querySelector('.stat-card--income .stat-card__value.income');
        const avgExpenseElement = searchRoot.querySelector('.stat-card--expense .stat-card__value.expense');
        const avgExpectedElement = searchRoot.querySelector('.stat-card--expected .stat-card__value.expected');
        const plannedTotalElement = searchRoot.querySelector('.stat-card--planned .stat-card__value.planned');
        
        if (avgIncomeElement) {
            avgIncomeElement.textContent = `${BudgetCalculator.formatCurrency(stats.avgIncome)} Р`;
        }
        
        if (avgExpenseElement) {
            avgExpenseElement.textContent = `${BudgetCalculator.formatCurrency(stats.avgExpense)} Р`;
        }
        
        if (avgExpectedElement) {
            avgExpectedElement.textContent = `${BudgetCalculator.formatCurrency(stats.avgExpected)} Р`;
        }
        
        if (plannedTotalElement) {
            plannedTotalElement.textContent = `${BudgetCalculator.formatCurrency(stats.plannedTotal)} Р`;
        }
    }

    update() {
        // Обновляем данные
        this.monthlyChart.updateData();
        
        // Перерисовываем график
        this.renderChart();
    }

    // Публичное API
    getChart() {
        return this.chart;
    }


    exportAsImage() {
        return this.chart ? this.chart.toBase64Image() : null;
    }
}

export default ChartModule;