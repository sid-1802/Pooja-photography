// Gallery state
let allPhotos = [];
let filteredPhotos = [];
let categories = [];

// DOM elements
const galleryEl = document.getElementById('gallery');
const emptyStateEl = document.getElementById('empty-state');

// Initialize gallery
async function initGallery() {
  try {
    // Fetch photos and categories in parallel
    const [photosRes, categoriesRes, configRes] = await Promise.all([
      fetch('/api/photos'),
      fetch('/api/categories'),
      fetch('/api/config')
    ]);
    
    allPhotos = await photosRes.json();
    categories = await categoriesRes.json();
    const config = await configRes.json();
    
    // Update site title
    document.querySelector('.site-title').textContent = config.siteName;
    document.title = config.siteName;
    
    // Render social links
    renderSocialLinks(config.socialLinks || {});
    
    // Initialize filters
    initFilters(categories);
    
    // Check for category in URL hash
    const hash = window.location.hash;
    if (hash && hash.startsWith('#category=')) {
      const categoryId = hash.split('=')[1];
      filterByCategory(categoryId);
    } else {
      filteredPhotos = [...allPhotos];
      renderGallery();
    }
    
    // Initialize collapsible contact
    initContactCollapse();
  } catch (err) {
    console.error('Failed to load gallery:', err);
    galleryEl.innerHTML = '<div class="loading">Failed to load photos. Please try again.</div>';
  }
}

// Initialize collapsible contact section
function initContactCollapse() {
  const header = document.getElementById('contact-header');
  const links = document.getElementById('social-links');
  const toggle = document.getElementById('contact-toggle');
  
  let isCollapsed = false;
  
  header.addEventListener('click', () => {
    isCollapsed = !isCollapsed;
    links.classList.toggle('collapsed', isCollapsed);
    toggle.classList.toggle('collapsed', isCollapsed);
  });
}

// Render social links
function renderSocialLinks(social) {
  const container = document.getElementById('social-links');
  if (!container) return;
  
  let html = '';
  
  if (social.phone) {
    const phoneClean = social.phone.replace(/\s+/g, '');
    html += `<a href="tel:${phoneClean}" class="social-btn social-phone" title="Call Me">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
      <span>Call Me</span>
    </a>`;
  }
  
  if (social.whatsapp) {
    const waNumber = social.whatsapp.replace(/\s+/g, '').replace('+', '');
    html += `<a href="https://wa.me/${waNumber}" target="_blank" class="social-btn social-whatsapp" title="WhatsApp">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      <span>WhatsApp</span>
    </a>`;
  }
  
  if (social.instagram) {
    html += `<a href="${escapeHtml(social.instagram)}" target="_blank" class="social-btn social-instagram" title="Instagram">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
      <span>Instagram</span>
    </a>`;
  }
  
  if (social.youtube) {
    html += `<a href="${escapeHtml(social.youtube)}" target="_blank" class="social-btn social-youtube" title="YouTube">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
      <span>YouTube</span>
    </a>`;
  }
  
  if (social.linkedin) {
    html += `<a href="${escapeHtml(social.linkedin)}" target="_blank" class="social-btn social-linkedin" title="LinkedIn">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      <span>LinkedIn</span>
    </a>`;
  }
  
  if (html) {
    container.innerHTML = html;
    document.getElementById('contact-section').style.display = 'block';
  } else {
    document.getElementById('contact-section').style.display = 'none';
  }
}

// Get random size class for masonry effect
function getRandomSizeClass(index) {
  // Create a pattern that looks good
  const patterns = [
    '', '', 'size-tall', '', 'size-wide', '', 
    'size-large', '', '', 'size-tall', '', ''
  ];
  return patterns[index % patterns.length];
}

// Render gallery
function renderGallery() {
  if (filteredPhotos.length === 0) {
    galleryEl.innerHTML = '';
    emptyStateEl.style.display = 'block';
    return;
  }
  
  emptyStateEl.style.display = 'none';
  
  galleryEl.innerHTML = filteredPhotos.map((photo, index) => {
    const category = categories.find(c => c.id === photo.category);
    const sizeClass = getRandomSizeClass(index);
    return `
      <div class="gallery-item ${sizeClass}" data-index="${index}">
        <img src="${photo.thumbnailUrl}" alt="${photo.title || 'Photo'}" loading="lazy">
        <div class="gallery-item-info">
          ${photo.title ? `<h3 class="gallery-item-title">${escapeHtml(photo.title)}</h3>` : ''}
          ${category ? `<span class="gallery-item-category">${escapeHtml(category.name)}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  // Add click handlers
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.dataset.index);
      openLightbox(index);
    });
  });
}

// Filter by category
function filterByCategory(categoryId) {
  if (categoryId === 'all') {
    filteredPhotos = [...allPhotos];
    window.location.hash = '';
  } else {
    filteredPhotos = allPhotos.filter(p => p.category === categoryId);
    window.location.hash = `category=${categoryId}`;
  }
  
  // Update active filter button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === categoryId);
  });
  
  renderGallery();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export for other modules
window.galleryState = {
  get photos() { return filteredPhotos; },
  get allPhotos() { return allPhotos; },
  get categories() { return categories; }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', initGallery);
