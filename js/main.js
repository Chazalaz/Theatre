import { SceneManager }    from './SceneManager.js';
import { Stage }            from './Stage.js';
import { AssetLibrary }     from './AssetLibrary.js';
import { STAGE_CONFIG }     from './config.js';
import { InputManager }     from './InputManager.js';
import { LayersPanel }      from './LayersPanel.js';
import { PropertiesPanel }  from './PropertiesPanel.js';
import { AddPanel }         from './AddPanel.js';
import { RightPanel }       from './RightPanel.js';
import { StagePanel }       from './StagePanel.js';
import { Modal }            from './Modal.js';

// ── Scene ────────────────────────────────────────────────────────────────────

const sceneManager = new SceneManager('theatre-canvas');
const stage        = new Stage(sceneManager);
const assetLibrary = new AssetLibrary();

// ── App state ────────────────────────────────────────────────────────────────

const props      = [];
let selectedProp = null;
let projectName  = 'Untitled Project';

// Grid / snap state
let gridVisible  = false;
let snapEnabled  = false;
let snapStep     = 0.5;

// Undo stack — stores snapshots of the props array
const undoStack  = [];

// ── DOM references ───────────────────────────────────────────────────────────

const saveBtn        = document.getElementById('save-btn');
const loadBtn        = document.getElementById('load-btn');
const clearBtn       = document.getElementById('clear-btn');
const topdownBtn     = document.getElementById('topdown-btn');
const exportBtn      = document.getElementById('export-btn');
const loadInput      = document.getElementById('load-input');
const addBtn         = document.getElementById('add-btn');
const resetViewBtn   = document.getElementById('reset-view-btn');
const gridBtn        = document.getElementById('grid-btn');
const snapBtn        = document.getElementById('snap-btn');
const snapSelect     = document.getElementById('snap-select');
const projectTitleEl = document.getElementById('project-title');

// ── UI components ────────────────────────────────────────────────────────────

new RightPanel();

const layersPanel = new LayersPanel(
    'layers-section',
    (prop) => selectProp(prop),
    (prop) => removeProp(prop.id),
    (prop) => duplicateProp(prop)
);

const propertiesPanel = new PropertiesPanel((updatedProp) => {
    if (!updatedProp) return;
    layersPanel.update(props);
    layersPanel.setSelected(updatedProp);
});

const addPanel = new AddPanel('add-panel', 'add-panel-items', (assetName) => {
    addPropToStage(assetName);
});
addPanel.populate(assetLibrary.getCatalogue());

const inputManager = new InputManager(sceneManager, props, (clickedProp) => selectProp(clickedProp));
inputManager.onDragStart = () => snapshot();

// ── Initialise grid ──────────────────────────────────────────────────────────

sceneManager.setGrid(snapStep, STAGE_CONFIG.floorHeight, gridVisible);

// ── Event bindings ───────────────────────────────────────────────────────────

addBtn.addEventListener('click', () => addPanel.toggle());

resetViewBtn.addEventListener('click', () => sceneManager.resetCamera());

saveBtn.addEventListener('click', async () => saveStage());

loadBtn.addEventListener('click', () => loadInput.click());

loadInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (file) await loadStageFromFile(file);
    loadInput.value = '';
});

clearBtn.addEventListener('click', async () => {
    if (props.length === 0) return;
    const confirmed = await Modal.confirm('Clear the stage? This cannot be undone.');
    if (confirmed) { snapshot(); clearStage(); }
});

topdownBtn.addEventListener('click', () => {
    const isTopDown = sceneManager.toggleTopDown();
    topdownBtn.classList.toggle('active', isTopDown);
    topdownBtn.textContent = isTopDown ? '3D View' : 'Top Down';
    if (isTopDown) resetViewBtn.style.display = 'none';
});

exportBtn.addEventListener('click', () => {
    sceneManager.exportFloorPlan(projectName || 'floor-plan');
});

gridBtn.addEventListener('click', () => {
    gridVisible = !gridVisible;
    gridBtn.classList.toggle('active', gridVisible);
    sceneManager.setGridVisible(gridVisible);
});

