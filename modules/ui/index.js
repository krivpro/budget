// modules/ui/index.js
export class UIModule {
    constructor(app) {
        this.app = app;
        this.notifications = [];
    }

    async init() {
        console.log('UI Module initialized');
        return this;
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        
        // Стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#FF7653'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            z-index: 2000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            font-size: 14px;
            font-weight: 500;
        `;
        
        // Добавляем стили для анимации если их нет
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Автоматическое удаление через 3 секунды
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
        
        return notification;
    }

    confirm(message) {
        return new Promise((resolve) => {
            if (window.confirm(message)) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }
}

export default UIModule;