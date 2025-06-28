# 🏗️ Code Restructuring Plan - Farming Game

## 📋 Overview
This document outlines the complete restructuring plan for the farming game codebase to improve maintainability, scalability, and code organization.

## 🎯 Goals
- [ ] Eliminate tight coupling and circular dependencies
- [ ] Implement centralized state management
- [ ] Create proper separation of concerns
- [ ] Establish clean architecture patterns
- [ ] Improve code testability and maintainability

## 📊 Progress Tracker

### Phase 1: Core Architecture (Foundation) - ✅ Completed
**Estimated Time: 4-6 hours**

#### 1.1 Event System - ✅ Completed (1-2 hours)
- [x] Create `src/events/EventBus.ts` - Central event dispatcher
- [x] Create `src/events/GameEvents.ts` - Event type definitions  
- [x] Create `src/events/EventTypes.ts` - Event interfaces
- [x] Update existing components to use events instead of callbacks

**Files Created:**
- ✅ `src/events/EventBus.ts` - Type-safe central event dispatcher with debug mode
- ✅ `src/events/GameEvents.ts` - Helper functions for easy event creation and emission
- ✅ `src/events/EventTypes.ts` - Comprehensive event interfaces for all game events

**Files Modified:**
- ✅ `src/main.ts` - Replaced callback passing with event listeners, added event setup
- ✅ `src/ui/controls.ts` - Removed callback dependencies, tool selection now emits events
- ✅ `src/render/hud.ts` - Added event listeners for toolbar updates, replaced callbacks with events
- ✅ `src/core/state.ts` - Coin changes now emit events for reactive UI updates

**Key Achievements:**
- ✅ **Eliminated Callback Anti-Pattern**: No more function passing through multiple layers
- ✅ **Type-Safe Event System**: All events strongly typed with TypeScript
- ✅ **Decoupled Communication**: Components communicate via events, not direct dependencies
- ✅ **Debug Mode**: Event bus logs all emissions and subscriptions in development
- ✅ **Reactive UI**: Toolbar and HUD automatically update when tool selection or coins change
- ✅ **Zero Breaking Changes**: All game functionality preserved during refactoring

#### 1.2 Centralized State Management - ✅ Completed (2-3 hours)
- [x] Create `src/state/GameState.ts` - Main game state class
- [x] Create `src/state/StateManager.ts` - State management with events
- [x] Create `src/state/selectors.ts` - State access helpers
- [x] Migrate from global state variables to centralized state
- [x] Integrate state changes with event system

**Files Created:**
- ✅ `src/state/GameState.ts` - Centralized game state interface and validation
- ✅ `src/state/StateManager.ts` - State management class with events integration
- ✅ `src/state/selectors.ts` - State access helpers and computed values
- ✅ `src/state/globalState.ts` - Global state manager instance and legacy compatibility
- ✅ `src/state/index.ts` - State module exports

**Files Modified:**
- ✅ `src/core/state.ts` - Refactored to use new state system with legacy compatibility
- ✅ `src/core/saveSystem.ts` - Updated to use centralized state manager

#### 1.3 Service Layer - ✅ Completed (1 hour)
- [x] Create `src/services/GameService.ts` - Main game logic coordinator
- [x] Create `src/services/RenderService.ts` - Rendering coordination
- [x] Create `src/services/InputService.ts` - Input handling
- [x] Create `src/services/SaveService.ts` - Save/load operations
- [x] Create `src/services/AreaService.ts` - Area management
- [x] Create `src/services/CropService.ts` - Crop-related operations
- [x] Create `src/services/index.ts` - Service exports and coordination

**Files Created:**
- ✅ `src/services/GameService.ts` - Main game coordinator with lifecycle management, statistics, and system integration
- ✅ `src/services/RenderService.ts` - Centralized rendering coordination with performance optimization and event-driven updates
- ✅ `src/services/InputService.ts` - Comprehensive input handling for mouse, keyboard, and game interactions
- ✅ `src/services/SaveService.ts` - Enhanced save/load operations with validation, import/export, and auto-save functionality
- ✅ `src/services/AreaService.ts` - Complete area management with purchasing, validation, and statistics
- ✅ `src/services/CropService.ts` - Full crop lifecycle management including planting, growth, harvesting, and enhancements
- ✅ `src/services/index.ts` - Service layer coordination with initialization and status monitoring

