import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


export class SceneManager
{
    constructor(canvasId)
    {
        this.canvas = document.getElementById(canvasId);
        this.scene = new THREE.Scene();
        this._setupRenderer();
        this._setupCamera();
        this._setupLights();
        this._setupControls();
        this._setupResizeHandler();
    }


    _setupRenderer()
    {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x444444);
        this.renderer.shadowMap.enabled = true;
    }

    _setupCamera()
    {
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        this.camera.position.set(0,8,14);
        this.camera.lookAt(0,0,0);
    }


    _setupLights()
    {
        const ambient = new THREE.AmbientLight(0xffffff, 2);
        this.scene.add(ambient);


        const spotlight = new THREE.SpotLight(0xffffff, 3);
        spotlight.position.set(0, 10, 0);
        spotlight.castShadow = true;
        spotlight.target.position.set(0,0,0);
        this.scene.add(spotlight);
        this.scene.add(spotlight.target);
    }


    _setupControls()
    {
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2;
    }

    _setupResizeHandler()
    {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    add(object)
    {
        this.scene.add(object);
    }

    remove(object)
    {
        this.scene.remove(object);
    }

    start()
    {
        this.renderer.setAnimationLoop(() => {
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        });
    }
}