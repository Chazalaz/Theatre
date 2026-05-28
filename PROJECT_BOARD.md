# Theatre Stage Planner — Project Board

## Done

### Stage and environment
- [x] Stage geometry: floor, back wall, side walls with edge lines
- [x] Floor border line marking stage perimeter
- [x] Configurable floor colour (live colour picker)
- [x] Configurable side wall colours (live colour pickers)
- [x] Side wall visibility toggle (show / hide per wall)
- [x] Doorway cutouts in side walls — position, width, height; wall rebuilt with header segments
- [x] Back wall fixed white, not configurable
- [x] Stage config (colours, walls, doorways) persisted in project file

### Props and asset library
- [x] 17-prop library: Chair, Bench, Sofa, Table, Desk, Rostrum, Rostrum+Steps, Flat ×4, Stairs ×2, Railing, Pillar, Door Frame, Wardrobe
- [x] Props as grouped Three.js meshes with sub-geometry detail
- [x] Add props from slide-up panel, placed at stage centre
- [x] Select props via click; deselect by clicking empty space
- [x] Drag props on stage floor with grab offset
- [x] Stage boundary clamping during drag
- [x] Duplicate prop (offset +0.5 m on X and Z)
- [x] Delete prop
- [x] Clear stage with confirmation
- [x] Properties panel: name, position XYZ, size WDH, rotation XYZ, colour

### UI / UX
- [x] Right panel with three independently collapsible sections (Properties, Layers, Stage)
- [x] Stage section starts collapsed; Properties and Layers share full height by default
- [x] Panel hide/show tab — slides panel off-screen and expands canvas; add panel and reset button animate accordingly
- [x] SVG icon buttons in layers list (duplicate ⧉, delete ✕) with coloured hover states
- [x] Custom modal dialogs replacing all native browser `alert` / `confirm` / `prompt`
- [x] Animated add panel slides up from bottom-left
- [x] Reset camera view button (hidden until camera moves)
- [x] Click-to-edit project name in top bar
- [x] Panel chevron toggle (rotates ›/˅) with smooth transition

### Persistence
- [x] Save project as `.theatre.json` download (props + stage config + project name)
- [x] Load project from local file with full state restore
- [x] Stage panel inputs refreshed after project load

### Code quality
- [x] Clean OOP architecture: Modal.js, RightPanel.js, AddPanel.js, StagePanel.js extracted
- [x] main.js reduced to a thin orchestrator
- [x] All native browser dialogs replaced with async Modal API
- [x] Broken `LayersPanel('layers-panel')` bug fixed (wrong element ID)
- [x] CSS deduplicated and fully rewritten — no duplicate rules

---

## MVP Remaining

- [ ] **Top-down / bird's-eye view** — orthographic camera toggle for floor plan layout work
- [ ] **Custom stage dimensions** — configurable width, depth, wall height in Stage panel; saved with project
- [ ] **Grid and snap** — optional grid overlay on floor; props snap to configurable grid step when dragging
- [ ] **Keyboard shortcuts** — Delete, Escape, Ctrl+D, arrow nudge, Ctrl+Z
- [ ] **Export floor plan** — capture top-down view as PNG download

---

## Backlog

### Interaction
- [ ] Multi-level undo / redo stack
- [ ] Rotation handle in 3D (click-drag to rotate selected prop)
- [ ] Prop name labels rendered on stage (CSS2DRenderer sprites)
- [ ] Asset library categories and search / filter

### Stage and venue
- [ ] Multiple venue templates (end-on, thrust, traverse, in-the-round)
- [ ] Audience seating area indicator
- [ ] Masking objects — legs, borders, tabs
- [ ] Cyclorama / backdrop configuration

### Assets
- [ ] Real Blender-exported `.glb` models
- [ ] Asset tagging (furniture, structure, set dressing)
- [ ] Custom colour presets per project

### Platform
- [ ] Lighting controls (colour, intensity, angle)
- [ ] Cloud save with user accounts
- [ ] Share via project link
- [ ] Version history and named snapshots
- [ ] PDF export with dimension annotations