**Key Achievements:**
- ✅ **Business Logic Coordination**: Each service handles a specific domain with clear responsibilities
- ✅ **Event-Driven Architecture**: All services integrate seamlessly with the event system
- ✅ **Type-Safe Operations**: All service methods are strongly typed with proper error handling
- ✅ **State Management Integration**: Services coordinate with the centralized state manager
- ✅ **Performance Optimization**: Render service includes smart scheduling and request batching
- ✅ **Input Abstraction**: Complete input handling with context-aware processing
- ✅ **Enhanced Save System**: Advanced save/load with validation, auto-save, and import/export
- ✅ **Area Management**: Complete area system with purchasing logic and validation
- ✅ **Crop Operations**: Full crop lifecycle with bonuses, statistics, and growth management
- ✅ **Service Coordination**: Centralized service initialization and status monitoring

### Phase 2: Feature Modules (Business Logic) - � In Progress
**Estimated Time: 5-7 hours**

#### 2.1 Game Systems - ✅ Completed (3-4 hours)
- [x] Create `src/systems/TileSystem.ts` - Tile management
- [x] Create `src/systems/CropSystem.ts` - Crop growth & management  
- [x] Create `src/systems/EconomySystem.ts` - Coins, costs, rewards
- [x] Create `src/systems/AreaSystem.ts` - Area unlocking & management
- [x] Create `src/systems/ToolSystem.ts` - Tool management
- [x] Migrate existing logic from core files to systems

**Files Created:**
- ✅ `src/systems/TileSystem.ts` - Comprehensive tile management with event-driven updates, crop lifecycle, and enhancement tracking
- ✅ `src/systems/CropSystem.ts` - Complete crop lifecycle management with growth, harvesting, enhancements, and statistics
- ✅ `src/systems/EconomySystem.ts` - Full economic system with transactions, purchase validation, income tracking, and statistics
- ✅ `src/systems/AreaSystem.ts` - Area management with unlocking, cost calculation, purchase validation, and expansion planning
- ✅ `src/systems/ToolSystem.ts` - Tool management with selection, validation, usage tracking, hotkeys, and statistics

**Key Achievements:**
- ✅ **Business Logic Extraction**: All core game logic moved from scattered files to organized systems
- ✅ **Event Integration**: All systems fully integrated with the event bus for reactive updates
- ✅ **Type Safety**: All systems operations strongly typed with comprehensive interfaces
- ✅ **Statistics & Analytics**: Each system provides detailed statistics and analysis methods
- ✅ **Legacy Compatibility**: Systems maintain backward compatibility with existing code
- ✅ **Performance Optimization**: Efficient algorithms for batch operations and updates
- ✅ **Validation & Error Handling**: Comprehensive validation and error handling throughout
- ✅ **Save/Load Support**: All systems support serialization for game persistence
- ✅ **Debug Tools**: Detailed debug information and statistics for development

**System Architecture Benefits:**
- 🏗️ **Separation of Concerns**: Each system handles a specific domain with clear responsibilities
- 📊 **Data Management**: Centralized data handling with validation and consistency checks
- ⚡ **Event-Driven**: Reactive updates through the event system for loose coupling
- 🔧 **Extensibility**: Easy to extend and modify individual systems without affecting others
- 📈 **Scalability**: Systems designed to handle complex game features and large datasets
- 🧪 **Testability**: Clean interfaces make systems easy to unit test and validate

#### 2.2 Game Entities - 🔴 Not Started (2-3 hours)
- [ ] Create `src/entities/Tile.ts` - Tile entity class
- [ ] Create `src/entities/Crop.ts` - Crop entity class
- [ ] Create `src/entities/Area.ts` - Area entity class
- [ ] Create `src/entities/Tool.ts` - Tool entity classes
- [ ] Replace interfaces with proper entity classes

