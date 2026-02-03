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
- 💾 **File-Based Data Storage** - Store portfolio data in JSON files
- 🔄 **Data Persistence** - Automatic loading from local files or localStorage
- 📤 **Export/Import** - Export your portfolio data as JSON files for GitHub commits

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
1. **Via Admin Panel**: Log in and use the "Add Photo" feature
2. **Via File Upload**: Upload directly from your computer
3. **Bulk Import**: Use the "Import Data" feature to load JSON files

### Data Files Structure
The portfolio automatically loads data from these JSON files:
- `portfolio-photos.json` - Photo collection
- `portfolio-categories.json` - Category definitions
- `portfolio-complete-data.json` - All data in one file

You can edit these files directly or use the admin panel export feature.

### Change Colors
Modify the color scheme in `photography-styles.css`:
- Accent color: Change `#ff6b6b` to your preferred color
- Background colors: Modify `#1a1a1a` and `#2d2d2d`
- Text colors: Adjust `#fff`, `#ddd`, `#aaa`

### Add New Categories
1. **Via Admin Panel**: Use the "Manage Categories" feature
2. **Via JSON Files**: Edit `portfolio-categories.json` directly
3. **Manual HTML**: Add button in the sidebar:
```html
<button class="category-btn" data-category="new-category">New Category</button>
```

### Export Your Data
1. Log in to admin panel
2. Click "Export Data"
3. Download JSON files
4. Commit files to your GitHub repository
5. Data will automatically load for all visitors

## Deployment

The site automatically deploys to GitHub Pages when you push changes to the main branch. Data persistence works through:

1. **localStorage** - For admin session data
2. **JSON Files** - For permanent portfolio data

### Data Management Workflow
1. Add/edit content using admin panel
2. Export data as JSON files
3. Commit JSON files to GitHub
4. Visitors automatically see your content

### Local Development
To preview locally:
```bash
npx serve .
```
Then visit `http://localhost:3000`

### GitHub Pages Setup
1. Push all files including JSON data files
2. Enable GitHub Pages in repository settings
3. Data loads automatically from JSON files

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

Tested on desktop and mobile devices.

## License

MIT License - feel free to use this template for your photography portfolio!