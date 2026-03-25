import * as THREE from 'three';

export class Prop
{
    constructor(name, geometry, color = 0xff0000)
    {
        this.name = name;
        this.id = crypto.randomUUID();
        this.isSelected = false;

        const material = new THREE.MeshStandardMaterial({ color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.userData.propId = this.id;
    }

    placeAtCentre(stageHeight)
    {
        this.mesh.position.set(0, stageHeight + this.mesh.geometry.parameters.height / 2, 0);
    }

    select()
    {
        this.isSelected = true;
        this.mesh.material.emissive.set(0xffa500);
        this.mesh.material.emissiveIntensity = 0.4;
    }

    deselect()
    {
        this.isSelected = false;
        this.mesh.material.emissive.set(0x000000);
        this.mesh.material.emissiveIntensity = 0;
    }

    move(x, z)
    {
        this.mesh.position.x = x;
        this.mesh.position.z = z;
    }
}
