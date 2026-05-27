import * as THREE from 'three';

export class Prop
{
    constructor(name, object3D, color = 0xff0000)
    {
        this.name = name;
        this.id = crypto.randomUUID();
        this.isSelected = false;
        this.mesh = object3D;
        this._setMaterialColor(color);
        this._setShadow(this.mesh);
        this.mesh.userData.propId = this.id;
    }

    _setMaterialColor(color)
    {
        if(this.mesh.isMesh)
        {
            this.mesh.material.color.set(color);
        }
        else if(this.mesh.isGroup)
        {
            this.mesh.traverse(child => {
                if(child.isMesh && child.material)
                {
                    child.material.color.set(color);
                }
            });
        }
    }

    _setShadow(object)
    {
        object.traverse(child => {
            if(child.isMesh)
            {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }

    placeAtCentre(stageHeight)
    {
        const box = new THREE.Box3().setFromObject(this.mesh);
        const currentBottom = box.min.y;
        this.mesh.position.set(0, 0, 0);
        this.mesh.position.y += stageHeight - currentBottom;
    }

    select()
    {
        this.isSelected = true;
        this._setEmissive(0xffa500, 0.4);
    }

    deselect()
    {
        this.isSelected = false;
        this._setEmissive(0x000000, 0);
    }

    _setEmissive(color, intensity)
    {
        this.mesh.traverse(child => {
            if(child.isMesh && child.material && 'emissive' in child.material)
            {
                child.material.emissive.set(color);
                child.material.emissiveIntensity = intensity;
            }
        });
    }

    setName(name)
    {
        if(typeof name !== 'string' || name.trim() === '') return;
        this.name = name.trim();
    }

    setPosition(x, y, z)
    {
        if(typeof x === 'number') this.mesh.position.x = x;
        if(typeof y === 'number') this.mesh.position.y = y;
        if(typeof z === 'number') this.mesh.position.z = z;
    }

    setSize(width, height, depth)
    {
        const box = new THREE.Box3().setFromObject(this.mesh);
        const size = box.getSize(new THREE.Vector3());

        if(size.x > 0 && typeof width === 'number')
        {
            this.mesh.scale.x *= width / size.x;
        }
        if(size.y > 0 && typeof height === 'number')
        {
            this.mesh.scale.y *= height / size.y;
        }
        if(size.z > 0 && typeof depth === 'number')
        {
            this.mesh.scale.z *= depth / size.z;
        }

        const updatedBox = new THREE.Box3().setFromObject(this.mesh);
        const halfHeight = (updatedBox.max.y - updatedBox.min.y) / 2;
        if(this.mesh.position.y < halfHeight)
        {
            this.mesh.position.y = halfHeight;
        }
    }

    setRotationDegrees(x, y, z)
    {
        if(typeof x === 'number') this.mesh.rotation.x = x * Math.PI / 180;
        if(typeof y === 'number') this.mesh.rotation.y = y * Math.PI / 180;
        if(typeof z === 'number') this.mesh.rotation.z = z * Math.PI / 180;
    }

    getColorHex()
    {
        let hex = null;

        this.mesh.traverse(child => {
            if(hex === null && child.isMesh && child.material && child.material.color)
            {
                hex = child.material.color.getHexString();
            }
        });

        return hex ? `#${hex.padStart(6, '0')}` : '#ffffff';
    }

    setColor(color)
    {
        if(!color) return;
        this._setMaterialColor(color);
    }

    move(x, z)
    {
        this.mesh.position.x = x;
        this.mesh.position.z = z;
    }
}