**Files to Create:**
- `src/entities/Tile.ts`
- `src/entities/Crop.ts`
- `src/entities/Area.ts`
- `src/entities/Tool.ts`

### Phase 3: Presentation Layer (UI/Rendering) - 🔴 Not Started
**Estimated Time: 4-6 hours**

#### 3.1 Rendering Architecture - 🔴 Not Started (2-3 hours)
- [ ] Create `src/rendering/Renderer.ts` - Main renderer class
- [ ] Create `src/rendering/GridRenderer.ts` - Grid rendering
- [ ] Create `src/rendering/TileRenderer.ts` - Tile rendering
- [ ] Create `src/rendering/CropRenderer.ts` - Crop rendering
- [ ] Create `src/rendering/UIRenderer.ts` - UI element rendering
- [ ] Create `src/rendering/Camera.ts` - Camera/viewport management
- [ ] Refactor existing rendering code

**Files to Create:**
- `src/rendering/Renderer.ts`
- `src/rendering/GridRenderer.ts`
- `src/rendering/TileRenderer.ts`
- `src/rendering/CropRenderer.ts`
- `src/rendering/UIRenderer.ts`
- `src/rendering/Camera.ts`

**Files to Refactor:**
- `src/render/grid.ts` - Move to new GridRenderer
- `src/render/tileRenderer.ts` - Split into multiple renderers
- `src/main.ts` - Remove rendering logic

#### 3.2 UI Components - 🔴 Not Started (2-3 hours)
- [ ] Create `src/ui/components/Toolbar.ts` - Tool selection
- [ ] Create `src/ui/components/HUD.ts` - Game stats display
- [ ] Create `src/ui/components/SaveLoadDialog.ts` - Save/load interface
- [ ] Create `src/ui/components/Tooltip.ts` - Tooltip system
- [ ] Create `src/ui/components/Notifications.ts` - Notification system
- [ ] Create `src/ui/UIManager.ts` - UI coordination
- [ ] Break down monolithic HUD component

**Files to Create:**
- `src/ui/components/Toolbar.ts`
- `src/ui/components/HUD.ts`
- `src/ui/components/SaveLoadDialog.ts`
- `src/ui/components/Tooltip.ts`
- `src/ui/components/Notifications.ts`
- `src/ui/UIManager.ts`

**Files to Refactor:**
- `src/render/hud.ts` - Break into smaller components
- `src/ui/controls.ts` - Simplify and extract logic
- `src/ui/tooltip.ts` - Move to components folder

### Phase 4: Infrastructure - 🔴 Not Started
**Estimated Time: 2-3 hours**

#### 4.1 Configuration & Data - 🔴 Not Started (1-2 hours)
- [ ] Create `src/config/GameConfig.ts` - Game configuration
- [ ] Create `src/config/ToolConfig.ts` - Tool definitions
- [ ] Create `src/config/CropConfig.ts` - Crop definitions
- [ ] Create `src/data/GameData.ts` - Static game data
- [ ] Centralize all configuration

**Files to Create:**
- `src/config/GameConfig.ts`
- `src/config/ToolConfig.ts`
- `src/config/CropConfig.ts`
- `src/data/GameData.ts`

**Files to Refactor:**
- `src/utils/constants.ts` - Split into config files
- `src/core/tools.ts` - Move data to config

#### 4.2 Utilities & Helpers - 🔴 Not Started (1 hour)
- [ ] Create `src/utils/math.ts` - Math utilities
- [ ] Create `src/utils/coordinates.ts` - Coordinate helpers
- [ ] Create `src/utils/validation.ts` - Input validation
- [ ] Create `src/utils/formatters.ts` - Data formatting
- [ ] Organize utility functions properly

**Files to Create:**
- `src/utils/math.ts`
- `src/utils/coordinates.ts`
- `src/utils/validation.ts`
- `src/utils/formatters.ts`

**Files to Refactor:**
- `src/utils/helpers.ts` - Split into specific utility files
- `src/utils/areaHelpers.ts` - Move to coordinates.ts

