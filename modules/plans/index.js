// Модуль плановых расходов
export class PlansModule {
    constructor(app) {
        this.app = app;
    }

    async init() {
        console.log('🔧 Initializing Plans Module');
        return this;
    }
}

export default PlansModule;