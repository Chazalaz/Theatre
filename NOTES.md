# Theatre Stage Planner — Project Notes

## Project Overview
A browser-based 3D stage planner built with HTML, CSS, and JavaScript using Three.js. Users can place theatre props on a configurable stage, move them in real time, manage layers, edit properties, configure the stage environment, and save/load projects as local JSON files.

---

## Current Status
The app has moved well past its original MVP scope. Core editing is solid: a full props workflow (add, select, drag, duplicate, delete), a working properties panel, a layered scene, and project persistence. The UI has been refactored into a clean collapsible side panel system. Stage configuration (floor/wall colours, wall visibility, doorways) is now live and persisted. Native browser dialogs have been replaced with a custom modal system.

---

## Tech Stack
- **HTML** — page structure and panel layout
- **CSS** — UI theming, responsive panels, transitions, toggle switches
- **JavaScript (ES Modules)** — OOP architecture, no bundler
- **Three.js** — 3D rendering, camera, scene, lighting, geometry
- **OrbitControls** — camera orbit, pan, and zoom

---

## Architecture
Lightweight OOP with a thin mediator in `main.js`. Each class owns one concern.

### Class responsibilities
| File | Responsibility |
|------|---------------|
| `main.js` | Orchestrator: app state, prop list, selection state, event wiring, save/load. |
| `SceneManager.js` | Renderer, camera, scene, lights, OrbitControls, resize, animation loop. |
| `Stage.js` | Stage geometry (floor, back wall, side walls). Handles colours, wall visibility, and doorway cutouts. Exposes `getConfig` / `loadConfig` for persistence. |
| `Prop.js` | Prop identity, mesh, selection highlight, position/size/rotation/color, serialisation helpers. |
| `AssetLibrary.js` | 17-item catalogue across seating, tables, rostra, flats, stairs, and structures. Factory method `createProp`. |
| `InputManager.js` | Mouse events on canvas: raycasting, prop selection, drag with offset, stage boundary clamping. |
| `LayersPanel.js` | Layers list rendering, select/duplicate/delete callbacks, SVG icon buttons. |
| `PropertiesPanel.js` | Property form: name, position XYZ, size WDH, rotation XYZ, colour. Commits on blur or Enter. |
| `StagePanel.js` | Stage section UI: floor/wall colour pickers, wall visibility toggles, doorway list with add/edit/remove. |
| `AddPanel.js` | Slide-up add panel: populates asset buttons, open/close/toggle. |
| `RightPanel.js` | Right-panel management: collapsible sections (reads initial state from DOM), full panel hide/show tab. |
| `Modal.js` | Custom async modal replacing native `alert` / `confirm` / `prompt`. Promise-based API. |
| `config.js` | Stage dimensions (`width`, `depth`, `floorHeight`, `wallHeight`). |

---

## Current Implementation

### Stage and environment
- Floor, back wall, and side walls built from `STAGE_CONFIG` dimensions
- Floor border line marks the stage perimeter
- Stage colours fully configurable: floor colour, left/right wall colours
- Each side wall can be toggled visible or hidden
- Doorways can be added to any side wall — position from front, width, and height are editable; wall mesh is rebuilt as segments with a header above each opening
- Back wall is always white (not configurable)
- Stage config is saved to and restored from project files

### Props and asset library
- 17 props across categories: Chair, Bench, Sofa, Table, Desk, Rostrum, Rostrum+Steps, Flat (4 sizes), Stairs (3-step / 5-step), Railing, Pillar, Door Frame, Wardrobe
- Props are grouped Three.js meshes with sub-geometry detail (legs, frames, rails, etc.)
- Color, position XYZ, size WDH, rotation XYZ all editable from the Properties panel
- Duplicate action in the Layers panel offsets the copy by 0.5m on X and Z

### Selection and interaction
- Click to select; click empty space to deselect
- Drag selected props on the stage floor plane with correct grab offset
- Boundary clamping keeps props within the stage footprint during drag
- Layers panel provides per-prop select, duplicate, and delete with SVG icon buttons

