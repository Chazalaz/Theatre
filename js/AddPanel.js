export class AddPanel {
    constructor(panelId, itemsContainerId, onAssetSelected) {
        this._panel = document.getElementById(panelId);
        this._itemsContainer = document.getElementById(itemsContainerId);
        this._onAssetSelected = onAssetSelected;
        this._isOpen = false;

        const closeBtn = this._panel.querySelector('#close-panel');
        if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    }

    populate(assets) {
        this._itemsContainer.innerHTML = '';
        assets.forEach(asset => {
            const btn = document.createElement('button');
            btn.textContent = asset.name;
            btn.addEventListener('click', () => {
                this._onAssetSelected(asset.name);
                this.close();
            });
            this._itemsContainer.appendChild(btn);
        });
    }

    toggle() {
        this._isOpen ? this.close() : this.open();
    }

    open() {
        this._isOpen = true;
        this._panel.classList.add('open');
    }

    close() {
        this._isOpen = false;
        this._panel.classList.remove('open');
    }
}
