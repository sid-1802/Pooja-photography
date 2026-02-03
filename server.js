const express = require('express');
const session = require('express-session');
const multer = require('multer');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Helper functions for reading/writing JSON
function readJSON(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (err) {
    return null;
  }
}

function writeJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// Load config
let config = readJSON(CONFIG_FILE) || { adminPassword: '', sessionSecret: crypto.randomBytes(32).toString('hex'), siteName: 'Photography Portfolio' };

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));

// Session middleware
app.use(session({
  secret: config.sessionSecret || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: false
  }
}));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(UPLOADS_DIR, 'originals'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + crypto.randomBytes(6).toString('hex') + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
  }
});

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

// Generate watermark SVG
function createWatermarkSvg(text, width, height) {
  const fontSize = Math.max(20, Math.min(width, height) * 0.05);
  return Buffer.from(`
    <svg width="${width}" height="${height}">
      <style>
        .watermark { 
          fill: rgba(255, 255, 255, 0.5); 
          font-size: ${fontSize}px; 
          font-family: Arial, sans-serif;
          font-weight: bold;
        }
      </style>
      <text x="50%" y="95%" text-anchor="middle" class="watermark">${text}</text>
    </svg>
  `);
}

// Generate thumbnail with watermark
async function generateThumbnail(originalPath, filename) {
  const thumbnailPath = path.join(UPLOADS_DIR, 'thumbnails', filename);
  const config = readJSON(CONFIG_FILE) || {};
  const watermarkText = config.siteName || 'Pooja Photography';
  
  const watermarkSvg = createWatermarkSvg(watermarkText, 400, 400);
  
  await sharp(originalPath)
    .resize(400, 400, { fit: 'cover' })
    .composite([{
      input: watermarkSvg,
      gravity: 'center'
    }])
    .jpeg({ quality: 80 })
    .toFile(thumbnailPath);
  return thumbnailPath;
}

// Generate watermarked version for display
async function generateWatermarked(originalPath, filename) {
  const watermarkedPath = path.join(UPLOADS_DIR, 'watermarked', filename);
  const config = readJSON(CONFIG_FILE) || {};
  const watermarkText = config.siteName || 'Pooja Photography';
  
  const metadata = await sharp(originalPath).metadata();
  const watermarkSvg = createWatermarkSvg(watermarkText, metadata.width, metadata.height);
  
  await sharp(originalPath)
    .composite([{
      input: watermarkSvg,
      gravity: 'center'
    }])
    .jpeg({ quality: 85 })
    .toFile(watermarkedPath);
  return watermarkedPath;
}

// Generate unique ID
function generateId() {
  return crypto.randomBytes(8).toString('hex');
}

// ============ PUBLIC API ROUTES ============

// Get all photos
app.get('/api/photos', (req, res) => {
  const data = readJSON(PHOTOS_FILE) || { photos: [] };
  let photos = data.photos;
  
  // Filter by category if provided
  if (req.query.category) {
    photos = photos.filter(p => p.category === req.query.category);
  }
  
  // Add URLs to photos (serve watermarked versions to public)
  photos = photos.map(photo => ({
    ...photo,
    thumbnailUrl: `/uploads/thumbnails/${photo.filename}`,
    originalUrl: `/uploads/watermarked/${photo.filename}`
  }));
  
  res.json(photos);
});

// Get all categories
app.get('/api/categories', (req, res) => {
  const data = readJSON(CATEGORIES_FILE) || { categories: [] };
  res.json(data.categories);
});

// ============ ADMIN AUTH ROUTES ============

// Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    config = readJSON(CONFIG_FILE);
    
    if (!config || !config.adminPassword || !config.adminUsername) {
      return res.status(500).json({ error: 'Admin not configured. Run setup first.' });
    }
    
    const isUsernameValid = username === config.adminUsername;
    const isPasswordValid = await bcrypt.compare(password, config.adminPassword);
    
    if (isUsernameValid && isPasswordValid) {
      req.session.authenticated = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Check auth status
app.get('/api/admin/check', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.authenticated) });
});

// ============ ADMIN PHOTO ROUTES ============

// Upload photo(s)
app.post('/api/admin/photos', requireAuth, upload.array('photos', 10), async (req, res) => {
  try {
    const data = readJSON(PHOTOS_FILE) || { photos: [] };
    const uploadedPhotos = [];
    
    for (const file of req.files) {
      // Generate thumbnail with watermark
      await generateThumbnail(file.path, file.filename);
      
      // Generate watermarked version for display
      await generateWatermarked(file.path, file.filename);
      
      // Get image dimensions
      const metadata = await sharp(file.path).metadata();
      
      const photo = {
        id: generateId(),
        filename: file.filename,
        originalName: file.originalname,
        title: req.body.title || '',
        description: req.body.description || '',
        category: req.body.category || '',
        tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
        uploadDate: new Date().toISOString(),
        dimensions: {
          width: metadata.width,
          height: metadata.height
        }
      };
      
      data.photos.push(photo);
      uploadedPhotos.push({
        ...photo,
        thumbnailUrl: `/uploads/thumbnails/${photo.filename}`,
        originalUrl: `/uploads/watermarked/${photo.filename}`
      });
    }
    
    writeJSON(PHOTOS_FILE, data);
    res.json({ success: true, photos: uploadedPhotos });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload photos' });
  }
});

