import { STAGE_CONFIG } from './config.js';

export class StagePanel {
    constructor(stage) {
        this._stage = stage;
        this._bindControls();
        this.refresh();
    }

    // ── Bindings ──────────────────────────────────────────────────────────────

    _bindControls() {
        document.getElementById('floor-color').addEventListener('input', (e) => {
            this._stage.setFloorColor(e.target.value);
        });

        for (const side of ['left', 'right']) {
            document.getElementById(`${side}-wall-visible`).addEventListener('change', (e) => {
                this._stage.setWallVisible(side, e.target.checked);
            });

            document.getElementById(`${side}-wall-color`).addEventListener('input', (e) => {
                this._stage.setWallColor(side, e.target.value);
            });

            document.getElementById(`add-${side}-doorway`).addEventListener('click', () => {
                this._stage.addDoorway(side, {
                    zCenter: 0,
                    width:   1.2,
                    height:  2.1,
                });
                this._renderDoorways(side);
            });
        }
    }

    // ── Refresh (called after project load) ──────────────────────────────────

    refresh() {
        const config = this._stage.getConfig();

        document.getElementById('floor-color').value = config.floorColor;

        for (const side of ['left', 'right']) {
            const wall = config[`${side}Wall`];
            document.getElementById(`${side}-wall-visible`).checked = wall.visible;
            document.getElementById(`${side}-wall-color`).value     = wall.color;
            this._renderDoorways(side);
        }
    }

    // ── Doorway list rendering ────────────────────────────────────────────────

    _renderDoorways(side) {
        const container = document.getElementById(`${side}-wall-doorways`);
        const { doorways } = this._stage.getWallConfig(side);
        container.innerHTML = '';

        doorways.forEach(d => {
            const posFromFront = (STAGE_CONFIG.depth / 2 - d.zCenter).toFixed(2);
            const item = document.createElement('div');
            item.className = 'doorway-item';
            item.dataset.id = d.id;
            item.innerHTML = `
                <div class="doorway-fields">
                    <div class="doorway-field">
                        <label>Pos</label>
                        <input type="number" min="0" max="${STAGE_CONFIG.depth.toFixed(2)}" step="0.1" value="${posFromFront}" data-prop="position" />
                    </div>
                    <div class="doorway-field">
                        <label>W</label>
                        <input type="number" min="0.3" max="${STAGE_CONFIG.depth.toFixed(2)}" step="0.1" value="${d.width.toFixed(2)}" data-prop="width" />
                    </div>
                    <div class="doorway-field">
                        <label>H</label>
                        <input type="number" min="0.3" max="${STAGE_CONFIG.wallHeight.toFixed(2)}" step="0.1" value="${d.height.toFixed(2)}" data-prop="height" />
                    </div>
                </div>
                <button class="doorway-remove" title="Remove doorway">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            `;

            this._bindDoorwayItem(item, side, d.id);
            container.appendChild(item);
        });
    }

    _bindDoorwayItem(item, side, doorwayId) {
        const getInput = (prop) => item.querySelector(`[data-prop="${prop}"]`);

        const commit = () => {
            const pos = parseFloat(getInput('position').value);
            const w   = parseFloat(getInput('width').value);
            const h   = parseFloat(getInput('height').value);
            if (!Number.isFinite(pos) || !Number.isFinite(w) || !Number.isFinite(h)) return;
            this._stage.updateDoorway(side, doorwayId, {
                zCenter: STAGE_CONFIG.depth / 2 - pos,
                width: w,
                height: h,
            });
        };

        item.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', commit);
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') commit(); });
        });

        item.querySelector('.doorway-remove').addEventListener('click', () => {
            this._stage.removeDoorway(side, doorwayId);
            this._renderDoorways(side);
        });
    }
}
