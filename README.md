# Farming Game

A browser-based farming simulation game built with TypeScript and Vite.

## Features
- Tile-based farming grid
- Crop growth system
- Tools for interacting with the land
- Save/load game state
- Modular UI components

## Getting Started

### Prerequisites
- Git
- Node.js (LTS)
- npm (comes with Node.js)
- VS Code (or another code editor)

### Installation
1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd farming
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

### Development
Start the development server:
```sh
npm run dev
```
The game will be available at the local address shown in your terminal.

### Build
To build for production:
```sh
npm run build
```

## Project Structure
- `src/core/` - Core game logic (area, growth, save, state, tile, tools)
- `src/render/` - Rendering logic (grid, HUD, tile renderer)
- `src/ui/` - UI components (controls, tooltip)
- `src/utils/` - Utility functions
- `src/types/` - TypeScript type definitions

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)
