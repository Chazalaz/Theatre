import * as THREE from 'three';
import { Prop } from './Prop.js';

export class AssetLibrary {
    constructor() {
        this._catalogue = [
            // ── Seating ───────────────────────────────────────────────────────
            { name: 'Chair',   color: 0x8B4513, create: () => this._createChair() },
            { name: 'Bench',   color: 0x6B4226, create: () => this._createBench() },
            { name: 'Sofa',    color: 0x446688, create: () => this._createSofa()  },

            // ── Tables / surfaces ─────────────────────────────────────────────
            { name: 'Table',   color: 0x5B4513, create: () => this._createTable() },
            { name: 'Desk',    color: 0x4a3010, create: () => this._createDesk()  },

            // ── Rostra ────────────────────────────────────────────────────────
            { name: 'Rostrum',         color: 0x555555, create: () => this._createRostrum() },
            { name: 'Rostrum + Steps', color: 0x555555, create: () => this._createRostrumWithSteps() },

            // ── Flats / scenery ───────────────────────────────────────────────
            { name: 'Flat',        color: 0x222222, create: () => this._createFlat(2.0, 3.0) },
            { name: 'Flat (Narrow)',color: 0x222222, create: () => this._createFlat(1.0, 3.0) },
            { name: 'Flat (Wide)', color: 0x222222, create: () => this._createFlat(3.0, 3.0) },
            { name: 'Flat (Tall)', color: 0x222222, create: () => this._createFlat(1.0, 4.0) },

            // ── Stairs / access ───────────────────────────────────────────────
            { name: 'Stairs (3 step)', color: 0x888888, create: () => this._createStairs(3) },
            { name: 'Stairs (5 step)', color: 0x888888, create: () => this._createStairs(5) },

            // ── Structures ────────────────────────────────────────────────────
            { name: 'Railing',     color: 0xaaaaaa, create: () => this._createRailing() },
            { name: 'Pillar',      color: 0xdddddd, create: () => this._createPillar()  },
            { name: 'Door Frame',  color: 0x5B4513, create: () => this._createDoorFrame() },
            { name: 'Wardrobe',    color: 0x5B4513, create: () => this._createWardrobe() },
        ];
    }

    getCatalogue() {
        return this._catalogue;
    }

    createProp(name) {
        const asset = this._catalogue.find(a => a.name === name);
        if (!asset) {
            console.warn(`Asset "${name}" not found in library.`);
            return null;
        }
        return new Prop(asset.name, asset.create(), asset.color);
    }

    // ── Seating ───────────────────────────────────────────────────────────────

