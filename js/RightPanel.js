export class RightPanel {
    constructor() {
        this._panel = document.getElementById('right-panel');
        this._tab   = document.getElementById('panel-tab');

        // Read initial collapsed state directly from the DOM so new sections
        // added to HTML are automatically tracked without touching this class.
        this._sectionState = {};
        this._panel.querySelectorAll('.panel-section').forEach(section => {
            const name = section.id.replace('-section', '');
            this._sectionState[name] = section.classList.contains('collapsed');
        });

        this._bindEvents();
    }

    _bindEvents() {
        this._tab.addEventListener('click', () => this._toggleVisibility());

        this._panel.querySelectorAll('.panel-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this._toggleSection(toggle.dataset.section);
            });
        });

        this._panel.querySelectorAll('.panel-section').forEach(section => {
            const header = section.querySelector('.panel-header');
            const toggle = section.querySelector('.panel-toggle');
            header.addEventListener('click', (e) => {
                if (e.target === toggle || toggle.contains(e.target)) return;
                toggle.click();
            });
        });
    }

    _toggleSection(sectionName) {
        const section = document.getElementById(`${sectionName}-section`);
        const content = section.querySelector('.panel-content');
        const toggle  = section.querySelector('.panel-toggle');

        this._sectionState[sectionName] = !this._sectionState[sectionName];
        const isCollapsed = this._sectionState[sectionName];

        content.classList.toggle('collapsed', isCollapsed);
        toggle.classList.toggle('collapsed', isCollapsed);
        section.classList.toggle('collapsed', isCollapsed);
    }

    _toggleVisibility() {
        this._isVisible = !(this._isVisible ?? true);
        document.body.classList.toggle('panel-hidden', !this._isVisible);
    }
}
