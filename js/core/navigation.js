/**
 * Управление навигацией между алгоритмами
 * Автоматически определяет текущую страницу и подсвечивает активную ссылку
 */

class NavigationManager {
  constructor() {
    this.algorithms = [
      { name: 'Graph Traversals', path: 'pages/graph.html', icon: '🔍' },
      { name: 'Counting Sort', path: 'pages/counting.html', icon: '📊' },
      { name: 'Ford-Fulkerson', path: 'pages/ford-fulkerson.html', icon: '🌊' }
    ];
    
    this.currentPath = this.getCurrentPage();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    return path.split('/').pop() || 'index.html';
  }

  renderNav(container) {
    const nav = document.createElement('nav');
    nav.className = 'nav';
    
    this.algorithms.forEach(algo => {
      const link = document.createElement('a');
      link.href = algo.path;
      link.className = 'nav-link';
      link.innerHTML = `${algo.icon} ${algo.name}`;
      
      // Проверяем, содержит ли текущий путь название файла
      if (this.currentPath.includes(algo.path.replace('pages/', ''))) {
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