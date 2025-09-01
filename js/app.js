class SPA {
  constructor() {
    this.content = document.getElementById("content");
    this.loading = document.getElementById("loading");
    this.buttons = document.querySelectorAll(".nav-btn");
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupNavigationState();
  }

  setupEventListeners() {
    this.buttons.forEach(button => {
      button.addEventListener("click", (e) => {
        this.handleNavigation(e.target);
      });
    });

    // Обработка кнопок браузера вперед/назад
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.file) {
        this.loadContent(e.state.file, false);
        this.updateActiveButton(e.state.file);
      }
    });
  }

  setupNavigationState() {
    // Восстановление состояния при загрузке страницы
    const path = window.location.pathname;
    if (path !== '/') {
      const file = path.split('/').pop();
      this.loadContent(file, false);
      this.updateActiveButton(file);
    }
  }

  async handleNavigation(button) {
    const file = button.dataset.file;
    this.updateActiveButton(file);
    this.loadContent(file, true);
  }

  updateActiveButton(file) {
    this.buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.file === file);
    });
  }

  async loadContent(file, pushState = true) {
    this.showLoading();
    
    try {
      const response = await fetch(file);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const html = await response.text();
      
      setTimeout(() => {
        this.content.innerHTML = html;
        this.hideLoading();
        
        if (pushState) {
          window.history.pushState({ file }, '', `/${file}`);
        }
        
        // Прокрутка к верху контента
        this.content.scrollIntoView({ behavior: 'smooth' });
      }, 300); // Небольшая задержка для плавности анимации
      
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      this.content.innerHTML = `
        <div class="error-message">
          <h2>Ошибка загрузки</h2>
          <p>Не удалось загрузить содержимое. Пожалуйста, попробуйте позже.</p>
        </div>
      `;
      this.hideLoading();
    }
  }

  showLoading() {
    this.loading.style.display = 'block';
  }

  hideLoading() {
    this.loading.style.display = 'none';
  }
}

// Инициализация приложения когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
  new SPA();
});