// Lightbox state
let currentIndex = 0;
let touchStartX = 0;
let touchEndX = 0;

// DOM elements
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxDescription = document.getElementById('lightbox-description');
const lightboxTags = document.getElementById('lightbox-tags');
const closeBtn = document.getElementById('lightbox-close');
const prevBtn = document.getElementById('lightbox-prev');
const nextBtn = document.getElementById('lightbox-next');

// Open lightbox
function openLightbox(index) {
  currentIndex = index;
  showPhoto(currentIndex);
  lightbox.classList.add('active');
  document.body.classList.add('lightbox-open');
}

// Close lightbox
function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.classList.remove('lightbox-open');
}

// Show photo at index
function showPhoto(index) {
  const photos = window.galleryState.photos;
  if (!photos || photos.length === 0) return;
  
  // Wrap around
  if (index < 0) index = photos.length - 1;
  if (index >= photos.length) index = 0;
  currentIndex = index;
  
  const photo = photos[currentIndex];
  
  // Set image
  lightboxImage.src = photo.originalUrl;
  lightboxImage.alt = photo.title || 'Photo';
  
  // Set title
  lightboxTitle.textContent = photo.title || '';
  lightboxTitle.style.display = photo.title ? 'block' : 'none';
  
  // Set description
  lightboxDescription.textContent = photo.description || '';
  lightboxDescription.style.display = photo.description ? 'block' : 'none';
  
  // Set tags
  if (photo.tags && photo.tags.length > 0) {
    lightboxTags.innerHTML = photo.tags.map(tag => 
      `<span class="lightbox-tag">${escapeHtml(tag)}</span>`
    ).join('');
    lightboxTags.style.display = 'flex';
  } else {
    lightboxTags.style.display = 'none';
  }
  
  // Update navigation visibility
  const showNav = photos.length > 1;
  prevBtn.style.display = showNav ? 'block' : 'none';
  nextBtn.style.display = showNav ? 'block' : 'none';
}

// Navigate to previous photo
function showPrev() {
  showPhoto(currentIndex - 1);
}

// Navigate to next photo
function showNext() {
  showPhoto(currentIndex + 1);
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Event listeners
closeBtn.addEventListener('click', closeLightbox);
prevBtn.addEventListener('click', showPrev);
nextBtn.addEventListener('click', showNext);

// Close on overlay click
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    closeLightbox();
  }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  
  switch (e.key) {
    case 'Escape':
      closeLightbox();
      break;
    case 'ArrowLeft':
      showPrev();
      break;
    case 'ArrowRight':
      showNext();
      break;
  }
});

// Touch swipe support
lightbox.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

lightbox.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, { passive: true });

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;
  
  if (Math.abs(diff) < swipeThreshold) return;
  
  if (diff > 0) {
    // Swipe left - next
    showNext();
  } else {
    // Swipe right - prev
    showPrev();
  }
}

// Export for gallery.js
window.openLightbox = openLightbox;