### UI panels
- Right panel is split into three collapsible sections: **Properties**, **Layers**, **Stage**
- Stage section starts collapsed so Properties and Layers share full height by default
- Any section can be expanded or collapsed independently
- Clicking a section header or the chevron button toggles it
- Panel hide/show tab (`‹` `›`) slides the entire right panel off-screen and expands the canvas area; add panel and reset button animate to fill the freed space
- Add panel slides up from the bottom-left; populated dynamically from `AssetLibrary`

### Dialogs
- `Modal.alert`, `Modal.confirm`, `Modal.prompt` replace all native browser dialogs
- Dark-themed overlay with Enter / Escape keyboard support and backdrop-click dismiss
- All prompt/confirm/alert calls in `main.js` are async/await

### Persistence
- Save prompts for a filename, serialises props and stage config to `.theatre.json`
- Load restores all props (name, color, position, rotation, scale) and stage config (floor color, wall colors/visibility/doorways)
- `StagePanel.refresh()` resync the stage UI inputs after a project load
- Project name saved in file metadata and shown in the top bar

---

## Completed Features

### Stage and environment
- [x] Stage geometry with floor, walls, and edge lines
- [x] Configurable floor colour
- [x] Configurable side wall colours
- [x] Side wall visibility toggle (hide/show per wall)
- [x] Doorway cutouts in side walls (position, width, height; wall rebuilt with header segments)
- [x] Back wall fixed white
- [x] Stage config serialised with project file

### Props
- [x] 17-prop asset library (seating, tables, rostra, flats, stairs, structures)
- [x] Add, place, select, deselect, drag, duplicate, delete
- [x] Stage boundary clamping during drag
- [x] Properties panel: name, position XYZ, size WDH, rotation XYZ, colour
- [x] Layers panel with SVG icon buttons (duplicate / delete)

### UI and UX
- [x] Collapsible right panel with Properties, Layers, and Stage sections
- [x] Panel hide/show tab — full panel slide-off with canvas expansion
- [x] Custom modal dialogs (no native browser popups)
- [x] Animated add panel slides from bottom
- [x] Reset camera view button (visible only when camera has moved)
- [x] Click-to-edit project name in top bar
- [x] Clear stage button with confirmation

### Persistence
- [x] Save project as `.theatre.json` download
- [x] Load project from local file
- [x] Stage config included in save/load

---

## MVP Remaining

These are the features that would make this genuinely production-ready for a theatre company.

1. **Top-down / bird's-eye view**
   Toggle between the current 3D perspective and an orthographic top-down view. This is the primary working view for stage planners and directors — they need a flat floor plan to plan blocking, sightlines, and spacing.

2. **Custom stage dimensions**
   Let the user configure actual stage dimensions (width, depth, wall height) in the Stage panel. Currently hardcoded in `config.js`. Dimensions should be saved with the project and rebuild the stage on change.

3. **Grid and snapping**
   Show an optional grid overlay on the stage floor. When dragging props, snap to a configurable grid interval (e.g. 0.25 m or 0.5 m). Essential for precise, tidy layouts.

4. **Keyboard shortcuts**
   - `Delete` / `Backspace` — remove selected prop
   - `Escape` — deselect
   - `Ctrl+D` — duplicate selected prop
   - Arrow keys — nudge selected prop by grid step
   - `Ctrl+Z` — undo last action (at minimum, single-level undo)

5. **Export floor plan**
   Capture the top-down orthographic view as a PNG (using `renderer.domElement.toDataURL()`). Users need to print or share the layout with directors, cast, and stage crew.

---

## Future Roadmap

### Interaction and UX
- Undo / redo stack (multi-level)
- Rotation handle in 3D view (click-drag to rotate selected prop)
- Prop labels visible on stage (names rendered as sprites or CSS2DRenderer)
- Hover preview showing prop name as tooltip
- Asset library categories and search filter

### Stage and venue
- Multiple venue templates (end-on, thrust, traverse, in-the-round)
- Audience seating area indicator
- Masking positions — legs, borders, tabs as stage objects
- Cyclorama or backdrop as configurable back wall

### Asset system
- Real Blender-exported `.glb` models instead of box geometry
- Custom colour presets saved per project
- Asset tagging and filtering (set dressing, structure, furniture, etc.)

### Platform growth
- Lighting controls: colour, intensity, direction
- Cloud save with user accounts
- Share / collaborate via project link
- Version history and named snapshots
- PDF export with dimension annotations
