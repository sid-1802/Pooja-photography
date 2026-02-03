// Admin state
let isAuthenticated = false;
let photos = [];
let categories = [];
let pendingFiles = [];

// DOM elements
const loginContainer = document.getElementById('login-container');
const adminDashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

// Check authentication on load
async function checkAuth() {
  try {
    const res = await fetch('/api/admin/check');
    const data = await res.json();
    isAuthenticated = data.authenticated;
    
    if (isAuthenticated) {
      showDashboard();
    } else {
      showLogin();
    }
  } catch (err) {
    showLogin();
  }
}

function showLogin() {
  loginContainer.style.display = 'flex';
  adminDashboard.style.display = 'none';
}

function showDashboard() {
  loginContainer.style.display = 'none';
  adminDashboard.style.display = 'flex';
  loadData();
}

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    
    if (res.ok && data.success) {
      isAuthenticated = true;
      showDashboard();
    } else {
      loginError.textContent = data.error || 'Login failed';
    }
  } catch (err) {
    loginError.textContent = 'Connection error. Please try again.';
  }
});

// Logout
logoutBtn.addEventListener('click', async () => {
  try {
    await fetch('/api/admin/logout', { method: 'POST' });
  } catch (err) {
    // Ignore errors
  }
  isAuthenticated = false;
  showLogin();
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
});

// Load data
async function loadData() {
  try {
    const [photosRes, categoriesRes, settingsRes] = await Promise.all([
      fetch('/api/photos'),
      fetch('/api/categories'),
      fetch('/api/admin/settings')
    ]);
    
    photos = await photosRes.json();
    categories = await categoriesRes.json();
    const settings = await settingsRes.json();
    
    renderPhotos();
    renderCategories();
    updateCategorySelects();
    loadSettings(settings);
  } catch (err) {
    console.error('Failed to load data:', err);
  }
}

// ============ TABS ============
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;
    
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
  });
});

// ============ UPLOAD ============
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');
const uploadPreview = document.getElementById('upload-preview');
const uploadOptions = document.getElementById('upload-options');
const uploadBtn = document.getElementById('upload-btn');

uploadZone.addEventListener('click', () => fileInput.click());

uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', () => {
  handleFiles(fileInput.files);
});

function handleFiles(files) {
  const newFiles = Array.from(files).filter(f => 
    f.type.match(/^image\/(jpeg|png|webp)$/) && f.size <= 10 * 1024 * 1024
  );
  
  pendingFiles = [...pendingFiles, ...newFiles];
  renderPreviews();
}

function renderPreviews() {
  if (pendingFiles.length === 0) {
    uploadPreview.innerHTML = '';
    uploadOptions.style.display = 'none';
    return;
  }
  
  uploadOptions.style.display = 'flex';
  
  uploadPreview.innerHTML = pendingFiles.map((file, index) => {
    const url = URL.createObjectURL(file);
    return `
      <div class="preview-item">
        <img src="${url}" alt="${escapeHtml(file.name)}">
        <button class="preview-remove" data-index="${index}">&times;</button>
      </div>
    `;
  }).join('');
  
  // Add remove handlers
  uploadPreview.querySelectorAll('.preview-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      pendingFiles.splice(index, 1);
      renderPreviews();
    });
  });
}

uploadBtn.addEventListener('click', async () => {
  if (pendingFiles.length === 0) return;
  
  uploadBtn.disabled = true;
  uploadBtn.textContent = 'Uploading...';
  
  const formData = new FormData();
  pendingFiles.forEach(file => formData.append('photos', file));
  
  const category = document.getElementById('upload-category').value;
  if (category) formData.append('category', category);
  
  try {
    const res = await fetch('/api/admin/photos', {
      method: 'POST',
      body: formData
    });
    
    if (res.ok) {
      const data = await res.json();
      photos = [...data.photos, ...photos];
      pendingFiles = [];
      renderPreviews();
      renderPhotos();
    } else {
      const data = await res.json();
      alert(data.error || 'Upload failed');
    }
  } catch (err) {
    alert('Upload failed. Please try again.');
  }
  
  uploadBtn.disabled = false;
  uploadBtn.textContent = 'Upload Photos';
});

// ============ PHOTOS ============
const photoGrid = document.getElementById('photo-grid');

