// Модуль календаря
export class CalendarModule {
    constructor(app) {
        this.app = app;
    }

    async init() {
        console.log('📅 Initializing Calendar Module');
        
        // Календарь изначально скрыт (через CSS)
        // Функционал будет добавлен позже
        
        return this;
    }
}

export default CalendarModule;