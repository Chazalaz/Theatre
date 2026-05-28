import * as THREE from 'three';
import { STAGE_CONFIG } from './config.js';

export class InputManager {
    constructor(sceneManager, props, onPropSelected) {
        this.sceneManager  = sceneManager;
        this.props         = props;
        this.onPropSelected = onPropSelected;
        this.onDragStart   = null;

        this.raycaster   = new THREE.Raycaster();
        this.mouse       = new THREE.Vector2();
        this.isDragging  = false;
        this.activeProp  = null;
        this.floorPlane  = new THREE.Plane(new THREE.Vector3(0, 1, 0), -STAGE_CONFIG.floorHeight);
        this.targetPoint = new THREE.Vector3();
        this.dragOffset  = new THREE.Vector3();

        this.snapEnabled = false;
        this.snapStep    = 0.5;

        this._setupEventListeners();
    }

    setSnap(enabled, step) {
        this.snapEnabled = enabled;
        this.snapStep    = step;
    }

    nudge(prop, dx, dz) {
        const box  = new THREE.Box3().setFromObject(prop.mesh);
        const size = box.getSize(new THREE.Vector3());

        const halfW = size.x / 2;
        const halfD = size.z / 2;

        const newX = Math.min( STAGE_CONFIG.width  / 2 - halfW,
                     Math.max(-STAGE_CONFIG.width  / 2 + halfW, prop.mesh.position.x + dx));
        const newZ = Math.min( STAGE_CONFIG.depth  / 2 - halfD,
                     Math.max(-STAGE_CONFIG.depth  / 2 + halfD, prop.mesh.position.z + dz));

        prop.move(newX, newZ);
    }

    _snap(value, step) {
        return Math.round(value / step) * step;
    }

    _setupEventListeners() {
        const canvas = this.sceneManager.canvas;
        canvas.addEventListener('mousedown', (e) => this._onMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
        canvas.addEventListener('mouseup',   ()  => this._onMouseUp());
    }

    _updateMouse(e) {
        this.mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    _onMouseDown(e) {
        this._updateMouse(e);
        this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

        const meshes     = this.props.map(p => p.mesh);
        const intersects = this.raycaster.intersectObjects(meshes, true);

        if (intersects.length > 0) {
            const clickedMesh = intersects[0].object;
            const clickedProp = this.props.find(
                p => p.mesh === clickedMesh || p.mesh.getObjectById?.(clickedMesh.id) !== undefined
            );

            if (clickedProp) {
                if (this.onDragStart) this.onDragStart();

                this.activeProp = clickedProp;
                this.isDragging = true;
                this.sceneManager.controls.enabled = false;
                this.onPropSelected(clickedProp);

                const hit = this.raycaster.ray.intersectPlane(this.floorPlane, this.targetPoint);
                if (hit) {
                    this.dragOffset.x = this.activeProp.mesh.position.x - this.targetPoint.x;
                    this.dragOffset.z = this.activeProp.mesh.position.z - this.targetPoint.z;
                } else {
                    const pt = intersects[0].point;
                    this.dragOffset.x = this.activeProp.mesh.position.x - pt.x;
                    this.dragOffset.z = this.activeProp.mesh.position.z - pt.z;
                }
            }
        } else {
            this.onPropSelected(null);
        }
    }

    _onMouseMove(e) {
        if (!this.isDragging || !this.activeProp) return;

        this._updateMouse(e);
        this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

        if (!this.raycaster.ray.intersectPlane(this.floorPlane, this.targetPoint)) return;

        let desiredX = this.targetPoint.x + this.dragOffset.x;
        let desiredZ = this.targetPoint.z + this.dragOffset.z;

        if (this.snapEnabled) {
            desiredX = this._snap(desiredX, this.snapStep);
            desiredZ = this._snap(desiredZ, this.snapStep);
        }

        const box  = new THREE.Box3().setFromObject(this.activeProp.mesh);
        const size = box.getSize(new THREE.Vector3());

        this.activeProp.move(
            Math.min( STAGE_CONFIG.width  / 2 - size.x / 2, Math.max(-STAGE_CONFIG.width  / 2 + size.x / 2, desiredX)),
            Math.min( STAGE_CONFIG.depth  / 2 - size.z / 2, Math.max(-STAGE_CONFIG.depth  / 2 + size.z / 2, desiredZ))
        );
    }

    _onMouseUp() {
        this.isDragging = false;
        this.activeProp = null;
        this.sceneManager.controls.enabled = true;
    }
}
