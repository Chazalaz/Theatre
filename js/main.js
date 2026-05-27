import { SceneManager } from './SceneManager.js';
import { Stage } from './Stage.js';
import { AssetLibrary } from './AssetLibrary.js';
import { STAGE_CONFIG } from './config.js';
import { InputManager } from './InputManager.js';
import { LayersPanel } from './LayersPanel.js';
import { PropertiesPanel } from './PropertiesPanel.js';



const sceneManager = new SceneManager('theatre-canvas');
const stage = new Stage(sceneManager);
const assetLibrary = new AssetLibrary();

const props = [];
let selectedProp = null;

const addBtn = document.getElementById('add-btn');
const closePanel = document.getElementById('close-panel');
const addPanel = document.getElementById('add-panel');
const addPanelItems = document.getElementById('add-panel-items');
const resetViewBtn = document.getElementById('reset-view-btn');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const loadInput = document.getElementById('load-input');
const projectTitle = document.getElementById('project-title');

let projectName = 'Untitled Project';

function setProjectName(name)
{
    projectName = typeof name === 'string' && name.trim() !== '' ? name.trim() : 'Untitled Project';
    if(projectTitle)
    {
        projectTitle.textContent = projectName;
    }
}

setProjectName(projectName);

if(projectTitle)
{
    projectTitle.addEventListener('click', () => {
        const customName = prompt('Enter a project name', projectName);
        if(customName !== null)
        {
            setProjectName(customName);
        }
    });
}

const propertiesPanel = new PropertiesPanel('properties-panel', (updatedProp) => {
    if(!updatedProp) return;
    layersPanel.update(props);
    layersPanel.setSelected(updatedProp);
});

const layersPanel = new LayersPanel('layers-panel', (prop) => {
    if(selectedProp)
    {
        selectedProp.deselect();
    }
    if(prop === null)
    {
        selectedProp = null;
        propertiesPanel.setSelectedProp(null);
        return;
    }
    
    selectedProp = prop;
    selectedProp.select();
    layersPanel.setSelected(prop);
    propertiesPanel.setSelectedProp(prop);
}, (prop) => {
    removeProp(prop.id);
});

const inputManager = new InputManager(sceneManager, props, (clickedProp) => {
    if(selectedProp)
    {
        selectedProp.deselect();
    }
    if(clickedProp === null)
    {
        selectedProp = null;
        propertiesPanel.setSelectedProp(null);
        return;
    }
    
    selectedProp = clickedProp;
    selectedProp.select();
    layersPanel.setSelected(clickedProp);
    propertiesPanel.setSelectedProp(clickedProp);
});


assetLibrary.getCatalogue().forEach(asset => {
    const btn = document.createElement('button');
    btn.textContent = asset.name;
    btn.style.padding         = '10px 20px';
    btn.style.marginRight     = '10px';
    btn.style.cursor          = 'pointer';
    btn.style.backgroundColor = '#333';
    btn.style.color           = '#fff';
    btn.style.border          = '1px solid #555';
    btn.style.borderRadius    = '6px';

    btn.addEventListener('click', () => {
        addPropToStage(asset.name);
        addPanel.classList.remove('open');
    });

    addPanelItems.appendChild(btn);
});


resetViewBtn.addEventListener('click', () => {
    sceneManager.resetCamera();
});

saveBtn.addEventListener('click', () => {
    saveStage();
});

loadBtn.addEventListener('click', () => {
    loadInput.click();
});

loadInput.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if(file)
    {
        await loadStageFromFile(file);
    }
    loadInput.value = '';
});

sceneManager.onCameraChange = (hasMoved) => {
    resetViewBtn.style.display = hasMoved ? 'block' : 'none';
};


addBtn.addEventListener('click', () => {
    addPanel.classList.toggle('open');
});


closePanel.addEventListener('click', () => {
    addPanel.classList.remove('open');
});


function addPropToStage(name)
{
    const prop = assetLibrary.createProp(name);
    
    if(!prop) return;

    if(selectedProp)
    {
        selectedProp.deselect();
    }

    prop.placeAtCentre(STAGE_CONFIG.floorHeight);
    sceneManager.add(prop.mesh);
    props.push(prop);
    selectedProp = prop;
    selectedProp.select();
    layersPanel.update(props);
    layersPanel.setSelected(prop);
    propertiesPanel.setSelectedProp(prop);
}


function removeProp(id)
{
    const index = props.findIndex(p => p.id === id);

    if(index === -1) return;

    const deletedProp = props[index];
    sceneManager.remove(deletedProp.mesh);
    props.splice(index, 1);

    if(selectedProp && selectedProp.id === id)
    {
        selectedProp = null;
        propertiesPanel.setSelectedProp(null);
    }

    layersPanel.update(props);
}

function clearStage()
{
    props.forEach(prop => sceneManager.remove(prop.mesh));
    props.length = 0;
    selectedProp = null;
    propertiesPanel.setSelectedProp(null);
    layersPanel.update(props);
}

function saveStage()
{
    const filename = prompt('Enter a project file name', projectName);
    if(!filename) return;

    setProjectName(filename);

    const stageData = {
        projectName,
        props: props.map(prop => ({
            name: prop.name,
            color: prop.getColorHex(),
            position: {
                x: prop.mesh.position.x,
                y: prop.mesh.position.y,
                z: prop.mesh.position.z,
            },
            rotation: {
                x: prop.mesh.rotation.x,
                y: prop.mesh.rotation.y,
                z: prop.mesh.rotation.z,
            },
            scale: {
                x: prop.mesh.scale.x,
                y: prop.mesh.scale.y,
                z: prop.mesh.scale.z,
            }
        }))
    };

    const safeName = filename.trim().replace(/[^a-zA-Z0-9-_ ]+/g, '') || 'stage-project';
    const downloadName = `${safeName}.theatre.json`;
    const blob = new Blob([JSON.stringify(stageData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

async function loadStageFromFile(file)
{
    try
    {
        const text = await file.text();
        const data = JSON.parse(text);

        if(!data || !Array.isArray(data.props))
        {
            throw new Error('Invalid project file.');
        }

        clearStage();
        setProjectName(data.projectName || file.name.replace(/\.[^/.]+$/, '') || 'Untitled Project');

        data.props.forEach(item =>
        {
            const prop = assetLibrary.createProp(item.name);
            if(!prop) return;

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
        alert(`Project "${projectName}" loaded.`);
    }
    catch(error)
    {
        console.error(error);
        alert('Failed to load the selected project file.');
    }
}

sceneManager.start();