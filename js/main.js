import { SceneManager } from './SceneManager.js';
import { Stage } from './Stage.js';
import { AssetLibrary } from './AssetLibrary.js';
import { STAGE_CONFIG } from './config.js';

const sceneManager = new SceneManager('theatre-canvas');
const stage = new Stage(sceneManager);
const assetLibrary = new AssetLibrary();

const props = [];

const addBtn = document.getElementById('add-btn');
const closePanel = document.getElementById('close-panel');
const addPanel = document.getElementById('add-panel');
const addPanelItems = document.getElementById('add-panel-items');

assetLibrary.getCatalogue().forEach(asset => {
    const btn = document.createElement('button');
    btn.textContent = asset.name;
    btn.style.padding         = '10px, 20px';
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
    updateLayersPanel();
}

const layersList = document.getElementById('layers-list');

function updateLayersPanel()
{
    layersList.innerHTML = '';

    props.forEach(prop => {
        const li = document.createElement('li');
        li.textContent = prop.name;
        li.dataset.id = prop.id;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContext           = 'X';
        deleteBtn.style.backgroundColor = 'transparent';
        deleteBtn.style.color           = '#ff4444';
        deleteBtn.style.border          = 'none';
        deleteBtn.style.cursor          = 'pointer';
        deleteBtn.style.fontWeight      = 'bold';


        deleteBtn.addEventListener('click', (e) => {
            e.stopPropogation();
            removeProp(prop.id);
        });

        li.appendChild(deleteBtn);
        layersList.appendChild(li);
    });
}

function removeProp(id)
{
    const index = props.findIndex(p => p.id === id);

    if(index === -1) return;

    sceneManager.remove(props[index].mesh);
    props.splice(index, 1);
    updateLayersPanel();
}

sceneManager.start();