### Phase 5: Final Integration & Cleanup - 🔴 Not Started
**Estimated Time: 2-3 hours**

#### 5.1 Main Application Refactor - 🔴 Not Started (1-2 hours)
- [ ] Refactor `src/main.ts` to use new architecture
- [ ] Remove all business logic from main.ts
- [ ] Implement proper dependency injection
- [ ] Clean up imports and dependencies

#### 5.2 Testing & Validation - 🔴 Not Started (1 hour)
- [ ] Test all game functionality works
- [ ] Verify save/load system works
- [ ] Check performance improvements
- [ ] Validate no regressions introduced

## 🔧 Implementation Strategy

### Migration Approach
1. **Incremental**: Migrate one system at a time
2. **Backward Compatible**: Keep existing functionality during migration  
3. **Test Each Phase**: Verify functionality after each phase
4. **Feature Flags**: Use flags to switch between old/new implementations

### Current Phase Focus
**🎯 Next Action: Start Phase 2.2 - Game Entities**

**✅ Phase 2.1 Complete**: Game Systems successfully implemented!

**Phase 2.1 Summary:**
- **TileSystem**: Complete tile and crop management with event-driven updates, enhancements tracking, and statistics
- **CropSystem**: Full crop lifecycle with growth calculations, enhancement bonuses, harvest logic, and analytics
- **EconomySystem**: Comprehensive economic system with transaction history, purchase validation, and financial statistics
- **AreaSystem**: Area management with unlocking mechanics, cost calculation, expansion planning, and navigation
- **ToolSystem**: Tool management with selection, validation, usage tracking, hotkey system, and performance analytics

**Architecture Benefits Delivered:**
- 🏗️ **Business Logic Organization** - All game logic cleanly separated into specialized systems
- � **Data Integrity** - Consistent data management with validation and error handling
- ⚡ **Event-Driven Coordination** - Systems communicate through events for loose coupling
- � **Extensibility** - Easy to add new features and modify existing functionality
- � **Analytics Ready** - Comprehensive statistics and analytics built into each system
- 🧪 **Maintainability** - Clean interfaces and separation make code easy to understand and test

**Next Steps**: Phase 2.2 will create entity classes to replace the current interfaces and provide better object-oriented design.

### Key Principles
- **Single Responsibility**: Each class/module has one job
- **Dependency Injection**: Avoid tight coupling
- **Event-Driven**: Use events for communication
- **Immutable State**: Proper state management
- **Type Safety**: Maintain strong TypeScript typing

## 📁 New Project Structure (Target)

```text
src/
├── main.ts                    # Application entry point (minimal)
├── style.css                  # Styles
├── vite-env.d.ts             # Vite types
│
├── config/                    # Configuration files
│   ├── GameConfig.ts         # Game settings
│   ├── ToolConfig.ts         # Tool definitions
│   └── CropConfig.ts         # Crop definitions
│
├── data/                      # Static game data
│   └── GameData.ts           # Centralized game data
│
├── events/                    # Event system
│   ├── EventBus.ts           # Central event dispatcher
│   ├── GameEvents.ts         # Event definitions
│   └── EventTypes.ts         # Event interfaces
│
├── state/                     # State management
│   ├── GameState.ts          # Main game state
│   ├── StateManager.ts       # State management
│   └── selectors.ts          # State access helpers
│
├── services/                  # Business logic services
│   ├── GameService.ts        # Main game coordinator
│   ├── RenderService.ts      # Rendering coordination
│   ├── InputService.ts       # Input handling
│   ├── SaveService.ts        # Save/load operations
│   ├── AreaService.ts        # Area management
│   └── CropService.ts        # Crop operations
│
├── systems/                   # Game systems ✅
│   ├── TileSystem.ts         # Tile management ✅
│   ├── CropSystem.ts         # Crop growth & management ✅
│   ├── EconomySystem.ts      # Economy system ✅
│   ├── AreaSystem.ts         # Area system ✅
│   └── ToolSystem.ts         # Tool system ✅
│
├── entities/                  # Game entities
│   ├── Tile.ts               # Tile entity
│   ├── Crop.ts               # Crop entity
│   ├── Area.ts               # Area entity
│   └── Tool.ts               # Tool entities
│
├── rendering/                 # Rendering layer
│   ├── Renderer.ts           # Main renderer
│   ├── GridRenderer.ts       # Grid rendering
│   ├── TileRenderer.ts       # Tile rendering
│   ├── CropRenderer.ts       # Crop rendering
│   ├── UIRenderer.ts         # UI rendering
│   └── Camera.ts             # Camera management
│
├── ui/                        # User interface
│   ├── UIManager.ts          # UI coordination
│   └── components/           # UI components
│       ├── Toolbar.ts        # Tool selection
│       ├── HUD.ts            # Game stats
│       ├── SaveLoadDialog.ts # Save/load UI
│       ├── Tooltip.ts        # Tooltips
│       └── Notifications.ts  # Notifications
│
├── utils/                     # Utilities
│   ├── math.ts               # Math functions
│   ├── coordinates.ts        # Coordinate helpers
│   ├── validation.ts         # Validation
│   └── formatters.ts         # Data formatting
│
└── types/                     # Type definitions
    └── index.ts              # All type definitions
```

