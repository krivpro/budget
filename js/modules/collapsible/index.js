import { StorageService } from '../../core/storage.js';

export class CollapsibleModule {
    constructor() {
        this.collapsedSections = this.loadCollapsedState();
    }

    init() {
        console.log('Initializing Collapsible Module');
        this.setupCollapsibleSections();
        this.restoreCollapsedState();
        return this;
    }

    loadCollapsedState() {
        try {
            const saved = localStorage.getItem('collapsedSections');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error('Error loading collapsed state:', e);
            return {};
        }
    }

    saveCollapsedState() {
        try {
            localStorage.setItem('collapsedSections', JSON.stringify(this.collapsedSections));
        } catch (e) {
            console.error('Error saving collapsed state:', e);
        }
    }

    setupCollapsibleSections() {
        // Находим все секции (исключаем шапку)
        const allSections = document.querySelectorAll('.list, .add');
        
        allSections.forEach(section => {
            // Исключаем шапку
            if (section.classList.contains('header')) return;
            
            // Проверяем, что есть control-panel (не все блоки могут быть сворачиваемыми)
            const panel = section.querySelector('.control-panel');
            if (!panel) return;

            // Получаем уникальный идентификатор секции
            const sectionId = this.getSectionId(section);
            if (!sectionId) return;

            // Удаляем существующие кнопки сворачивания, если есть
            const existingToggleBtn = panel.querySelector('.collapse-toggle');
            if (existingToggleBtn) {
                existingToggleBtn.remove();
            }

            // Убираем cursor: pointer с заголовка, если был установлен
            const title = panel.querySelector('.control-panel__title');
            if (title) {
                title.style.cursor = '';
                title.style.paddingRight = '';
            }

            // Добавляем обработчик клика на весь блок
            const clickHandler = (e) => {
                // Не сворачиваем, если клик был на интерактивных элементах
                const interactiveSelectors = [
                    'button',
                    'a',
                    'input',
                    'select',
                    'textarea',
                    '.categories__item',
                    '.operation',
                    '.expected-item',
                    '.plan-item',
                    'canvas',
                    '[data-action]',
                    '[data-filter]',
                    '[data-chart-type]',
                    '[data-status]',
                    '[data-type]'
                ];
                
                // Проверяем, был ли клик на интерактивном элементе или его родителе
                const isInteractive = interactiveSelectors.some(selector => {
                    return e.target.closest(selector);
                });
                
                if (isInteractive) {
                    return;
                }
                
                this.toggleSection(sectionId, section);
            };
            
            // Удаляем старый обработчик, если есть, и добавляем новый
            section.removeEventListener('click', section._collapseHandler);
            section._collapseHandler = clickHandler;
            section.addEventListener('click', clickHandler);
            section.style.cursor = 'pointer';
        });
    }

    getSectionId(section) {
        // Определяем ID секции на основе классов и контекста (исключаем header)
        if (section.classList.contains('chart')) {
            return 'chart';
        }
        if (section.classList.contains('history')) {
            return 'history';
        }
        if (section.classList.contains('expected')) {
            return 'expected';
        }
        if (section.classList.contains('plans')) {
            return 'plans';
        }
        if (section.classList.contains('settings')) {
            return 'settings';
        }
        // Для форм добавления
        if (section.classList.contains('add')) {
            const tab = section.closest('.tab-content');
            if (tab) {
                const tabName = tab.dataset.tab;
                if (tabName === 'main') {
                    return 'add-operation';
                } else if (tabName === 'expected') {
                    return 'add-expected';
                } else if (tabName === 'plans') {
                    return 'add-plan';
                }
            }
        }
        return null;
    }

    toggleSection(sectionId, section) {
        const isCollapsed = section.classList.contains('collapsed');
        
        if (isCollapsed) {
            section.classList.remove('collapsed');
            this.collapsedSections[sectionId] = false;
        } else {
            section.classList.add('collapsed');
            this.collapsedSections[sectionId] = true;
        }

        this.saveCollapsedState();
    }

    restoreCollapsedState() {
        Object.keys(this.collapsedSections).forEach(sectionId => {
            // Пропускаем header, так как его больше не скрываем
            if (sectionId === 'header') return;
            
            if (this.collapsedSections[sectionId]) {
                let section = null;
                
                switch(sectionId) {
                    case 'chart':
                        section = document.querySelector('.list.chart');
                        break;
                    case 'history':
                        section = document.querySelector('.list.history');
                        break;
                    case 'expected':
                        section = document.querySelector('.list.expected');
                        break;
                    case 'plans':
                        section = document.querySelector('.list.plans');
                        break;
                    case 'settings':
                        section = document.querySelector('.list.settings');
                        break;
                    case 'add-operation':
                        section = document.querySelector('.tab-content[data-tab="main"] .add');
                        break;
                    case 'add-expected':
                        section = document.querySelector('.tab-content[data-tab="expected"] .add');
                        break;
                    case 'add-plan':
                        section = document.querySelector('.tab-content[data-tab="plans"] .add');
                        break;
                }

                if (section) {
                    section.classList.add('collapsed');
                }
            }
        });
    }
}

export default CollapsibleModule;

