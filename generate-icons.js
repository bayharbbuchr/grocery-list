// This is a script to generate placeholder icons for the PWA
// You can replace these with your own icons later
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

// Function to create a simple icon with text
function createIcon(size, text, filename) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, size, size);
    
    // Text
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Adjust font size based on icon size
    const fontSize = Math.floor(size * 0.4);
    ctx.font = `bold ${fontSize}px Arial`;
    
    // Draw text
    ctx.fillText(text, size / 2, size / 2);
    
    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(iconsDir, filename), buffer);
}

// Generate icons
createIcon(192, 'SPREE', 'icon-192x192.png');
createIcon(512, 'SPREE', 'icon-512x512.png');

console.log('Icons generated in the icons/ directory');
