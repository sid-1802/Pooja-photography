// Filters module
const filtersContainer = document.getElementById('filters');

// Initialize filter buttons
function initFilters(categories) {
  // Create filter buttons
  let buttonsHtml = '<button class="filter-btn active" data-category="all">All</button>';
  
  // Sort categories by order
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
  
  sortedCategories.forEach(category => {
    buttonsHtml += `<button class="filter-btn" data-category="${category.id}">${escapeHtml(category.name)}</button>`;
  });
  
  filtersContainer.innerHTML = buttonsHtml;
  
  // Add click handlers
  filtersContainer.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filterByCategory(btn.dataset.category);
    });
  });
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Handle URL hash changes
window.addEventListener('hashchange', () => {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#category=')) {
    const categoryId = hash.split('=')[1];
    filterByCategory(categoryId);
  } else if (!hash) {
    filterByCategory('all');
  }
});
