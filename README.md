# GLB Viewer

A modern, web-based 3D model viewer that allows users to load and inspect GLB (GL Binary) files directly in their browser. Built with React, Three.js, and TypeScript, this application provides a secure and efficient way to view 3D models with detailed model information.

## Features

- **Drag & Drop GLB File Loading**: Easily upload GLB files through the browser
- **Interactive 3D Viewing**: Rotate, zoom, and pan around your 3D models
- **Model Information Display**:
  - File details (name, size, last modified)
  - Material count
  - Vertex count
  - Model dimensions
- **Privacy-Focused**: All processing happens locally in your browser
- **Responsive Design**: Works on both desktop and mobile devices

## Technology Stack

- React 19
- TypeScript
- Three.js
- React Three Fiber
- React Three Drei
- Vite

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd glviewer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Usage

1. Open the application in your web browser
2. Click the file input button or drag and drop a GLB file into the viewer
3. Use your mouse/touch to interact with the 3D model:
   - Left click + drag to rotate
   - Right click + drag to pan
   - Scroll to zoom
4. View detailed model information in the panel below the viewer

## Privacy

This application processes all files locally in your browser. No data is uploaded to any server or stored permanently. Your 3D models remain completely private and secure.

## Development

This project uses Vite for fast development and building. The development server includes features like:
- Hot Module Replacement (HMR)
- TypeScript support
- ESLint integration

## License

MIT License
