// Модуль операций (доходы/расходы)
export class OperationsModule {
    constructor(app) {
        this.app = app;
    }

    async init() {
        return this;
    }
}

export default OperationsModule;