// Update photo metadata
app.put('/api/admin/photos/:id', requireAuth, (req, res) => {
  try {
    const data = readJSON(PHOTOS_FILE) || { photos: [] };
    const photoIndex = data.photos.findIndex(p => p.id === req.params.id);
    
    if (photoIndex === -1) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    const { title, description, category, tags } = req.body;
    
    if (title !== undefined) data.photos[photoIndex].title = title;
    if (description !== undefined) data.photos[photoIndex].description = description;
    if (category !== undefined) data.photos[photoIndex].category = category;
    if (tags !== undefined) {
      data.photos[photoIndex].tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    }
    
    writeJSON(PHOTOS_FILE, data);
    
    const photo = data.photos[photoIndex];
    res.json({
      success: true,
      photo: {
        ...photo,
        thumbnailUrl: `/uploads/thumbnails/${photo.filename}`,
        originalUrl: `/uploads/originals/${photo.filename}`
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update photo' });
  }
});

// Delete photo
app.delete('/api/admin/photos/:id', requireAuth, (req, res) => {
  try {
    const data = readJSON(PHOTOS_FILE) || { photos: [] };
    const photoIndex = data.photos.findIndex(p => p.id === req.params.id);
    
    if (photoIndex === -1) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    const photo = data.photos[photoIndex];
    
    // Delete files
    const originalPath = path.join(UPLOADS_DIR, 'originals', photo.filename);
    const thumbnailPath = path.join(UPLOADS_DIR, 'thumbnails', photo.filename);
    const watermarkedPath = path.join(UPLOADS_DIR, 'watermarked', photo.filename);
    
    if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
    if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);
    if (fs.existsSync(watermarkedPath)) fs.unlinkSync(watermarkedPath);
    
    // Remove from data
    data.photos.splice(photoIndex, 1);
    writeJSON(PHOTOS_FILE, data);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// ============ ADMIN CATEGORY ROUTES ============

// Create category
app.post('/api/admin/categories', requireAuth, (req, res) => {
  try {
    const data = readJSON(CATEGORIES_FILE) || { categories: [] };
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const category = {
      id: generateId(),
      name,
      slug,
      order: data.categories.length
    };
    
    data.categories.push(category);
    writeJSON(CATEGORIES_FILE, data);
    
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
app.put('/api/admin/categories/:id', requireAuth, (req, res) => {
  try {
    const data = readJSON(CATEGORIES_FILE) || { categories: [] };
    const catIndex = data.categories.findIndex(c => c.id === req.params.id);
    
    if (catIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const { name, order } = req.body;
    
    if (name !== undefined) {
      data.categories[catIndex].name = name;
      data.categories[catIndex].slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (order !== undefined) data.categories[catIndex].order = order;
    
    writeJSON(CATEGORIES_FILE, data);
    res.json({ success: true, category: data.categories[catIndex] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
app.delete('/api/admin/categories/:id', requireAuth, (req, res) => {
  try {
    const photosData = readJSON(PHOTOS_FILE) || { photos: [] };
    const hasPhotos = photosData.photos.some(p => p.category === req.params.id);
    
    if (hasPhotos) {
      return res.status(400).json({ error: 'Cannot delete category with photos. Reassign photos first.' });
    }
    
    const data = readJSON(CATEGORIES_FILE) || { categories: [] };
    const catIndex = data.categories.findIndex(c => c.id === req.params.id);
    
    if (catIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    data.categories.splice(catIndex, 1);
    writeJSON(CATEGORIES_FILE, data);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Get site config (public)
app.get('/api/config', (req, res) => {
  const config = readJSON(CONFIG_FILE) || {};
  res.json({ 
    siteName: config.siteName || 'Photography Portfolio',
    socialLinks: config.socialLinks || {}
  });
});

// Update site settings (admin)
app.put('/api/admin/settings', requireAuth, (req, res) => {
  try {
    const config = readJSON(CONFIG_FILE) || {};
    const { siteName, socialLinks } = req.body;
    
    if (siteName !== undefined) config.siteName = siteName;
    if (socialLinks !== undefined) config.socialLinks = socialLinks;
    
    writeJSON(CONFIG_FILE, config);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get full settings (admin only)
app.get('/api/admin/settings', requireAuth, (req, res) => {
  const config = readJSON(CONFIG_FILE) || {};
  res.json({
    siteName: config.siteName || 'Photography Portfolio',
    socialLinks: config.socialLinks || {}
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  res.status(500).json({ error: err.message || 'Something went wrong' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin.html`);
});
