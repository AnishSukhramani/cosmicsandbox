# Planet Textures Download Guide

## 🪐 Getting Real Planet Textures for Physically-Based Rendering

The solar system now uses a sophisticated physically-based rendering pipeline that requires high-quality texture maps for realistic results.

### 🎯 Required Texture Maps

For each planet, you need these texture files (place in `/public/textures/`):

#### **Earth Example:**
- `earth_albedo_2k.jpg` - Color/diffuse map
- `earth_normal_2k.jpg` - Normal map (surface detail)
- `earth_roughness_2k.jpg` - Roughness map (surface roughness)
- `earth_displacement_2k.jpg` - Displacement map (height detail)
- `earth_clouds_2k.png` - Cloud layer (transparent)

#### **All Planets:**
Replace `earth` with: `mercury`, `venus`, `mars`, `jupiter`, `saturn`, `uranus`, `neptune`, `pluto`

### 🚀 Quick Setup

1. **Run the download script:**
   ```bash
   node download-textures.js
   ```

2. **Manual download (if script fails):**
   - **Solar System Scope**: https://www.solarsystemscope.com/textures/
   - **NASA Visible Earth**: https://visibleearth.nasa.gov/collection/1484/blue-marble
   - **USGS Mars**: https://astrogeology.usgs.gov/search/map/mars-mro-ctx-global-mosaic-murray-lab-v1

3. **File naming convention:**
   ```
   /public/textures/
   ├── earth_albedo_2k.jpg
   ├── earth_normal_2k.jpg
   ├── earth_roughness_2k.jpg
   ├── earth_displacement_2k.jpg
   ├── earth_clouds_2k.png
   ├── mars_albedo_2k.jpg
   ├── mars_normal_2k.jpg
   └── ... (repeat for all planets)
   ```

### 🎨 What Each Texture Does

- **Albedo**: Base color of the planet surface
- **Normal**: Surface detail (craters, mountains, clouds)
- **Roughness**: How rough/smooth the surface is
- **Displacement**: 3D height detail for realistic terrain
- **Clouds**: Atmospheric cloud layer (Earth, gas giants)

### 🔧 Technical Requirements

- **Format**: JPG for color maps, PNG for clouds (transparency)
- **Size**: 2K (2048x1024) or 8K (8192x4096) resolution
- **Projection**: Equirectangular (latitude/longitude)
- **Quality**: High-quality, no compression artifacts

### 🌟 Enhanced Features

The new system includes:
- ✅ **Physically-based materials** with realistic lighting
- ✅ **High-quality texture mapping** with anisotropy
- ✅ **Atmospheric scattering** effects
- ✅ **Cloud layers** for Earth and gas giants
- ✅ **Enhanced Saturn rings** with proper materials
- ✅ **Environment lighting** for realistic reflections
- ✅ **Improved shadows** and lighting

### 🎮 Usage

1. **Place textures** in `/public/textures/`
2. **Restart server**: `npm run dev`
3. **Enable "Hi-res textures"** in the UI
4. **See dramatic improvement** in planet realism!

### 📚 Additional Resources

- **Three.js Journey**: https://threejs-journey.com/lessons/earth-shaders
- **Atmospheric Scattering**: https://ebruneton.github.io/precomputed_atmospheric_scattering/
- **Poly Haven HDRIs**: https://polyhaven.com/hdris (for lighting)

The planets will now look incredibly realistic with proper surface detail, atmospheric effects, and physically-accurate lighting!
