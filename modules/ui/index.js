// modules/ui/index.js
export class UIModule {
    constructor(app) {
        this.app = app;
        this.notifications = [];
    }

    async init() {
        console.log('UI Module initialized');
        this.setupGlobalStyles();
        return this;
    }

    setupGlobalStyles() {
        // Добавляем стили для уведомлений
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                z-index: 2000;
                animation: slideIn 0.3s ease;
                max-width: 300px;
                font-size: 14px;
                font-weight: 500;
            }
            
            .notification.notification--error {
                background: #FF7653;
            }
            
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

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
        
        return notification;
    }
}

export default UIModule;