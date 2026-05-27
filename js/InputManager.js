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
        this.dragOffset = new THREE.Vector3();
     
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
        const intersects = this.raycaster.intersectObjects(meshes, true);

        if(intersects.length > 0) {
            const clickedMesh = intersects[0].object;
            const clickedProp = this.props.find(p => p.mesh === clickedMesh || p.mesh.getObjectById?.(clickedMesh.id) !== undefined);

            if(clickedProp) {
                this.activeProp = clickedProp;
                this.isDragging = true;
                this.sceneManager.controls.enabled = false;
                this.onPropSelected(clickedProp);

                const floorIntersection = this.raycaster.ray.intersectPlane(this.floorPlane, this.targetPoint);
                if(floorIntersection) {
                    this.dragOffset.x = this.activeProp.mesh.position.x - this.targetPoint.x;
                    this.dragOffset.z = this.activeProp.mesh.position.z - this.targetPoint.z;
                } else {
                    const clickPoint = intersects[0].point;
                    this.dragOffset.x = this.activeProp.mesh.position.x - clickPoint.x;
                    this.dragOffset.z = this.activeProp.mesh.position.z - clickPoint.z;
                }
            }
        } else {
            this.onPropSelected(null);
        }
    }

    _onMouseMove(e) {
        if(!this.isDragging || !this.activeProp) return;

        this._updateMouse(e);
        this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

        const intersection = this.raycaster.ray.intersectPlane(this.floorPlane, this.targetPoint); 
        if(!intersection) return;

        const desiredX = this.targetPoint.x + this.dragOffset.x;
        const desiredZ = this.targetPoint.z + this.dragOffset.z;
        const box = new THREE.Box3().setFromObject(this.activeProp.mesh);
        const size = box.getSize(new THREE.Vector3());

        const halfWidth = size.x / 2;
        const halfDepth = size.z / 2;

        const minX = -STAGE_CONFIG.width / 2 + halfWidth;
        const maxX = STAGE_CONFIG.width / 2 - halfWidth;
        const minZ = -STAGE_CONFIG.depth / 2 + halfDepth;
        const maxZ = STAGE_CONFIG.depth / 2 - halfDepth;

        const clampedX = Math.min(maxX, Math.max(minX, desiredX));
        const clampedZ = Math.min(maxZ, Math.max(minZ, desiredZ));

        this.activeProp.move(clampedX, clampedZ);
    }

    _onMouseUp() {
        this.isDragging = false;
        this.activeProp = null;
        this.sceneManager.controls.enabled = true;
    }
}