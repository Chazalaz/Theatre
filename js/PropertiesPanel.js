import * as THREE from 'three';

export class PropertiesPanel
{
    constructor(onPropertyUpdated)
    {
        this.onPropertyUpdated = onPropertyUpdated;
        this.selectedProp = null;

        this.nameInput = document.querySelector('#prop-name');
        this.nameInput.maxLength = 50;
        this.positionXInput = document.querySelector('#prop-pos-x');
        this.positionYInput = document.querySelector('#prop-pos-y');
        this.positionZInput = document.querySelector('#prop-pos-z');
        this.sizeWInput = document.querySelector('#prop-size-w');
        this.sizeHInput = document.querySelector('#prop-size-h');
        this.sizeDInput = document.querySelector('#prop-size-d');
        this.rotationXInput = document.querySelector('#prop-rot-x');
        this.rotationYInput = document.querySelector('#prop-rot-y');
        this.rotationZInput = document.querySelector('#prop-rot-z');
        this.colorInput = document.querySelector('#prop-color');
        this.fieldsContainer = document.querySelector('#properties-fields');
        this.emptyMessage = document.querySelector('#properties-empty');

        this._bindEvents();
        this.setSelectedProp(null);
    }

    setSelectedProp(prop)
    {
        this.selectedProp = prop;
        if(!prop)
        {
            this.fieldsContainer.classList.add('hidden');
            this.emptyMessage.style.display = 'block';
            return;
        }

        this.fieldsContainer.classList.remove('hidden');
        this.emptyMessage.style.display = 'none';
        this._populateFields(prop);
    }

    _bindEvents()
    {
        this.nameInput.addEventListener('blur', () => this._commitName());
        this.nameInput.addEventListener('keydown', (event) => { if(event.key === 'Enter') this._commitName(); });

        this.positionXInput.addEventListener('blur', () => this._commitPosition());
        this.positionXInput.addEventListener('keydown', (event) => { if(event.key === 'Enter') this._commitPosition(); });
        this.positionYInput.addEventListener('blur', () => this._commitPosition());
        this.positionYInput.addEventListener('keydown', (event) => { if(event.key === 'Enter') this._commitPosition(); });
        this.positionZInput.addEventListener('blur', () => this._commitPosition());
        this.positionZInput.addEventListener('keydown', (event) => { if(event.key === 'Enter') this._commitPosition(); });

        this.sizeWInput.addEventListener('blur', () => this._commitSize());
        this.sizeWInput.addEventListener('keydown', (event) => { if(event.key === 'Enter') this._commitSize(); });
        this.sizeHInput.addEventListener('blur', () => this._commitSize());
        this.sizeHInput.addEventListener('keydown', (event) => { if(event.key === 'Enter') this._commitSize(); });
        this.sizeDInput.addEventListener('blur', () => this._commitSize());
        this.sizeDInput.addEventListener('keydown', (event) => { if(event.key === 'Enter') this._commitSize(); });

        this.rotationXInput.addEventListener('blur', () => this._commitRotation());
        this.rotationXInput.addEventListener('keydown', (event) => { if(event.key === 'Enter') this._commitRotation(); });
        this.rotationYInput.addEventListener('blur', () => this._commitRotation());
        this.rotationYInput.addEventListener('keydown', (event) => { if(event.key === 'Enter') this._commitRotation(); });
        this.rotationZInput.addEventListener('blur', () => this._commitRotation());
        this.rotationZInput.addEventListener('keydown', (event) => { if(event.key === 'Enter') this._commitRotation(); });

        this.colorInput.addEventListener('change', () => this._commitColor());
    }

    _populateFields(prop)
    {
        this.nameInput.value = prop.name;
        this.positionXInput.value = this._formatNumber(prop.mesh.position.x);
        this.positionYInput.value = this._formatNumber(prop.mesh.position.y);
        this.positionZInput.value = this._formatNumber(prop.mesh.position.z);

        const size = this._getPropDimensions(prop);
        this.sizeWInput.value = this._formatNumber(size.width);
        this.sizeHInput.value = this._formatNumber(size.height);
        this.sizeDInput.value = this._formatNumber(size.depth);

        this.rotationXInput.value = this._formatNumber(this._radToDeg(prop.mesh.rotation.x));
        this.rotationYInput.value = this._formatNumber(this._radToDeg(prop.mesh.rotation.y));
        this.rotationZInput.value = this._formatNumber(this._radToDeg(prop.mesh.rotation.z));

        this.colorInput.value = prop.getColorHex();
    }

    _commitName()
    {
        if(!this.selectedProp) return;
        const name = this.nameInput.value.trim();
        if(name === '')
        {
            this.nameInput.value = this.selectedProp.name;
            return;
        }
        this.selectedProp.setName(name);
        this._notifyUpdate();
    }

    _commitPosition()
    {
        if(!this.selectedProp) return;

        const x = parseFloat(this.positionXInput.value);
        const y = parseFloat(this.positionYInput.value);
        const z = parseFloat(this.positionZInput.value);

        if(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z))
        {
            this.selectedProp.setPosition(x, y, z);
            this._notifyUpdate();
        }
        else
        {
            this._populateFields(this.selectedProp);
        }
    }

    _commitSize()
    {
        if(!this.selectedProp) return;

        const width = parseFloat(this.sizeWInput.value);
        const height = parseFloat(this.sizeHInput.value);
        const depth = parseFloat(this.sizeDInput.value);

        if(Number.isFinite(width) && width > 0 && Number.isFinite(height) && height > 0 && Number.isFinite(depth) && depth > 0)
        {
            this.selectedProp.setSize(width, height, depth);
            this.positionYInput.value = this._formatNumber(this.selectedProp.mesh.position.y);
            this._notifyUpdate();
        }
        else
        {
            this._populateFields(this.selectedProp);
        }
    }

    _commitRotation()
    {
        if(!this.selectedProp) return;

        const x = parseFloat(this.rotationXInput.value);
        const y = parseFloat(this.rotationYInput.value);
        const z = parseFloat(this.rotationZInput.value);

        if(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z))
        {
            this.selectedProp.setRotationDegrees(x, y, z);
            this._notifyUpdate();
        }
        else
        {
            this._populateFields(this.selectedProp);
        }
    }

    _commitColor()
    {
        if(!this.selectedProp) return;
        this.selectedProp.setColor(this.colorInput.value);
        this._notifyUpdate();
    }

    _notifyUpdate()
    {
        if(typeof this.onPropertyUpdated === 'function')
        {
            this.onPropertyUpdated(this.selectedProp);
        }
    }

    _getPropDimensions(prop)
    {
        const box = new THREE.Box3().setFromObject(prop.mesh);
        const size = box.getSize(new THREE.Vector3());
        return {
            width: size.x,
            height: size.y,
            depth: size.z,
        };
    }

    _radToDeg(rad)
    {
        return rad * 180 / Math.PI;
    }

    _formatNumber(value)
    {
        return Number.isFinite(value) ? value.toFixed(2) : '0.00';
    }

    _getColorHex(hexString)
    {
        return `#${hexString.padStart(6, '0')}`;
    }
}
