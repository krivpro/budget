// Модуль планов - заглушка
export class PlansModule {
    constructor(app) {
        this.app = app;
    }

    async init() {
        return this;
    }
}

export default PlansModule;