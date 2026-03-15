class NavigationManager {
  constructor() {
    this.algorithms = [
      { name: 'Graph Traversals', path: 'graph.html', icon: '🔍' },
      { name: 'Counting Sort', path: 'counting.html', icon: '📊' },
      { name: 'Ford-Fulkerson', path: 'ford-fulkerson.html', icon: '🌊' },
      { name: 'KMP Search', path: 'kmp.html', icon: '🔎' }
    ];
    
    this.currentPath = this.getCurrentPage();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    // Получаем только имя файла
    return path.split('/').pop() || 'index.html';
  }

  renderNav(container) {
    const nav = document.createElement('nav');
    nav.className = 'nav';
    
    // Определяем, в какой папке мы находимся
    const isInPages = window.location.pathname.includes('/pages/');
    
    this.algorithms.forEach(algo => {
      const link = document.createElement('a');
      
      // Формируем правильный путь в зависимости от текущей папки
      if (isInPages) {
        // Если мы уже в папке pages, то ссылка просто на файл
        link.href = algo.path;
      } else {
        // Если мы в корне, то добавляем pages/
        link.href = `pages/${algo.path}`;
      }
      
      link.className = 'nav-link';
      link.innerHTML = `${algo.icon} ${algo.name}`;
      
      // Проверяем активность
      if (this.currentPath === algo.path) {
        link.classList.add('nav-link--active');
      }
      
      nav.appendChild(link);
    });
    
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    
    if (container) {
      container.innerHTML = '';
      container.appendChild(nav);
    }
    
    return nav;
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  const navContainer = document.querySelector('.nav-container');
  if (navContainer) {
    const navManager = new NavigationManager();
    navManager.renderNav(navContainer);
  }
});