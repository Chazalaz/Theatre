import * as THREE from 'three';
import { Prop } from './Prop.js';

export class AssetLibrary
{
    constructor()
    {
        this.catalogue = 
        [
            {
                name: 'Chair',
                color: 0x8B4513,
                create: () => this._createChair(),
            },
            {
                name: 'Table',
                color: 0x5B4513,
                create: () => this._createTable(),
            },
            {
                name: 'Rostrum',
                color: 0x555555,
                create: () => new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 2), new THREE.MeshStandardMaterial({ color: 0x555555 })),
            },
            {
                name: 'Flat',
                color: 0x222222,
                create: () => new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.1), new THREE.MeshStandardMaterial({ color: 0x222222 })),
            },
        ];
    }

    getCatalogue()
    {
        return this.catalogue;
    }

    createProp(name)
    {
        const asset = this.catalogue.find(item => item.name === name);
        
        if(!asset)
        {
            console.warn(`Asset "${name}" not found in library`);
            return null;
        }

        return new Prop(asset.name, asset.create(), asset.color);
    }

    _createChair()
    {
        const group = new THREE.Group();
        const material = new THREE.MeshStandardMaterial({ color: 0x8B4513 });

        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.6), material);
        seat.position.y = 0.25;
        group.add(seat);

        const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.1), material);
        backrest.position.set(0, 0.65, -0.25);
        group.add(backrest);

        const legGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.1);
        const legPositions = [
            [-0.23, 0.0, -0.23],
            [0.23, 0.0, -0.23],
            [-0.23, 0.0, 0.23],
            [0.23, 0.0, 0.23],
        ];

        legPositions.forEach(([x, y, z]) => {
            const leg = new THREE.Mesh(legGeometry, material);
            leg.position.set(x, 0.0, z);
            group.add(leg);
        });

        return group;
    }

    _createTable()
    {
        const group = new THREE.Group();
        const material = new THREE.MeshStandardMaterial({ color: 0x5B4513 });

        const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.8), material);
        top.position.y = 0.35;
        group.add(top);

        const legGeometry = new THREE.BoxGeometry(0.1, 0.6, 0.1);
        const legPositions = [
            [-0.65, 0.0, -0.3],
            [0.65, 0.0, -0.3],
            [-0.65, 0.0, 0.3],
            [0.65, 0.0, 0.3],
        ];

        legPositions.forEach(([x, y, z]) => {
            const leg = new THREE.Mesh(legGeometry, material);
            leg.position.set(x, 0.0, z);
            group.add(leg);
        });

        return group;
    }
}
