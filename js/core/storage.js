import { STORAGE_KEYS } from '../constants/storage-keys.js';

export class StorageService {
    // Операции
    static saveOperations(operations) {
        localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(operations));
    }

    static getOperations() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.OPERATIONS);
            if (!data) return [];
            return JSON.parse(data);
        } catch (e) {
            console.error('Ошибка при чтении операций из localStorage:', e);
            return [];
        }
    }

    // Плановые траты
    static savePlannedExpenses(plans) {
        localStorage.setItem(STORAGE_KEYS.PLANNED_EXPENSES, JSON.stringify(plans));
    }

    static getPlannedExpenses() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.PLANNED_EXPENSES);
            if (!data) return [];
            return JSON.parse(data);
        } catch (e) {
            console.error('Ошибка при чтении плановых трат из localStorage:', e);
            return [];
        }
    }

    // Ожидаемые доходы
    static saveExpectedIncomes(incomes) {
        localStorage.setItem(STORAGE_KEYS.EXPECTED_INCOMES, JSON.stringify(incomes));
    }

    static getExpectedIncomes() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.EXPECTED_INCOMES);
            if (!data) return [];
            return JSON.parse(data);
        } catch (e) {
            console.error('Ошибка при чтении ожидаемых доходов из localStorage:', e);
            return [];
        }
    }

    // Очистка всех данных
    static clearAll() {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    // Проверка поддержки localStorage
    static isSupported() {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }
}