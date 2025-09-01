class SimpleSPA {
  constructor() {
    this.content = document.getElementById('content');
    this.buttons = document.querySelectorAll('.nav-btn');
    this.currentPage = 'main';
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.buttons.forEach(button => {
      button.addEventListener('click', () => {
        const page = button.dataset.page;
        if (page !== this.currentPage) {
          this.loadPage(page);
        }
      });
    });
  }

  async loadPage(pageName) {
    try {
      // Обновляем активную кнопку
      this.updateActiveButton(pageName);
      
      // Если главная страница - показываем встроенный контент
      if (pageName === 'main') {
        this.content.innerHTML = `
          <div class="page-content">
            <h1>Добро пожаловать на главную страницу</h1>
            <p>Это стартовая страница моего проекта.</p>
          </div>
        `;
        this.currentPage = 'main';
        return;
      }

      // Загружаем дополнительную страницу
      const response = await fetch(`${pageName}.html`);
      
      if (!response.ok) {
        throw new Error('Страница не найдена');
      }
      
      const html = await response.text();
      this.content.innerHTML = html;
      this.currentPage = pageName;
      
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      this.content.innerHTML = `
        <div class="page-content">
          <h1>Ошибка</h1>
          <p>Не удалось загрузить страницу. Попробуйте позже.</p>
        </div>
      `;
    }
  }

  updateActiveButton(pageName) {
    this.buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === pageName);
    });
  }
}

// Запускаем приложение когда страница загрузится
document.addEventListener('DOMContentLoaded', () => {
  new SimpleSPA();
});