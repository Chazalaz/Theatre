export class LayersPanel
{
    constructor(containerId, onLayerSelected, onLayerDeleted, onLayerDuplicated)
    {
        this.container = document.getElementById(containerId);
        this.layersList = this.container.querySelector('ul');
        this.onLayerSelected = onLayerSelected;
        this.onLayerDeleted = onLayerDeleted;
        this.onLayerDuplicated = onLayerDuplicated;
    }

    update(props)
    {
        this.layersList.innerHTML = '';

        props.forEach(prop => 
        {
            const li = document.createElement('li');
            li.dataset.id = prop.id;

            const nameSpan = document.createElement('span');
            nameSpan.textContent = prop.name;
            nameSpan.style.cursor = 'pointer';

            li.addEventListener('click', () => {
                this.onLayerSelected(prop);
            });

            const duplicateBtn = document.createElement('button');
            duplicateBtn.dataset.action = 'duplicate';
            duplicateBtn.title = 'Duplicate';
            duplicateBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;

            duplicateBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if(this.onLayerDuplicated)
                {
                    this.onLayerDuplicated(prop);
                }
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.dataset.action = 'delete';
            deleteBtn.title = 'Delete';
            deleteBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onLayerDeleted(prop);
            });

            li.appendChild(nameSpan);
            li.appendChild(duplicateBtn);
            li.appendChild(deleteBtn);
            this.layersList.appendChild(li);
        });
    }

    setSelected(prop)
    {
        this.layersList.querySelectorAll('li').forEach(li => li.classList.remove('selected'));

        const matchingLi = this.layersList.querySelector(`li[data-id="${prop.id}"]`);

        if(matchingLi) matchingLi.classList.add('selected');
    }

}