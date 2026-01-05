// Модуль операций (доходы/расходы)
export class OperationsModule {
    constructor(app) {
        this.app = app;
    }

    async init() {
        console.log('🔧 Initializing Operations Module');
        return this;
    }
}

export default OperationsModule;