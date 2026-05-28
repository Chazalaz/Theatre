import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SceneManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.scene = new THREE.Scene();
        this._setupRenderer();
        this._setupCamera();
        this._setupLights();
        this._setupControls();
        this._setupResizeHandler();
        this.onCameraChange = null;
        this.isTopDown = false;
        this._grid = null;
    }

    _setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            preserveDrawingBuffer: true,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0xd8dde2);
        this.renderer.shadowMap.enabled = true;
    }

    _setupCamera() {
        const aspect = window.innerWidth / window.innerHeight;

        this.perspCamera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.perspCamera.position.set(0, 8, 14);
        this.perspCamera.lookAt(0, 0, 0);

        this._orthoSize = 12;
        this.orthoCamera = new THREE.OrthographicCamera(
            -this._orthoSize * aspect / 2,
             this._orthoSize * aspect / 2,
             this._orthoSize / 2,
            -this._orthoSize / 2,
            0.1, 200
        );
        this.orthoCamera.position.set(0, 50, 0.001);
        this.orthoCamera.up.set(0, 0, -1);
        this.orthoCamera.lookAt(0, 0, 0);

        this.camera = this.perspCamera;
    }

    _setupLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 2);
        this.scene.add(ambient);

        const spotlight = new THREE.SpotLight(0xffffff, 3);
        spotlight.position.set(0, 10, 0);
        spotlight.castShadow = true;
        spotlight.target.position.set(0, 0, 0);
        this.scene.add(spotlight);
        this.scene.add(spotlight.target);
    }

    _setupControls() {
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2;
    }

    _setupResizeHandler() {
        window.addEventListener('resize', () => {
            const aspect = window.innerWidth / window.innerHeight;

            this.perspCamera.aspect = aspect;
            this.perspCamera.updateProjectionMatrix();

            this.orthoCamera.left   = -this._orthoSize * aspect / 2;
            this.orthoCamera.right  =  this._orthoSize * aspect / 2;
            this.orthoCamera.updateProjectionMatrix();

            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    toggleTopDown() {
        this.isTopDown = !this.isTopDown;

        if (this.isTopDown) {
            this._savedPerspPos    = this.perspCamera.position.clone();
            this._savedPerspTarget = this.controls.target.clone();

            this.orthoCamera.position.set(0, 50, 0.001);
            this.orthoCamera.up.set(0, 0, -1);
            this.orthoCamera.lookAt(0, 0, 0);
            this.orthoCamera.zoom = 1;
            this.orthoCamera.updateProjectionMatrix();

            this.controls.object = this.orthoCamera;
            this.controls.target.set(0, 0, 0);
            this.controls.enableRotate = false;
            this.controls.update();

            this.camera = this.orthoCamera;
        } else {
            this.perspCamera.position.copy(this._savedPerspPos   || new THREE.Vector3(0, 8, 14));
            this.controls.target.copy(this._savedPerspTarget     || new THREE.Vector3(0, 0, 0));

            this.controls.object = this.perspCamera;
            this.controls.enableRotate = true;
            this.controls.maxPolarAngle = Math.PI / 2;
            this.controls.update();

            this.camera = this.perspCamera;
        }

        return this.isTopDown;
    }

    resetCamera() {
        if (this.isTopDown) return;
        this.controls.enableDamping = false;
        this.perspCamera.position.set(0, 8, 14);
        this.perspCamera.lookAt(0, 0, 0);
        this.controls.target.set(0, 0, 0);
        this.controls.enableDamping = true;
    }

    setGrid(step, floorY, visible) {
        if (this._grid) {
            this.scene.remove(this._grid);
            this._grid.geometry.dispose();
            this._grid.material.dispose();
            this._grid = null;
        }
        const size = 20;
        const divisions = Math.round(size / step);
        this._grid = new THREE.GridHelper(size, divisions, 0x2e4a7a, 0x263d68);
        this._grid.position.y = floorY + 0.005;
        this._grid.visible = visible;
        this.scene.add(this._grid);
    }

    setGridVisible(visible) {
        if (this._grid) this._grid.visible = visible;
    }

    exportFloorPlan(filename = 'floor-plan') {
        this.renderer.render(this.scene, this.camera);
        const dataUrl = this.renderer.domElement.toDataURL('image/png');

        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${filename}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    add(object) {
        this.scene.add(object);
    }

    remove(object) {
        this.scene.remove(object);
    }

    start() {
        const defaultPosition = new THREE.Vector3(0, 8, 14);

        this.renderer.setAnimationLoop(() => {
            this.controls.update();
            this.renderer.render(this.scene, this.camera);

            if (!this.isTopDown && this.onCameraChange) {
                const isAtDefault = this.perspCamera.position.distanceTo(defaultPosition) < 0.5;
                this.onCameraChange(!isAtDefault);
            }
        });
    }
}