    _createChair() {
        const group = new THREE.Group();
        const mat   = new THREE.MeshStandardMaterial({ color: 0x8B4513 });

        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.6), mat);
        seat.position.y = 0.45;
        group.add(seat);

        const back = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.65, 0.08), mat);
        back.position.set(0, 0.78, -0.26);
        group.add(back);

        const legGeo   = new THREE.BoxGeometry(0.07, 0.45, 0.07);
        const legPositions = [[-0.23, -0.23], [0.23, -0.23], [-0.23, 0.23], [0.23, 0.23]];
        legPositions.forEach(([x, z]) => {
            const leg = new THREE.Mesh(legGeo, mat);
            leg.position.set(x, 0.225, z);
            group.add(leg);
        });

        return group;
    }

    _createBench() {
        const group = new THREE.Group();
        const mat   = new THREE.MeshStandardMaterial({ color: 0x6B4226 });

        const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.4), mat);
        seat.position.y = 0.47;
        group.add(seat);

        const legGeo = new THREE.BoxGeometry(0.07, 0.47, 0.07);
        [[-0.82, -0.15], [0.82, -0.15], [-0.82, 0.15], [0.82, 0.15]].forEach(([x, z]) => {
            const leg = new THREE.Mesh(legGeo, mat);
            leg.position.set(x, 0.235, z);
            group.add(leg);
        });

        return group;
    }

    _createSofa() {
        const group = new THREE.Group();
        const mat   = new THREE.MeshStandardMaterial({ color: 0x446688 });

        const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.22, 0.75), mat);
        seat.position.y = 0.42;
        group.add(seat);

        const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.55, 0.14), mat);
        back.position.set(0, 0.83, -0.305);
        group.add(back);

        const armGeo = new THREE.BoxGeometry(0.14, 0.35, 0.75);
        [-0.87, 0.87].forEach(x => {
            const arm = new THREE.Mesh(armGeo, mat);
            arm.position.set(x, 0.475, 0);
            group.add(arm);
        });

        return group;
    }

    // ── Tables / surfaces ─────────────────────────────────────────────────────

    _createTable() {
        const group = new THREE.Group();
        const mat   = new THREE.MeshStandardMaterial({ color: 0x5B4513 });

        const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.8), mat);
        top.position.y = 0.73;
        group.add(top);

        const legGeo = new THREE.BoxGeometry(0.08, 0.73, 0.08);
        [[-0.67, -0.33], [0.67, -0.33], [-0.67, 0.33], [0.67, 0.33]].forEach(([x, z]) => {
            const leg = new THREE.Mesh(legGeo, mat);
            leg.position.set(x, 0.365, z);
            group.add(leg);
        });

        return group;
    }

    _createDesk() {
        const group = new THREE.Group();
        const mat   = new THREE.MeshStandardMaterial({ color: 0x4a3010 });
        const dark  = new THREE.MeshStandardMaterial({ color: 0x2a1a08 });

        // Surface
        const top = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.7), mat);
        top.position.y = 0.74;
        group.add(top);

        // Back panel (monitor surround / privacy screen)
        const back = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.04), dark);
        back.position.set(0, 1.01, -0.33);
        group.add(back);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.06, 0.74, 0.06);
        [[-0.64, -0.3], [0.64, -0.3], [-0.64, 0.3], [0.64, 0.3]].forEach(([x, z]) => {
            const leg = new THREE.Mesh(legGeo, mat);
            leg.position.set(x, 0.37, z);
            group.add(leg);
        });

        return group;
    }

    // ── Rostra ────────────────────────────────────────────────────────────────

    _createRostrum() {
        return new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.5, 2),
            new THREE.MeshStandardMaterial({ color: 0x555555 })
        );
    }

    _createRostrumWithSteps() {
        const group = new THREE.Group();
        const mat   = new THREE.MeshStandardMaterial({ color: 0x555555 });

        const platform = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 2), mat);
        platform.position.y = 0.25;
        group.add(platform);

        // Two approach steps at the front
        const stepH = 0.25, stepD = 0.32;
        for (let i = 0; i < 2; i++) {
            const h = (i + 1) * stepH;
            const step = new THREE.Mesh(new THREE.BoxGeometry(1.2, h, stepD), mat);
            step.position.set(0, h / 2, 1 + (1 - i) * stepD);
            group.add(step);
        }

        return group;
    }

    // ── Flats ─────────────────────────────────────────────────────────────────

    _createFlat(width, height) {
        const group = new THREE.Group();
        const mat   = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const trim  = new THREE.MeshStandardMaterial({ color: 0x111111 });

        // Panel face
        const panel = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.04), mat);
        panel.position.y = height / 2;
        group.add(panel);

        // Timber frame (top, bottom, left, right edges)
        const frameW = 0.06;
        const frameThickness = 0.06;
        const frameDepth = 0.1;

        const addFrame = (w, h, x, y) => {
            const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, frameDepth), trim);
            f.position.set(x, y, 0);
            group.add(f);
        };

        // Top and bottom rails
        addFrame(width, frameW, 0, height - frameW / 2);
        addFrame(width, frameW, 0, frameW / 2);
        // Left and right stiles
        addFrame(frameThickness, height, -(width / 2 - frameThickness / 2), height / 2);
        addFrame(frameThickness, height,  (width / 2 - frameThickness / 2), height / 2);

        return group;
    }

    // ── Stairs ────────────────────────────────────────────────────────────────

    _createStairs(steps) {
        const group = new THREE.Group();
        const mat   = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const W     = 1.2;
        const H     = 0.22;
        const D     = 0.30;

        // Step i=0 is at the front (lowest), step i=steps-1 is at the back (highest)
        for (let i = 0; i < steps; i++) {
            const height = (i + 1) * H;
            const geo    = new THREE.BoxGeometry(W, height, D);
            const mesh   = new THREE.Mesh(geo, mat);
            mesh.position.set(0, height / 2, ((steps - 1) / 2 - i) * D);
            group.add(mesh);
        }

        return group;
    }

    // ── Structures ────────────────────────────────────────────────────────────

    _createRailing() {
        const group = new THREE.Group();
        const mat   = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.5, roughness: 0.5 });

        // Top rail
        const topRail = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 0.05), mat);
        topRail.position.y = 1.0;
        group.add(topRail);

        // Mid rail
        const midRail = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.04, 0.04), mat);
        midRail.position.y = 0.52;
        group.add(midRail);

        // Vertical posts
        const postGeo = new THREE.BoxGeometry(0.05, 1.0, 0.05);
        [-0.9, -0.45, 0, 0.45, 0.9].forEach(x => {
            const post = new THREE.Mesh(postGeo, mat);
            post.position.set(x, 0.5, 0);
            group.add(post);
        });

        return group;
    }

    _createPillar() {
        const group = new THREE.Group();
        const mat   = new THREE.MeshStandardMaterial({ color: 0xdddddd });

        const base = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.35), mat);
        base.position.y = 0.06;
        group.add(base);

        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.8, 16), mat);
        shaft.position.y = 0.12 + 1.4;
        group.add(shaft);

        const capital = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.35), mat);
        capital.position.y = 0.12 + 2.8 + 0.07;
        group.add(capital);

        return group;
    }

    _createDoorFrame() {
        const group = new THREE.Group();
        const mat   = new THREE.MeshStandardMaterial({ color: 0x5B4513 });

        const frameW = 0.1, frameH = 2.2, openW = 1.0, openH = 2.0;

        // Left post
        const leftPost = new THREE.Mesh(new THREE.BoxGeometry(frameW, frameH, frameW), mat);
        leftPost.position.set(-(openW / 2 + frameW / 2), frameH / 2, 0);
        group.add(leftPost);

        // Right post
        const rightPost = leftPost.clone();
        rightPost.position.set(openW / 2 + frameW / 2, frameH / 2, 0);
        group.add(rightPost);

        // Header (lintel)
        const headerW = openW + frameW * 2;
        const header  = new THREE.Mesh(new THREE.BoxGeometry(headerW, frameW, frameW), mat);
        header.position.set(0, openH + frameW / 2, 0);
        group.add(header);

        return group;
    }

    _createWardrobe() {
        const group = new THREE.Group();
        const body  = new THREE.MeshStandardMaterial({ color: 0x5B4513 });
        const door  = new THREE.MeshStandardMaterial({ color: 0x4a3010 });
        const hw    = new THREE.MeshStandardMaterial({ color: 0xccaa55, metalness: 0.6, roughness: 0.4 });

        const carcass = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.0, 0.55), body);
        carcass.position.y = 1.0;
        group.add(carcass);

        // Door panel
        const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.88, 0.03), door);
        doorPanel.position.set(0, 1.0, 0.29);
        group.add(doorPanel);

        // Handle
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, 0.03), hw);
        handle.position.set(0.35, 1.0, 0.32);
        group.add(handle);

        return group;
    }
}
