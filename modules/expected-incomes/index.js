// Модуль ожидаемых доходов
export class ExpectedIncomesModule {
    constructor(app) {
        this.app = app;
    }

    async init() {
        return this;
    }
}

export default ExpectedIncomesModule;