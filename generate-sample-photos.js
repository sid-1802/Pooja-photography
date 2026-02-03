const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Read current data
const categoriesPath = path.join(__dirname, 'data', 'categories.json');
const photosPath = path.join(__dirname, 'data', 'photos.json');

const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
const photos = JSON.parse(fs.readFileSync(photosPath, 'utf8'));

// Sample photo themes for different categories
const sampleThemes = {
    'baby-shoot': [
        { color: '#FFB6C1', text: 'Baby Smile' },
        { color: '#E6E6FA', text: 'Newborn' },
        { color: '#FFFACD', text: 'Little One' },
        { color: '#F0FFF0', text: 'Baby Love' },
        { color: '#FFE4E1', text: 'Precious' }
    ],
    'recent': [
        { color: '#87CEEB', text: 'Recent Work' },
        { color: '#98FB98', text: 'Latest' },
        { color: '#DDA0DD', text: 'New Photos' },
        { color: '#F0E68C', text: 'Fresh' },
        { color: '#FFA07A', text: 'Updated' }
    ],
    'wedding': [
        { color: '#FFF0F5', text: 'Wedding Day' },
        { color: '#E6E6FA', text: 'Love Story' },
        { color: '#FFE4E1', text: 'Happy Couple' },
        { color: '#F5DEB3', text: 'Forever' },
        { color: '#E0FFFF', text: 'Together' }
    ],
    'portrait': [
        { color: '#F5F5DC', text: 'Portrait' },
        { color: '#FFEBCD', text: 'Headshot' },
        { color: '#F0FFF0', text: 'Professional' },
        { color: '#E6E6FA', text: 'Character' },
        { color: '#FFFAF0', text: 'Expression' }
    ],
    'event': [
        { color: '#FFE4B5', text: 'Event' },
        { color: '#E0FFFF', text: 'Celebration' },
        { color: '#FFFACD', text: 'Party' },
        { color: '#F0FFF0', text: 'Gathering' },
        { color: '#F5F5F5', text: 'Memories' }
    ]
};

// Function to create a sample image
async function createSampleImage(filename, theme, width = 800, height = 600) {
    const outputPath = path.join(__dirname, 'public', 'uploads', filename);
    
    // Create gradient background
    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${theme.color};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${adjustColor(theme.color, -20)};stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grad)" />
            <text x="50%" y="40%" font-family="Arial, sans-serif" font-size="48" fill="#333" text-anchor="middle" dominant-baseline="middle">${theme.text}</text>
            <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="24" fill="#666" text-anchor="middle" dominant-baseline="middle">Sample Photo</text>
            <rect x="5%" y="85%" width="90%" height="8%" fill="#ffffff" opacity="0.7" rx="4" />
            <text x="50%" y="90%" font-family="Arial, sans-serif" font-size="16" fill="#333" text-anchor="middle" dominant-baseline="middle">Pooja Photography</text>
        </svg>
    `;
    
    await sharp(Buffer.from(svg))
        .jpeg({ quality: 85 })
        .toFile(outputPath);
    
    return { width, height };
}

// Helper function to adjust color brightness
function adjustColor(hex, percent) {
    // Convert hex to RGB
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    
    // Adjust brightness
    r = Math.min(255, Math.max(0, r + percent));
    g = Math.min(255, Math.max(0, g + percent));
    b = Math.min(255, Math.max(0, b + percent));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Function to add sample photos to a category
async function addSamplePhotosToCategory(category, targetCount = 5) {
    const existingPhotos = photos.photos.filter(photo => photo.category === category.id);
    const neededCount = Math.max(0, targetCount - existingPhotos.length);
    
    if (neededCount === 0) {
        console.log(`Category "${category.name}" already has ${existingPhotos.length} photos, no samples needed`);
        return;
    }
    
    console.log(`Adding ${neededCount} sample photos to category "${category.name}"`);
    
    const slug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-');
    const themes = sampleThemes[slug] || sampleThemes['recent'];
    
    for (let i = 0; i < neededCount; i++) {
        const theme = themes[i % themes.length];
        const timestamp = Date.now() + i;
        const filename = `${timestamp}-${Math.random().toString(36).substr(2, 9)}.jpg`;
        
        // Create sample image
        const dimensions = await createSampleImage(filename, theme);
        
        // Add to photos array
        const newPhoto = {
            id: Math.random().toString(36).substr(2, 16),
            filename: filename,
            originalName: `sample-${theme.text.toLowerCase().replace(/\s+/g, '-')}.jpg`,
            title: theme.text,
            description: `Sample photo for ${category.name} category`,
            category: category.id,
            tags: ['sample', category.name.toLowerCase()],
            uploadDate: new Date().toISOString(),
            dimensions: dimensions
        };
        
        photos.photos.push(newPhoto);
        console.log(`  ✓ Created sample: ${theme.text}`);
    }
}

// Main function
async function generateSamplePhotos() {
    console.log('Generating sample photos for all categories...\n');
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Process each category
    for (const category of categories.categories) {
        await addSamplePhotosToCategory(category, 5); // 5 samples per category
    }
    
    // Save updated photos data
    fs.writeFileSync(photosPath, JSON.stringify(photos, null, 2));
    
    console.log('\n✅ Sample photos generation complete!');
    console.log(`Total photos now: ${photos.photos.length}`);
}

// Run the generator
generateSamplePhotos().catch(console.error);