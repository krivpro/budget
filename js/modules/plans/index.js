import { StorageService } from '../../core/storage.js';
import { NotificationService } from '../../core/notifications.js';
import { Utils } from '../../core/utils.js';
import PlansForm from './form.js';
import PlansList from './list.js';

export class PlansModule {
    constructor() {
        this.storage = StorageService;
        this.plannedExpenses = [];
        this.form = new PlansForm();
        this.list = new PlansList();
    }

    init() {
        console.log('Initializing Plans Module');
        
        // Загружаем данные
        this.plannedExpenses = this.storage.getPlannedExpenses();
        
        // Инициализируем подмодули
        this.form.init(this);
        this.list.init(this);
        
        // Слушаем события переключения вкладок
        window.addEventListener('tab:changed', (e) => {
            if (e.detail.tab === 'plans') {
                this.list.render();
            }
        });
        
        return this;
    }

    // Добавить плановую трату
    addPlan(planData) {
        const newPlan = {
            id: Utils.generateId(),
            amount: parseFloat(planData.amount.toFixed(2)),
            description: planData.description,
            date: planData.date,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.plannedExpenses.push(newPlan);
        this.savePlans();

        NotificationService.show(`Плановая трата "${planData.description}" успешно добавлена`);
        this.list.render();
        
        return newPlan;
    }

    // Переключить состояние выполнения
    togglePlanComplete(planId) {
        const planIndex = this.plannedExpenses.findIndex(plan => plan.id === planId);
        if (planIndex === -1) return false;

        const isCompleted = !this.plannedExpenses[planIndex].completed;
        this.plannedExpenses[planIndex].completed = isCompleted;
        this.savePlans();

        const plan = this.plannedExpenses[planIndex];
        const status = isCompleted ? 'выполнена' : 'не выполнена';
        NotificationService.show(`Плановая трата "${plan.description}" отмечена как ${status}`);

        this.list.render();
        return true;
    }

    // Удалить плановую трату
    deletePlan(planId) {
        const planIndex = this.plannedExpenses.findIndex(plan => plan.id === planId);
        if (planIndex === -1) return false;

        const planDescription = this.plannedExpenses[planIndex].description;

        if (NotificationService.confirm(`Удалить плановую трату "${planDescription}"?`)) {
            this.plannedExpenses.splice(planIndex, 1);
            this.savePlans();
            this.list.render();
            
            NotificationService.show(`Плановая трата "${planDescription}" удалена`);
            return true;
        }
        
        return false;
    }


    // Сохранить планы
    savePlans() {
        this.storage.savePlannedExpenses(this.plannedExpenses);
    }

    // Получить планы
    getPlannedExpenses() {
        return [...this.plannedExpenses];
    }

    // Получить активные планы
    getActivePlans() {
        return this.plannedExpenses.filter(plan => !plan.completed);
    }

    // Получить выполненные планы
    getCompletedPlans() {
        return this.plannedExpenses.filter(plan => plan.completed);
    }
}

export default PlansModule;