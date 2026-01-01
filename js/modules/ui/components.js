// Общие UI компоненты
import { NotificationService } from '../../core/notifications.js';

export class UIComponents {
    // Инициализация очистки данных
    static initClearData(clearCallback) {
        const clearButton = document.getElementById('clearBtn');
        if (clearButton) {
            clearButton.addEventListener('click', (e) => {
                e.preventDefault();
                UIComponents.handleClearData(clearCallback);
            });
        }
    }

    static handleClearData(clearCallback) {
        if (clearCallback && clearCallback()) {
            return;
        }

        // Стандартная логика очистки
        const operations = JSON.parse(localStorage.getItem('budgetOperations')) || [];
        const plannedExpenses = JSON.parse(localStorage.getItem('budgetPlannedExpenses')) || [];
        const expectedIncomes = JSON.parse(localStorage.getItem('budgetExpectedIncomes')) || [];

        if (operations.length === 0 && plannedExpenses.length === 0 && expectedIncomes.length === 0) {
            NotificationService.show('Нет данных для очистки', 'error');
            return;
        }

        if (confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
            localStorage.removeItem('budgetOperations');
            localStorage.removeItem('budgetPlannedExpenses');
            localStorage.removeItem('budgetExpectedIncomes');
            
            // Обновляем страницу
            location.reload();
        }
    }

    // Показать лоадер
    static showLoader() {
        const loader = document.createElement('div');
        loader.className = 'loader-overlay';
        loader.innerHTML = `
            <div class="loader">
                <div class="loader-spinner"></div>
                <div class="loader-text">Загрузка...</div>
            </div>
        `;
        
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(39, 39, 39, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        document.body.appendChild(loader);
        return loader;
    }

    // Скрыть лоадер
    static hideLoader(loader) {
        if (loader && loader.parentNode) {
            loader.remove();
        }
    }

    // Создать тултип
    static createTooltip(text, element) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        
        tooltip.style.cssText = `
            position: absolute;
            background: #2A2A2A;
            color: #FFFFFF;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        
        document.body.appendChild(tooltip);
        
        element.addEventListener('mouseenter', (e) => {
            const rect = element.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            tooltip.style.opacity = '1';
        });
        
        element.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });
        
        return tooltip;
    }

    // Создать модальное окно
    static createModal(title, content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">${content}</div>
                ${options.buttons ? `
                    <div class="modal-footer">
                        ${options.buttons}
                    </div>
                ` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Закрытие модального окна
        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            if (options.onClose) options.onClose();
            modal.remove();
        });
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            if (options.onClose) options.onClose();
            modal.remove();
        });
        
        return modal;
    }
}

export default UIComponents;