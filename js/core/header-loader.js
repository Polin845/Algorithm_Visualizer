function loadHeader() {
  const placeholder = document.getElementById('header-placeholder');
  if (!placeholder) return;

  // header.html в той же папке, что и текущая страница
  // Поэтому путь просто "header.html"
  const path = 'header.html';

  console.log('Loading header from:', path);

  fetch(path)
    .then(response => {
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      placeholder.innerHTML = html;
      highlightCurrentPage();
    })
    .catch(err => console.warn('Header not loaded:', err));
}

function highlightCurrentPage() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  // ДАЙ ЗАДЕРЖКУ, чтобы DOM точно обновился после вставки шапки
  setTimeout(() => {
    const links = document.querySelectorAll('#mainNav .nav-link');
    console.log('Found links:', links.length); // Проверяем, нашли ли ссылки
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      console.log('Link href:', href, 'Current page:', currentPage);
      if (href === currentPage) {
        link.classList.add('active');
      }
    });
  }, 100); // Небольшая задержка
}

// Загружаем шапку когда страница готова
document.addEventListener('DOMContentLoaded', loadHeader);