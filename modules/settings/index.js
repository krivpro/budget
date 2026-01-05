// Модуль настроек
export class SettingsModule {
    constructor(app) {
        this.app = app;
    }

    async init() {
        return this;
    }
}

export default SettingsModule;