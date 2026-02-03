# Pooja Photography Portfolio

A professional photography portfolio website with category filtering, responsive image gallery, and lightbox functionality. Built with HTML, CSS, and JavaScript for easy deployment to GitHub Pages.

## Features

- 📸 **Category Filtering** - Filter photos by categories (All, Baby Shoot, Wedding, Portrait, Recent)
- 🖼️ **Responsive Gallery** - Beautiful grid layout that adapts to all screen sizes
- 🔍 **Lightbox Viewer** - Click any image to view in fullscreen mode
- 🎨 **Dark Theme** - Professional dark interface perfect for photography portfolios
- 📱 **Mobile Friendly** - Fully responsive design for all devices
- ⚡ **Fast Loading** - No build process required, pure HTML/CSS/JS
- ☁️ **GitHub Pages Ready** - Zero configuration deployment

## Quick Start

1. **Fork this repository** to your GitHub account
2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Scroll down to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

3. **Customize your portfolio**:
   - Edit `index.html` to update your photographer name and bio
   - Replace placeholder images with your own photography
   - Add/remove categories in the sidebar
   - Modify `photography-styles.css` to change colors and styling

4. **View your live site**:
   - Your website will be available at: `https://yourusername.github.io/new-portfolio`
   - It may take a few minutes for GitHub Pages to deploy initially

## Structure

```
new-portfolio/
├── index.html              # Main HTML file with gallery
├── photography-styles.css  # Photography portfolio styling
├── styles.css             # Original portfolio styles (backup)
└── README.md              # This file
```

## Customization

### Update Photographer Information
Edit the content in `index.html`:
- Photographer name and business name
- Logo and tagline
- Categories in the sidebar
- Photo titles and descriptions

### Add Your Own Photos
Replace the placeholder Unsplash images:
```html
<img src="your-photo-url.jpg" alt="Photo description" class="photo-img">
```

### Change Colors
Modify the color scheme in `photography-styles.css`:
- Accent color: Change `#ff6b6b` to your preferred color
- Background colors: Modify `#1a1a1a` and `#2d2d2d`
- Text colors: Adjust `#fff`, `#ddd`, `#aaa`

### Add New Categories
1. Add a new button in the sidebar:
```html
<button class="category-btn" data-category="new-category">New Category</button>
```
2. Add photos with the matching data-category:
```html
<div class="photo-card" data-category="new-category">
    <!-- photo content -->
</div>
```

## Deployment

The site automatically deploys to GitHub Pages when you push changes to the main branch. No additional configuration needed.

### Local Development
To preview locally:
```bash
npx serve .
```
Then visit `http://localhost:3000`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

Tested on desktop and mobile devices.

## License

MIT License - feel free to use this template for your photography portfolio!