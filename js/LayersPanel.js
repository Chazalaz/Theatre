export class LayersPanel
{
    constructor(containerId, onLayerSelected, onLayerDeleted)
    {
        this.container = document.getElementById(containerId);
        this.layersList = this.container.querySelector('ul');
        this.onLayerSelected = onLayerSelected;
        this.onLayerDeleted = onLayerDeleted;
    }

    update(props)
    {
        this.layersList.innerHTML = '';

        props.forEach(prop => 
        {
            const li = document.createElement('li');
            li.textContent = prop.name;
            li.dataset.id = prop.id;

            li.addEventListener('click', () => {
                this.onLayerSelected(prop);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent           = 'X';
            deleteBtn.style.backgroundColor = 'transparent';
            deleteBtn.style.color           = '#ff4444';
            deleteBtn.style.border          = 'none';
            deleteBtn.style.cursor          = 'pointer';
            deleteBtn.style.fontWeight      = 'bold';


            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onLayerDeleted(prop);
            });

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