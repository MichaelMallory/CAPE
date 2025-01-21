const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create a 128x128 canvas
const canvas = createCanvas(128, 128);
const ctx = canvas.getContext('2d');

// Fill background
ctx.fillStyle = '#1a237e';
ctx.fillRect(0, 0, 128, 128);

// Add text
ctx.fillStyle = '#ffffff';
ctx.font = '20px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('Test Avatar', 64, 64);

// Save the image
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, 'test-avatar.png'), buffer); 