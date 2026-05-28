import * as THREE from 'three';
import { STAGE_CONFIG } from './config.js';

const WALL_THICKNESS = 0.1;

export class Stage {
    constructor(sceneManager) {
        this._scene = sceneManager;

        this._config = Stage._defaultConfig();

        this._materials = {
            floor:     new THREE.MeshStandardMaterial({ color: this._config.floorColor }),
            leftWall:  new THREE.MeshStandardMaterial({ color: this._config.leftWall.color }),
            rightWall: new THREE.MeshStandardMaterial({ color: this._config.rightWall.color }),
            backWall:  new THREE.MeshStandardMaterial({ color: 0xffffff }),
        };

        this._wallMeshes = { left: [], right: [] };

        this._buildFloor();
        this._buildBackWall();
        this._rebuildSideWall('left');
        this._rebuildSideWall('right');
        this._buildFloorBorder();
    }

    // ── Public API ────────────────────────────────────────────────────────────

    setFloorColor(hex) {
        this._config.floorColor = hex;
        this._materials.floor.color.set(hex);
    }

    setWallColor(side, hex) {
        this._config[`${side}Wall`].color = hex;
        this._materials[`${side}Wall`].color.set(hex);
    }

    setWallVisible(side, visible) {
        this._config[`${side}Wall`].visible = visible;
        this._rebuildSideWall(side);
    }

    addDoorway(side, doorway) {
        const entry = { id: crypto.randomUUID(), ...doorway };
        this._config[`${side}Wall`].doorways.push(entry);
        this._rebuildSideWall(side);
        return entry.id;
    }

    updateDoorway(side, id, updates) {
        const wall = this._config[`${side}Wall`];
        const doorway = wall.doorways.find(d => d.id === id);
        if (!doorway) return;
        Object.assign(doorway, updates);
        this._rebuildSideWall(side);
    }

    removeDoorway(side, id) {
        const wall = this._config[`${side}Wall`];
        wall.doorways = wall.doorways.filter(d => d.id !== id);
        this._rebuildSideWall(side);
    }

    getConfig() {
        return JSON.parse(JSON.stringify(this._config));
    }

    getWallConfig(side) {
        return this._config[`${side}Wall`];
    }

    loadConfig(config) {
        if (!config) return;

        if (config.floorColor) this.setFloorColor(config.floorColor);

        for (const side of ['left', 'right']) {
            const key = `${side}Wall`;
            if (!config[key]) continue;
            const w = config[key];
            if (w.color   !== undefined) this.setWallColor(side, w.color);
            if (w.visible !== undefined) this.setWallVisible(side, w.visible);

            // Restore doorways
            this._config[key].doorways = [];
            if (Array.isArray(w.doorways)) {
                w.doorways.forEach(d => this.addDoorway(side, {
                    zCenter: d.zCenter,
                    width:   d.width,
                    height:  d.height,
                }));
            }
        }
    }

    // ── Floor ─────────────────────────────────────────────────────────────────

    _buildFloor() {
        const geo = new THREE.BoxGeometry(STAGE_CONFIG.width, 0.1, STAGE_CONFIG.depth);
        const mesh = new THREE.Mesh(geo, this._materials.floor);
        mesh.position.y = STAGE_CONFIG.floorHeight - 0.05;
        mesh.receiveShadow = true;
        this._addEdges(mesh);
        this._scene.add(mesh);
    }