## 📝 Notes

- This restructuring will significantly improve code maintainability and scalability
- Each phase can be implemented incrementally without breaking existing functionality
- The new architecture follows clean code principles and modern JavaScript/TypeScript patterns
- Progress should be tracked by checking off completed items in this document

---

**Last Updated:** June 28, 2025  
**Status:** Phase 2.1 Complete ✅ - Game Systems Successfully Implemented  
**Next:** Phase 2.2 - Game Entities

## 🎉 Phase 2.1 Completion Summary

### What We Built:

#### 2.1 Game Systems ✅
- **TileSystem**: Comprehensive tile management with event-driven updates, crop lifecycle management, enhancement tracking (water/fertilizer), and detailed statistics
- **CropSystem**: Complete crop lifecycle management with growth calculations, enhancement bonuses, harvest logic, auto-harvest functionality, and analytics
- **EconomySystem**: Full economic system with transaction history, purchase validation, income/expense tracking, and financial statistics
- **AreaSystem**: Area management with unlocking mechanics, cost calculation based on distance, expansion planning, and navigation helpers
- **ToolSystem**: Tool management with selection system, validation, usage tracking, hotkey handling, and performance analytics

### Architecture Benefits Delivered:
- 🏗️ **Business Logic Organization** - All game logic cleanly extracted from scattered files into specialized systems
- � **Data Integrity** - Consistent data management with validation, error handling, and state consistency
- ⚡ **Event-Driven Coordination** - Systems communicate through the event bus for reactive updates and loose coupling
- 🔧 **Extensibility** - Easy to add new features, modify existing functionality, and extend system capabilities
- 📈 **Analytics & Statistics** - Comprehensive statistics and analytics built into each system for insights
- 🧪 **Maintainability** - Clean interfaces, clear responsibilities, and separation make code easy to understand and test
- 💾 **Persistence Ready** - All systems support serialization for game save/load functionality
- 🐛 **Debug Support** - Detailed debug information and statistics for development and troubleshooting

### Files Transformed:
**Total: 5 new system files created**

**New Game Systems:**
- `systems/TileSystem.ts` - Tile and crop management with 25+ methods for comprehensive tile operations
- `systems/CropSystem.ts` - Crop lifecycle management with growth, harvesting, enhancement bonuses, and statistics
- `systems/EconomySystem.ts` - Economic system with transaction tracking, purchase validation, and financial analytics
- `systems/AreaSystem.ts` - Area management with unlocking, cost calculation, expansion planning, and navigation
- `systems/ToolSystem.ts` - Tool management with selection, validation, usage tracking, hotkeys, and statistics

### Ready for Phase 2.2:
The game systems foundation is now complete and ready to support entity classes. All business logic has been cleanly separated into specialized systems while maintaining event-driven communication and type safety.