snapBtn.addEventListener('click', () => {
    snapEnabled = !snapEnabled;
    snapBtn.classList.toggle('active', snapEnabled);
    inputManager.setSnap(snapEnabled, snapStep);
});

snapSelect.addEventListener('change', () => {
    snapStep = parseFloat(snapSelect.value);
    sceneManager.setGrid(snapStep, STAGE_CONFIG.floorHeight, gridVisible);
    inputManager.setSnap(snapEnabled, snapStep);
});

sceneManager.onCameraChange = (hasMoved) => {
    resetViewBtn.style.display = hasMoved ? 'block' : 'none';
};

if (projectTitleEl) {
    projectTitleEl.addEventListener('click', async () => {
        const name = await Modal.prompt('Enter a project name', projectName);
        if (name !== null) setProjectName(name);
    });
}

// ── Keyboard shortcuts ────────────────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
    const inInput = e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA';

    if ((e.key === 'Delete' || e.key === 'Backspace') && !inInput) {
        if (selectedProp) { snapshot(); removeProp(selectedProp.id); }
        return;
    }

    if (e.key === 'Escape' && !inInput) {
        selectProp(null);
        return;
    }

    if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (selectedProp) { snapshot(); duplicateProp(selectedProp); }
        return;
    }

    if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
    }

    if (!inInput && selectedProp) {
        const step = snapEnabled ? snapStep : 0.1;
        if (e.key === 'ArrowLeft')  { e.preventDefault(); inputManager.nudge(selectedProp, -step, 0); propertiesPanel.setSelectedProp(selectedProp); }
        if (e.key === 'ArrowRight') { e.preventDefault(); inputManager.nudge(selectedProp,  step, 0); propertiesPanel.setSelectedProp(selectedProp); }
        if (e.key === 'ArrowUp')    { e.preventDefault(); inputManager.nudge(selectedProp, 0, -step); propertiesPanel.setSelectedProp(selectedProp); }
        if (e.key === 'ArrowDown')  { e.preventDefault(); inputManager.nudge(selectedProp, 0,  step); propertiesPanel.setSelectedProp(selectedProp); }
    }
});

// ── Undo ─────────────────────────────────────────────────────────────────────

function snapshot() {
    undoStack.push(props.map(p => ({
        name:     p.name,
        color:    p.getColorHex(),
        position: { x: p.mesh.position.x, y: p.mesh.position.y, z: p.mesh.position.z },
        rotation: { x: p.mesh.rotation.x, y: p.mesh.rotation.y, z: p.mesh.rotation.z },
        scale:    { x: p.mesh.scale.x,    y: p.mesh.scale.y,    z: p.mesh.scale.z    },
    })));
    if (undoStack.length > 20) undoStack.shift();
}

function undo() {
    if (!undoStack.length) return;
    const state = undoStack.pop();

    props.forEach(p => sceneManager.remove(p.mesh));
    props.length = 0;
    selectedProp = null;
    propertiesPanel.setSelectedProp(null);

    state.forEach(item => {
        const prop = assetLibrary.createProp(item.name);
        if (!prop) return;
        prop.placeAtCentre(STAGE_CONFIG.floorHeight);
        prop.mesh.position.set(item.position.x, item.position.y, item.position.z);
        prop.mesh.rotation.set(item.rotation.x, item.rotation.y, item.rotation.z);
        prop.mesh.scale.set(item.scale.x, item.scale.y, item.scale.z);
        prop.setColor(item.color);
        sceneManager.add(prop.mesh);
        props.push(prop);
    });

    layersPanel.update(props);
}

// ── Prop management ──────────────────────────────────────────────────────────

function selectProp(prop) {
    if (selectedProp) selectedProp.deselect();

    if (prop === null) {
        selectedProp = null;
        propertiesPanel.setSelectedProp(null);
        return;
    }

    selectedProp = prop;
    selectedProp.select();
    layersPanel.setSelected(prop);
    propertiesPanel.setSelectedProp(prop);
}

