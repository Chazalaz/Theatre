
import * as THREE from 'three';
import { STAGE_CONFIG } from './config.js';

export class Stage
{
    constructor(sceneManager)
    {
        this.sceneManager = sceneManager;
        this._buildFloor();
        this._buildWalls();
    }

    _buildFloor()
    {
        const geometry = new THREE.BoxGeometry(
            STAGE_CONFIG.width,
            0.1,
            STAGE_CONFIG.depth
        );

        const material = new THREE.MeshStandardMaterial({ color: 0x8B4513});
        this.floor = new THREE.Mesh(geometry, material);
        this.floor.position.y = STAGE_CONFIG.floorHeight;
        this.floor.receiveShadow = true;
        this.sceneManager.add(this.floor);
    }

    _buildWalls()
    {
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x222222});

        const backWallGeo = new THREE.BoxGeometry(
            STAGE_CONFIG.width,
            STAGE_CONFIG.wallHeight,
            0.1
        );

        const backWall = new THREE.Mesh(backWallGeo, wallMaterial);
        backWall.position.set(
            0,
            STAGE_CONFIG.floorHeight + STAGE_CONFIG.wallHeight / 2,
            -STAGE_CONFIG.depth / 2 
        );

        this.sceneManager.add(backWall);


        const sideWallGeo = new THREE.BoxGeometry(
            0.1,
            STAGE_CONFIG.wallHeight,
            STAGE_CONFIG.depth
        );
        
        const leftWall = new THREE.Mesh(sideWallGeo, wallMaterial);
        leftWall.position.set(
            -STAGE_CONFIG.width / 2, 
            STAGE_CONFIG.floorHeight + STAGE_CONFIG.wallHeight / 2,
            0
        );

        this.sceneManager.add(leftWall);


        const rightWall = new THREE.Mesh(sideWallGeo, wallMaterial);
        rightWall.position.set(
            STAGE_CONFIG.width / 2,
            STAGE_CONFIG.floorHeight + STAGE_CONFIG.wallHeight / 2,
            0
        );

        this.sceneManager.add(rightWall);
    }
}