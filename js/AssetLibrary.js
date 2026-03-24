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
                geometry: new THREE.BoxGeometry(0.5, 0.5, 0.5),
            },
            {
                name: 'Table',
                color: 0x8B4513,
                geometry: new THREE.BoxGeometry(1.5, 0.5, 0.8),
            },
            {
                name: 'Rostrum',
                color: 0x555555,
                geometry: new THREE.BoxGeometry(2, 0.5, 2),
            },
            {
                name: 'Flat',
                color: 0x222222,
                geometry: new THREE.BoxGeometry(2, 3, 0.1),
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

        return new Prop(asset.name, asset.geometry.clone(), asset.color);
    }
}