    _buildFloorBorder() {
        const hw = STAGE_CONFIG.width / 2;
        const hd = STAGE_CONFIG.depth / 2;
        const y  = STAGE_CONFIG.floorHeight + 0.01;

        const geo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-hw, y, -hd),
            new THREE.Vector3( hw, y, -hd),
            new THREE.Vector3( hw, y,  hd),
            new THREE.Vector3(-hw, y,  hd),
        ]);

        const mat    = new THREE.LineBasicMaterial({ color: 0x7f8c8d, opacity: 0.6, transparent: true });
        const border = new THREE.LineLoop(geo, mat);
        this._scene.add(border);
    }

    // ── Back wall ─────────────────────────────────────────────────────────────

    _buildBackWall() {
        const geo  = new THREE.BoxGeometry(STAGE_CONFIG.width, STAGE_CONFIG.wallHeight, WALL_THICKNESS);
        const mesh = new THREE.Mesh(geo, this._materials.backWall);
        mesh.position.set(
            0,
            STAGE_CONFIG.floorHeight + STAGE_CONFIG.wallHeight / 2,
            -(STAGE_CONFIG.depth / 2) - WALL_THICKNESS / 2
        );
        mesh.receiveShadow = true;
        this._addEdges(mesh);
        this._scene.add(mesh);
    }

    // ── Side walls ────────────────────────────────────────────────────────────

    _rebuildSideWall(side) {
        this._wallMeshes[side].forEach(m => this._scene.remove(m));
        this._wallMeshes[side] = [];

        const config = this._config[`${side}Wall`];
        if (!config.visible) return;

        const meshes = this._buildSideWallMeshes(side, config);
        meshes.forEach(m => this._scene.add(m));
        this._wallMeshes[side] = meshes;
    }

    _buildSideWallMeshes(side, config) {
        const { depth, wallHeight, floorHeight, width } = STAGE_CONFIG;
        const xPos   = (side === 'left' ? -1 : 1) * (width / 2 + WALL_THICKNESS / 2);
        const zStart = -depth / 2;
        const zEnd   = depth / 2;
        const mat    = this._materials[`${side}Wall`];

        if (config.doorways.length === 0) {
            return [this._makeWallSegment(xPos, wallHeight, depth, floorHeight, 0, 0, mat)];
        }

        // Clamp doorways to wall bounds and sort by left edge
        const doors = config.doorways
            .map(d => ({
                left:   Math.max(zStart, d.zCenter - d.width / 2),
                right:  Math.min(zEnd,   d.zCenter + d.width / 2),
                height: Math.min(d.height, wallHeight),
            }))
            .filter(d => d.right - d.left > 0.01)
            .sort((a, b) => a.left - b.left);

        const segments = [];
        let cursor = zStart;

        for (const door of doors) {
            // Wall to the left of this doorway
            if (door.left > cursor + 0.01) {
                segments.push({ z1: cursor, z2: door.left, yFrom: 0, yTo: wallHeight });
            }
            // Header above this doorway (if door is shorter than wall)
            if (door.height < wallHeight - 0.01) {
                segments.push({ z1: door.left, z2: door.right, yFrom: door.height, yTo: wallHeight });
            }
            cursor = door.right;
        }

        // Wall to the right of the last doorway
        if (cursor < zEnd - 0.01) {
            segments.push({ z1: cursor, z2: zEnd, yFrom: 0, yTo: wallHeight });
        }

        return segments.map(seg => {
            const segLen = seg.z2 - seg.z1;
            const segH   = seg.yTo - seg.yFrom;
            const zCtr   = (seg.z1 + seg.z2) / 2;
            return this._makeWallSegment(xPos, segH, segLen, floorHeight, seg.yFrom, zCtr, mat);
        });
    }

    _makeWallSegment(xPos, height, length, floorHeight, yFrom, zCenter, mat) {
        const geo  = new THREE.BoxGeometry(WALL_THICKNESS, height, length);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(xPos, floorHeight + yFrom + height / 2, zCenter);
        mesh.receiveShadow = true;
        this._addEdges(mesh);
        return mesh;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    _addEdges(mesh, color = 0x444444) {
        const edges = new THREE.EdgesGeometry(mesh.geometry);
        const lines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color }));
        mesh.add(lines);
    }

    static _defaultConfig() {
        return {
            floorColor: '#333333',
            leftWall:  { color: '#3a3a3a', visible: true, doorways: [] },
            rightWall: { color: '#3a3a3a', visible: true, doorways: [] },
        };
    }
}