function addPropToStage(name) {
    snapshot();
    const prop = assetLibrary.createProp(name);
    if (!prop) return;

    if (selectedProp) selectedProp.deselect();

    prop.placeAtCentre(STAGE_CONFIG.floorHeight);
    sceneManager.add(prop.mesh);
    props.push(prop);

    selectedProp = prop;
    selectedProp.select();
    layersPanel.update(props);
    layersPanel.setSelected(prop);
    propertiesPanel.setSelectedProp(prop);
}

function removeProp(id) {
    const index = props.findIndex(p => p.id === id);
    if (index === -1) return;

    const prop = props[index];
    sceneManager.remove(prop.mesh);
    props.splice(index, 1);

    if (selectedProp?.id === id) {
        selectedProp = null;
        propertiesPanel.setSelectedProp(null);
    }

    layersPanel.update(props);
}

function duplicateProp(source) {
    if (!source) return;

    const copy = assetLibrary.createProp(source.name);
    if (!copy) return;

    copy.placeAtCentre(STAGE_CONFIG.floorHeight);
    copy.mesh.position.set(
        source.mesh.position.x + 0.5,
        source.mesh.position.y,
        source.mesh.position.z + 0.5
    );
    copy.mesh.rotation.copy(source.mesh.rotation);
    copy.mesh.scale.copy(source.mesh.scale);
    copy.setColor(source.getColorHex());
    copy.setName(source.name);

    sceneManager.add(copy.mesh);
    props.push(copy);

    selectProp(copy);
    layersPanel.update(props);
    layersPanel.setSelected(copy);
}

function clearStage() {
    props.forEach(prop => sceneManager.remove(prop.mesh));
    props.length = 0;
    selectedProp = null;
    propertiesPanel.setSelectedProp(null);
    layersPanel.update(props);
}

// ── Project persistence ──────────────────────────────────────────────────────

function setProjectName(name) {
    projectName = (typeof name === 'string' && name.trim()) ? name.trim() : 'Untitled Project';
    if (projectTitleEl) projectTitleEl.textContent = projectName;
}

async function saveStage() {
    const filename = await Modal.prompt('Enter a project file name', projectName);
    if (!filename) return;

    setProjectName(filename);

    const data = {
        projectName,
        stageConfig: stage.getConfig(),
        props: props.map(p => ({
            name:     p.name,
            color:    p.getColorHex(),
            position: { x: p.mesh.position.x, y: p.mesh.position.y, z: p.mesh.position.z },
            rotation: { x: p.mesh.rotation.x, y: p.mesh.rotation.y, z: p.mesh.rotation.z },
            scale:    { x: p.mesh.scale.x,    y: p.mesh.scale.y,    z: p.mesh.scale.z    },
        }))
    };

    const safeName = filename.trim().replace(/[^a-zA-Z0-9\-_ ]+/g, '') || 'stage-project';
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${safeName}.theatre.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function loadStageFromFile(file) {
    try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!data || !Array.isArray(data.props)) throw new Error('Invalid project file.');

        clearStage();
        undoStack.length = 0;
        setProjectName(data.projectName || file.name.replace(/\.[^/.]+$/, '') || 'Untitled Project');

        if (data.stageConfig) {
            stage.loadConfig(data.stageConfig);
            stagePanel.refresh();
        }

        data.props.forEach(item => {
            const prop = assetLibrary.createProp(item.name);
            if (!prop) return;

            prop.placeAtCentre(STAGE_CONFIG.floorHeight);
            prop.mesh.position.set(item.position.x, item.position.y, item.position.z);
            prop.mesh.rotation.set(item.rotation.x, item.rotation.y, item.rotation.z);
            prop.mesh.scale.set(item.scale.x, item.scale.y, item.scale.z);
            prop.setColor(item.color);

            sceneManager.add(prop.mesh);
            props.push(prop);
        });

        layersPanel.update(props);
        selectedProp = null;
        propertiesPanel.setSelectedProp(null);
        await Modal.alert(`Project "${projectName}" loaded.`);
    } catch (error) {
        console.error(error);
        await Modal.alert('Failed to load the selected project file.');
    }
}

// ── Boot ─────────────────────────────────────────────────────────────────────

const stagePanel = new StagePanel(stage);
setProjectName(projectName);
sceneManager.start();
