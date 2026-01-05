// modules/operations/storage.js
export class OperationsStorage {
    static STORAGE_KEY = 'budgetOperations';
    
    static getOperations() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) return [];
            return JSON.parse(data);
        } catch (e) {
            console.error('Ошибка при чтении операций:', e);
            return [];
        }
    }
    
    static saveOperations(operations) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(operations));
        } catch (e) {
            console.error('Ошибка при сохранении операций:', e);
        }
    }
    
    static clearOperations() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}