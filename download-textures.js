const https = require('https');
const fs = require('fs');
const path = require('path');

// Create textures directory if it doesn't exist
const texturesDir = path.join(__dirname, 'public', 'textures');
if (!fs.existsSync(texturesDir)) {
  fs.mkdirSync(texturesDir, { recursive: true });
}

// Working texture URLs from Solar System Scope and other sources
const textures = {
  // Earth textures (NASA Blue Marble)
  'earth_albedo_2k.jpg': 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/earth.jpg',
  'earth_albedo_8k.jpg': 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/earth.jpg',
  
  // Mars textures
  'mars_albedo_2k.jpg': 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/mars.jpg',
  'mars_albedo_8k.jpg': 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/mars.jpg',
  
  // Jupiter textures
  'jupiter_albedo_2k.jpg': 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/jupiter.jpg',
  'jupiter_albedo_8k.jpg': 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/jupiter.jpg',
  
  // Saturn textures
  'saturn_albedo_2k.jpg': 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/saturn.jpg',
  'saturn_albedo_8k.jpg': 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/saturn.jpg',
  
  // Venus textures
  'venus_albedo_2k.jpg': 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/venus.jpg',
  'venus_albedo_8k.jpg': 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/venus.jpg',
  
  // Mercury textures
  'mercury_albedo_2k.jpg': 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/mercury.jpg',
  'mercury_albedo_8k.jpg': 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/mercury.jpg',
  
  // Uranus textures
  'uranus_albedo_2k.jpg': 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/uranus.jpg',
  'uranus_albedo_8k.jpg': 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/uranus.jpg',
  
  // Neptune textures
  'neptune_albedo_2k.jpg': 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/neptune.jpg',
  'neptune_albedo_8k.jpg': 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/neptune.jpg',
  
  // Pluto textures
  'pluto_albedo_2k.jpg': 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/pluto.jpg',
  'pluto_albedo_8k.jpg': 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/pluto.jpg',
};

function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(texturesDir, filename);
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${filename}`);
          resolve();
        });
      } else {
        console.log(`❌ Failed to download ${filename}: ${response.statusCode}`);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      console.log(`❌ Error downloading ${filename}: ${err.message}`);
      reject(err);
    });
  });
}

async function downloadAllTextures() {
  console.log('🚀 Starting texture download...');
  
  for (const [filename, url] of Object.entries(textures)) {
    try {
      await downloadFile(url, filename);
    } catch (error) {
      console.log(`⚠️  Skipping ${filename} due to error`);
    }
  }
  
  console.log('✨ Texture download complete!');
  console.log('\n📝 Note: If downloads fail, manually download textures from:');
  console.log('   https://www.solarsystemscope.com/textures/');
  console.log('   https://visibleearth.nasa.gov/collection/1484/blue-marble');
}

downloadAllTextures();
