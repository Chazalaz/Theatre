import * as THREE from 'three';
import { STAGE_CONFIG } from './config.js'; 

export class InputManager {
    constructor(sceneManager, props, onPropSelected) {
        this.sceneManager = sceneManager;
        this.props = props;
        this.onPropSelected = onPropSelected;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.isDragging = false;
        this.activeProp = null;
        this.floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -STAGE_CONFIG.floorHeight);
        this.targetPoint = new THREE.Vector3();
     
     
        this._setupEventListeners();
    }

    _setupEventListeners() {
        const canvas = this.sceneManager.canvas;

        canvas.addEventListener('mousedown', (e) => {this._onMouseDown(e)});
        canvas.addEventListener('mousemove', (e) => {this._onMouseMove(e)});
        canvas.addEventListener('mouseup', () => {this._onMouseUp()});
    }


    _updateMouse(e) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    _onMouseDown(e) {
        this._updateMouse(e);
        this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

        const meshes = this.props.map(p => p.mesh);
        const intersects = this.raycaster.intersectObjects(meshes);

        if(intersects.length > 0) {
            const clickedMesh = intersects[0].object;
            const clickedProp = this.props.find(p => p.mesh === clickedMesh);

            if(clickedProp) {
                this.activeProp = clickedProp;
                this.isDragging = true;
                this.sceneManager.controls.enabled = false;
                this.onPropSelected(clickedProp);
            }
        } else {
            this.onPropSelected(null);
        }
    }

    _onMouseMove(e) {
        if(!this.isDragging || !this.activeProp) return;

        this._updateMouse(e);
        this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);
        this.raycaster.ray.intersectPlane(this.floorPlane, this.targetPoint);
        this.activeProp.move(this.targetPoint.x, this.targetPoint.z);
    }

    _onMouseUp() {
        this.isDragging = false;
        this.activeProp = null;
        this.sceneManager.controls.enabled = true;
    }
}