import { SceneManager } from './SceneManager.js';
import { Stage } from './Stage.js';
import { AssetLibrary } from './AssetLibrary.js';
import { STAGE_CONFIG } from './config.js';
import { InputManager } from './InputManager.js';
import { LayersPanel } from './LayersPanel.js';



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


const layersPanel = new LayersPanel('layers-panel', (prop) => {
    if(selectedProp) 
    {
        selectedProp.deselect();
    }
    if(prop === null)
    {
        selectedProp = null;
        return;
    }
    
    selectedProp = prop;
    selectedProp.select();
    layersPanel.setSelected(prop);
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
        return;
    }
    
    selectedProp = clickedProp;
    selectedProp.select();
    layersPanel.setSelected(clickedProp);
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

    prop.placeAtCentre(STAGE_CONFIG.floorHeight);
    sceneManager.add(prop.mesh);
    props.push(prop);
    layersPanel.update(props);
}


function removeProp(id)
{
    const index = props.findIndex(p => p.id === id);

    if(index === -1) return;

    sceneManager.remove(props[index].mesh);
    props.splice(index, 1);
    layersPanel.update(props);
}

sceneManager.start();