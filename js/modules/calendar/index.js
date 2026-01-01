import { NotificationService } from '../../core/notifications.js';
import { Utils } from '../../core/utils.js';

export class CalendarModule {
    constructor() {
        this.currentSelectedDate = null;
        this.currentPlanDateInput = null;
        this.currentRealPlanDateInput = null;
        this.calendarOpenCallback = null;
    }

    init() {
        console.log('Initializing Calendar Module');
        
        this.currentSelectedDate = new Date();
        this.setupEventListeners();
        
        return this;
    }

    setupEventListeners() {
        // Обработчик открытия календаря из основной формы
        const dateInput = document.getElementById('dateInput');
        if (dateInput) {
            dateInput.addEventListener('click', () => this.openForMainForm());
        }

        // Событие открытия календаря из других модулей
        window.addEventListener('calendar:open', (e) => {
            this.openForOtherInput(e.detail);
        });

        // Закрытие календаря по клавише Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCalendar();
            }
        });

        // Обработчики календаря
        const calendarClose = document.getElementById('calendarClose');
        if (calendarClose) {
            calendarClose.addEventListener('click', () => this.closeCalendar());
        }

        const calendarPrev = document.getElementById('calendarPrev');
        if (calendarPrev) {
            calendarPrev.addEventListener('click', () => this.changeMonth(-1));
        }

        const calendarNext = document.getElementById('calendarNext');
        if (calendarNext) {
            calendarNext.addEventListener('click', () => this.changeMonth(1));
        }

        const calendarToday = document.getElementById('calendarToday');
        if (calendarToday) {
            calendarToday.addEventListener('click', () => this.setToday());
        }

        const calendarClear = document.getElementById('calendarClear');
        if (calendarClear) {
            calendarClear.addEventListener('click', () => this.clearDate());
        }

        const calendarConfirm = document.getElementById('calendarConfirm');
        if (calendarConfirm) {
            calendarConfirm.addEventListener('click', () => this.closeCalendar());
        }

        // Закрытие календаря по клику на фон
        const calendarModal = document.getElementById('calendarModal');
        if (calendarModal) {
            calendarModal.addEventListener('click', (e) => {
                if (e.target === calendarModal) {
                    this.closeCalendar();
                }
            });
        }
    }

    openForMainForm() {
        this.currentPlanDateInput = null;
        this.currentRealPlanDateInput = null;
        this.openCalendar();
    }

    openForOtherInput(detail) {
        this.currentPlanDateInput = document.getElementById(detail.targetInput);
        this.currentRealPlanDateInput = document.getElementById(detail.targetRealInput);
        this.openCalendar();
    }

    openCalendar() {
        const calendarModal = document.getElementById('calendarModal');
        if (calendarModal) {
            calendarModal.classList.add('active');
            this.currentSelectedDate = new Date();
            this.renderCalendar();
            document.body.style.overflow = 'hidden';
        }
    }

    closeCalendar() {
        const calendarModal = document.getElementById('calendarModal');
        if (calendarModal) {
            calendarModal.classList.remove('active');
            document.body.style.overflow = '';
            
            this.currentPlanDateInput = null;
            this.currentRealPlanDateInput = null;
        }
    }

    renderCalendar() {
        const calendarDays = document.getElementById('calendarDays');
        const calendarTitle = document.getElementById('calendarTitle');
        
        if (!calendarDays || !calendarTitle) return;
        
        const year = this.currentSelectedDate.getFullYear();
        const month = this.currentSelectedDate.getMonth();
        
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        calendarTitle.textContent = `${monthNames[month]} ${year}`;
        
        calendarDays.innerHTML = '';
        
        const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        dayNames.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day-name';
            dayElement.textContent = day;
            calendarDays.appendChild(dayElement);
        });
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        let startDay = firstDay.getDay();
        if (startDay === 0) startDay = 7;
        startDay -= 1;
        
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDay - 1; i >= 0; i--) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = prevMonthLastDay - i;
            calendarDays.appendChild(dayElement);
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let currentDateValue = null;
        if (this.currentPlanDateInput && this.currentRealPlanDateInput) {
            currentDateValue = this.currentRealPlanDateInput.value;
        } else {
            const realDateInput = document.getElementById('realDateInput');
            currentDateValue = realDateInput ? realDateInput.value : null;
        }
        
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayDate = new Date(year, month, day);
            dayDate.setHours(0, 0, 0, 0);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            // Форматируем дату в YYYY-MM-DD без учета часового пояса
            const dateYear = dayDate.getFullYear();
            const dateMonth = String(dayDate.getMonth() + 1).padStart(2, '0');
            const dateDay = String(dayDate.getDate()).padStart(2, '0');
            dayElement.dataset.date = `${dateYear}-${dateMonth}-${dateDay}`;
            dayElement.setAttribute('role', 'button');
            dayElement.setAttribute('tabindex', '0');
            
            if (dayDate.getTime() === today.getTime()) {
                dayElement.classList.add('today');
            }
            
            if (currentDateValue) {
                const selectedDate = Utils.parseDate(currentDateValue);
                selectedDate.setHours(0, 0, 0, 0);
                
                if (dayDate.getTime() === selectedDate.getTime()) {
                    dayElement.classList.add('selected');
                }
            }
            
            dayElement.addEventListener('click', () => this.selectDate(dayDate));
            
            dayElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.selectDate(dayDate);
                }
            });
            
            calendarDays.appendChild(dayElement);
        }
    }

    selectDate(date) {
        const formattedDate = date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        // Форматируем дату в YYYY-MM-DD без учета часового пояса
        const dateYear = date.getFullYear();
        const dateMonth = String(date.getMonth() + 1).padStart(2, '0');
        const dateDay = String(date.getDate()).padStart(2, '0');
        const dateString = `${dateYear}-${dateMonth}-${dateDay}`;
        
        if (this.currentPlanDateInput && this.currentRealPlanDateInput) {
            this.currentPlanDateInput.value = formattedDate;
            this.currentRealPlanDateInput.value = dateString;
        } else {
            const dateInput = document.getElementById('dateInput');
            const realDateInput = document.getElementById('realDateInput');
            
            if (dateInput) {
                dateInput.value = formattedDate;
            }
            if (realDateInput) {
                realDateInput.value = dateString;
            }
        }
        
        this.closeCalendar();
    }

    changeMonth(direction) {
        const newDate = new Date(this.currentSelectedDate);
        newDate.setMonth(newDate.getMonth() + direction);
        this.currentSelectedDate = newDate;
        this.renderCalendar();
    }

    setToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.selectDate(today);
        this.currentSelectedDate = today;
        this.renderCalendar();
    }

    clearDate() {
        if (this.currentPlanDateInput && this.currentRealPlanDateInput) {
            this.currentPlanDateInput.value = '';
            this.currentRealPlanDateInput.value = '';
        } else {
            const dateInput = document.getElementById('dateInput');
            const realDateInput = document.getElementById('realDateInput');
            
            if (dateInput) {
                dateInput.value = '';
            }
            if (realDateInput) {
                realDateInput.value = '';
            }
        }
        
        this.closeCalendar();
    }
}

export default CalendarModule;