function renderPhotos() {
  if (photos.length === 0) {
    photoGrid.innerHTML = '<div class="empty-message">No photos yet. Upload some above!</div>';
    return;
  }
  
  photoGrid.innerHTML = photos.map(photo => {
    const category = categories.find(c => c.id === photo.category);
    return `
      <div class="photo-card">
        <div class="photo-card-image">
          <img src="${photo.thumbnailUrl}" alt="${escapeHtml(photo.title || 'Photo')}">
        </div>
        <div class="photo-card-info">
          <h3 class="photo-card-title">${escapeHtml(photo.title || 'Untitled')}</h3>
          <p class="photo-card-meta">${category ? escapeHtml(category.name) : 'No category'}</p>
          <div class="photo-card-actions">
            <button class="btn btn-secondary btn-sm" onclick="editPhoto('${photo.id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deletePhoto('${photo.id}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Delete photo
async function deletePhoto(id) {
  if (!confirm('Are you sure you want to delete this photo?')) return;
  
  try {
    const res = await fetch(`/api/admin/photos/${id}`, { method: 'DELETE' });
    
    if (res.ok) {
      photos = photos.filter(p => p.id !== id);
      renderPhotos();
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to delete');
    }
  } catch (err) {
    alert('Failed to delete photo');
  }
}

// ============ EDIT MODAL ============
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const modalClose = document.getElementById('modal-close');
const cancelEdit = document.getElementById('cancel-edit');

function editPhoto(id) {
  const photo = photos.find(p => p.id === id);
  if (!photo) return;
  
  document.getElementById('edit-photo-id').value = photo.id;
  document.getElementById('edit-title').value = photo.title || '';
  document.getElementById('edit-description').value = photo.description || '';
  document.getElementById('edit-category').value = photo.category || '';
  document.getElementById('edit-tags').value = (photo.tags || []).join(', ');
  
  editModal.classList.add('active');
}

function closeModal() {
  editModal.classList.remove('active');
}

modalClose.addEventListener('click', closeModal);
cancelEdit.addEventListener('click', closeModal);

editModal.addEventListener('click', (e) => {
  if (e.target === editModal) closeModal();
});

editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('edit-photo-id').value;
  const data = {
    title: document.getElementById('edit-title').value,
    description: document.getElementById('edit-description').value,
    category: document.getElementById('edit-category').value,
    tags: document.getElementById('edit-tags').value
  };
  
  try {
    const res = await fetch(`/api/admin/photos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (res.ok) {
      const result = await res.json();
      const index = photos.findIndex(p => p.id === id);
      if (index !== -1) {
        photos[index] = result.photo;
      }
      renderPhotos();
      closeModal();
    } else {
      const result = await res.json();
      alert(result.error || 'Failed to update');
    }
  } catch (err) {
    alert('Failed to update photo');
  }
});

// ============ CATEGORIES ============
const categoryForm = document.getElementById('category-form');
const categoryList = document.getElementById('category-list');

function renderCategories() {
  if (categories.length === 0) {
    categoryList.innerHTML = '<div class="empty-message">No categories yet. Create one above!</div>';
    return;
  }
  
  categoryList.innerHTML = categories.map(cat => `
    <div class="category-item">
      <span class="category-item-name">${escapeHtml(cat.name)}</span>
      <div class="category-item-actions">
        <button class="btn btn-danger btn-sm" onclick="deleteCategory('${cat.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

categoryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const nameInput = document.getElementById('category-name');
  const name = nameInput.value.trim();
  
  if (!name) return;
  
  try {
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    
    if (res.ok) {
      const data = await res.json();
      categories.push(data.category);
      renderCategories();
      updateCategorySelects();
      nameInput.value = '';
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to create category');
    }
  } catch (err) {
    alert('Failed to create category');
  }
});

async function deleteCategory(id) {
  if (!confirm('Are you sure you want to delete this category?')) return;
  
  try {
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    
    if (res.ok) {
      categories = categories.filter(c => c.id !== id);
      renderCategories();
      updateCategorySelects();
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to delete');
    }
  } catch (err) {
    alert('Failed to delete category');
  }
}

function updateCategorySelects() {
  const options = '<option value="">No Category</option>' + 
    categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  
  document.getElementById('upload-category').innerHTML = options;
  document.getElementById('edit-category').innerHTML = options;
}

// ============ SETTINGS ============
const settingsForm = document.getElementById('settings-form');

function loadSettings(settings) {
  document.getElementById('site-name').value = settings.siteName || '';
  
  const social = settings.socialLinks || {};
  document.getElementById('phone-number').value = social.phone || '';
  document.getElementById('whatsapp-number').value = social.whatsapp || '';
  document.getElementById('instagram-url').value = social.instagram || '';
  document.getElementById('youtube-url').value = social.youtube || '';
  document.getElementById('linkedin-url').value = social.linkedin || '';
}

settingsForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const data = {
    siteName: document.getElementById('site-name').value,
    socialLinks: {
      phone: document.getElementById('phone-number').value.trim(),
      whatsapp: document.getElementById('whatsapp-number').value.trim(),
      instagram: document.getElementById('instagram-url').value.trim(),
      youtube: document.getElementById('youtube-url').value.trim(),
      linkedin: document.getElementById('linkedin-url').value.trim()
    }
  };
  
  try {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (res.ok) {
      alert('Settings saved successfully!');
    } else {
      const result = await res.json();
      alert(result.error || 'Failed to save settings');
    }
  } catch (err) {
    alert('Failed to save settings');
  }
});

// ============ UTILS ============
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Make functions global
window.editPhoto = editPhoto;
window.deletePhoto = deletePhoto;
window.deleteCategory = deleteCategory;

// Initialize
document.addEventListener('DOMContentLoaded', checkAuth);
