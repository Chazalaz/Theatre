# Theatre Stage Planner — Project Notes

## Project Overview
A browser-based 3D stage planner built with HTML, CSS, and JavaScript using Three.js. The goal is to let users place theatre props on a stage, move them around in real time, manage object layers, and save/load projects as local JSON files.

---

## Current Status
The current working prototype includes a fully rendered 3D stage environment, prop placement and dragging, layer management, property editing UI, and file-based project save/load with a project title.

The app is now stable again after fixing the project title integration and removing the temporary hover outline behavior.

---

## Tech Stack
- **HTML** — page structure and canvas layout
- **CSS** — UI styling, responsive panels, and app theming
- **JavaScript (ES Modules)** — core logic and app flow
- **Three.js** — 3D rendering, camera, scene, lighting, geometry
- **OrbitControls** — camera orbit and user navigation

---

## Architecture
The app uses a lightweight OOP architecture with dedicated classes and a mediator in `main.js`.

### Core class responsibilities
| File | Responsibility |
|------|---------------|
| `main.js` | Entry point, app state, prop list, selection state, save/load integration, UI wiring. |
| `SceneManager.js` | Creates renderer, camera, scene, lights, OrbitControls, and animation loop. |
| `Stage.js` | Builds the stage floor, walls, and floor border. Handles stage geometry. |
| `Prop.js` | Encapsulates prop state, color, selection effects, movement, and sizing. |
| `AssetLibrary.js` | Holds the asset catalogue and creates props for available stage items. |
| `LayersPanel.js` | Renders the layer list, handles selection and deletion callbacks. |
| `InputManager.js` | Handles mouse events, raycasting, selection, and dragging of props. |
| `PropertiesPanel.js` | Manages prop property inputs, updates prop values, and notifies `main.js`. |
| `config.js` | Central stage dimensions and configuration values. |

---

## Current Implementation
### Stage and environment
- Stage floor and walls built from `STAGE_CONFIG`
- Back wall and side walls aligned outside the stage boundary
- Subtle floor border line added for stage perimeter clarity
- Slightly darker grey canvas/background color for better contrast
- Ambient and directional lighting for scene depth

### Props and asset library
- Asset library now includes actual chair and table models plus rostrum and flat
- Props are created as grouped meshes for better shape fidelity
- Props can be added from the add panel and placed in the center of the stage
- Props currently have color, position, rotation, and scale control via properties panel

### Selection and interaction
- Click on props to select them
- Click empty space to deselect
- Drag selected props across the stage with correct mouse grab offset
- Layers panel lists props, allows click selection, and deletion
- Prop selection updates the properties panel and layers view

### UI and controls
- Animated add panel slides from bottom
- Top bar contains project title, save/load buttons, and MVP label
- Reset view button appears only when camera is moved
- Project title can be edited by clicking it

### Persistence
- Save exports the current scene and project name as a downloaded `.theatre.json` file
- Load opens a local file picker and restores the saved project state
- Project name is loaded from file metadata or derived from filename

---

## Completed MVP Features
- Stage geometry with floor, walls, and visible edges
- Add panel with dynamic asset catalogue buttons
- Layers panel with selection and delete support
- Prop creation, selection, and drag movement
- Correct drag offset and stage boundary clamping
- Reset camera view button
- File export/import for saving/loading project files
- Editable project title in the top banner

---

## MVP Features Remaining
1. **Properties panel polish**
   - Sync editing of prop name, position, size, rotation, and color
   - Better input validation and live updates
2. **Prop boundary/collision detection**
   - Prevent props from being dragged through walls
   - Keep props fully inside stage footprint
3. **Duplicate / copy object action**
   - Duplicate selected prop from UI or keyboard
4. **Saved project metadata**
   - Remember last opened project and recent files
   - Better project file naming and description support
5. **Real prop orientation support**
   - Orientation-specific rotation workflow and preview
6. **Scene cleanup / clear stage action**
   - Button to clear all props and reset stage state

---

## MLP — Future Roadmap
### Interaction and UX
- Keyboard shortcuts for selection, movement, and panels
- Middle-click or hotkey delete
- Hover states and better interactive feedback
- A settings menu for units and themes

### Venue and stage features
- Custom venue builder with user-defined stage dimensions
- Doorway cutouts in walls
- Curtains and stage cloth assets
- Stair markers and audience edge indicators
- Multiple venue templates (theatre, studio, house)

### Asset and data systems
- Real 3D asset models in `assets/` instead of boxes
- Asset categories and filtering
- Cloud save/load with user accounts
- Templates and scene presets

### Platform-level growth
- Multi-user SaaS workflow
- Project versioning and export formats
- Collaboration and sharing tools

---

## Notes for the Next Session
- Finalise `PropertiesPanel.js` and connect it to `main.js`
- Add proper prop property syncing on blur/enter
- Implement prop boundary checks in `InputManager.js`
- Add a clear stage button and user confirmation
- Consider adding a duplicate prop action in the layers panel or top bar
