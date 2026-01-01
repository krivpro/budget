import { BudgetCalculator } from '../../core/calculator.js';
import { Utils } from '../../core/utils.js';

export class PlansList {
    constructor() {
        // Пустой конструктор
    }

    init(plansModule) {
        this.module = plansModule;
        return this;
    }

    render() {
        const plansContainer = document.querySelector('.plans-content');
        if (!plansContainer) return;

        const activePlans = this.module.getActivePlans();
        const completedPlans = this.module.getCompletedPlans();
        const allPlans = [...activePlans, ...completedPlans];

        if (allPlans.length === 0) {
            plansContainer.innerHTML = this.renderEmptyState();
            return;
        }

        let plansHTML = `<div class="plans-list">`;
        
        allPlans.forEach(plan => {
            plansHTML += this.renderPlanItem(plan);
        });
        
        plansHTML += `</div>`;
        
        plansContainer.innerHTML = plansHTML;
        this.setupEventListeners();
    }

    renderPlanItem(plan) {
        const formattedDate = Utils.formatDate(plan.date);
        const completedClass = plan.completed ? 'completed' : '';
        
        return `
            <div class="plan-item ${completedClass}" data-id="${plan.id}">
                <input type="checkbox" class="plan-checkbox" ${plan.completed ? 'checked' : ''}>
                <div class="plan-info">
                    <p class="plan-description">${plan.description}</p>
                    <p class="plan-date">${formattedDate}</p>
                </div>
                <p class="plan-amount">${BudgetCalculator.formatCurrency(plan.amount)} Р</p>
                <button class="plan-delete" aria-label="Удалить плановую трату">
                    <svg class="plan-delete__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="list__no-data list__no-data--plans">
                <div class="list__no-data__description">Плановых трат пока нет</div>
                <div class="list__no-data__hint">Добавьте плановую трату в форме выше</div>
            </div>
        `;
    }

    setupEventListeners() {
        // Чекбоксы
        document.querySelectorAll('.plan-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const planItem = e.target.closest('.plan-item');
                const planId = planItem.dataset.id;
                this.module.togglePlanComplete(planId);
            });
        });

        // Кнопки удаления
        document.querySelectorAll('.plan-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const planItem = e.target.closest('.plan-item');
                const planId = planItem.dataset.id;
                this.module.deletePlan(planId);
            });
        });
    }

    update() {
        this.render();
    }
}

export default PlansList;