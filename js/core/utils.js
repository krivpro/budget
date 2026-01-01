export class Utils {
    // Парсинг даты из строки формата YYYY-MM-DD без учета часового пояса
    static parseDate(dateString) {
        if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const [year, month, day] = dateString.split('-').map(Number);
            return new Date(year, month - 1, day);
        }
        return new Date(dateString);
    }

    // Форматирование даты
    static formatDate(dateString) {
        const date = this.parseDate(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // Валидация суммы
    static validateAmount(amount) {
        if (!amount || amount <= 0 || isNaN(amount)) {
            return false;
        }
        return true;
    }

    // Очистка суммы от лишних символов
    static cleanAmount(value) {
        let cleaned = value.replace(',', '.');
        cleaned = cleaned.replace(/[^0-9.]/g, '');
        
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('');
        }
        
        if (parts.length === 2 && parts[1].length > 2) {
            cleaned = parts[0] + '.' + parts[1].substring(0, 2);
        }
        
        return cleaned;
    }

    // Генерация ID
    static generateId() {
        // Используем timestamp + случайное число для уникальности
        return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Получение класса вероятности
    static getProbabilityClass(probability) {
        if (probability >= 80) return 'high';
        if (probability >= 50) return 'medium';
        return 'low';
    }

    // Дебаунс
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}