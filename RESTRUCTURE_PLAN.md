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

### Phase 1: Core Architecture (Foundation) - 🔄 In Progress
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

#### 1.3 Service Layer - 🔴 Not Started (1 hour)
- [ ] Create `src/services/GameService.ts` - Main game logic coordinator
- [ ] Create `src/services/RenderService.ts` - Rendering coordination
- [ ] Create `src/services/InputService.ts` - Input handling
- [ ] Create `src/services/SaveService.ts` - Save/load operations
- [ ] Create `src/services/AreaService.ts` - Area management
- [ ] Create `src/services/CropService.ts` - Crop-related operations

**Files to Create:**
- `src/services/GameService.ts`
- `src/services/RenderService.ts`
- `src/services/InputService.ts`
- `src/services/SaveService.ts`
- `src/services/AreaService.ts`
- `src/services/CropService.ts`

### Phase 2: Feature Modules (Business Logic) - 🔴 Not Started
**Estimated Time: 5-7 hours**

#### 2.1 Game Systems - 🔴 Not Started (3-4 hours)
- [ ] Create `src/systems/TileSystem.ts` - Tile management
- [ ] Create `src/systems/CropSystem.ts` - Crop growth & management  
- [ ] Create `src/systems/EconomySystem.ts` - Coins, costs, rewards
- [ ] Create `src/systems/AreaSystem.ts` - Area unlocking & management
- [ ] Create `src/systems/ToolSystem.ts` - Tool management
- [ ] Migrate existing logic from core files to systems

**Files to Create:**
- `src/systems/TileSystem.ts`
- `src/systems/CropSystem.ts`
- `src/systems/EconomySystem.ts`
- `src/systems/AreaSystem.ts`
- `src/systems/ToolSystem.ts`

**Files to Refactor:**
- `src/core/tile.ts` - Extract logic to TileSystem
- `src/core/growthSystem.ts` - Extract logic to CropSystem
- `src/core/area.ts` - Extract logic to AreaSystem
- `src/core/tools.ts` - Extract logic to ToolSystem

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
**🎯 Next Action: Start Phase 1.3 - Service Layer**

**✅ Phase 1.1 Complete**: Event system successfully implemented and integrated. All components now communicate via type-safe events instead of callbacks.

**✅ Phase 1.2 Complete**: Centralized state management implemented with backward compatibility. All state is now managed through a single StateManager with type-safe validation and event integration.

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
├── systems/                   # Game systems
│   ├── TileSystem.ts         # Tile management
│   ├── CropSystem.ts         # Crop growth & management
│   ├── EconomySystem.ts      # Economy system
│   ├── AreaSystem.ts         # Area system
│   └── ToolSystem.ts         # Tool system
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
**Status:** Phase 1.2 Complete ✅ - Centralized State Management Successfully Implemented  
**Next:** Phase 1.3 - Service Layer

## 🎉 Phase 1.2 Completion Summary

### What We Built:
1. **GameState Interface** - Centralized state structure with UI, economy, world, and meta sections
2. **StateManager Class** - Type-safe state management with validation and event integration
3. **State Selectors** - Clean interface for accessing state data with computed values
4. **Global State Instance** - Singleton state manager accessible throughout the application
5. **Legacy Compatibility** - Backward compatible interface to maintain existing code

### Benefits Achieved:
- 🏗️ **Centralized State** - Single source of truth for all game data
- 🛡️ **Type Safety** - All state operations are strongly typed and validated
- � **Reactive Updates** - State changes automatically emit events for UI updates
- � **Better Save/Load** - Improved serialization and state management for persistence
- 🔧 **Developer Experience** - Clean selectors and debug tools for state inspection
- 📈 **Scalability** - Easy to extend state structure as game grows

### Files Transformed:
- `state/GameState.ts` - Centralized state interface and validation
- `state/StateManager.ts` - Main state management class
- `state/selectors.ts` - State access helpers and computed values
- `state/globalState.ts` - Global instance with legacy compatibility
- `core/state.ts` - Now delegates to new state system
- `core/saveSystem.ts` - Updated to use StateManager for persistence

### Architecture Improvements:
- **Immutable State Updates** - State is only modified through validated mutations
- **Event-Driven Updates** - State changes automatically trigger UI updates via events
- **Validation Layer** - All state updates are validated for consistency
- **Debug Support** - Built-in state inspection and summary tools
- **Migration Support** - Legacy state format can be automatically migrated
