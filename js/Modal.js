export class Modal {
    static _overlay    = null;
    static _msgEl      = null;
    static _inputEl    = null;
    static _cancelBtn  = null;
    static _confirmBtn = null;
    static _pending    = null;

    static _init() {
        if (Modal._overlay) return;

        Modal._overlay    = document.getElementById('modal-overlay');
        Modal._msgEl      = document.getElementById('modal-message');
        Modal._inputEl    = document.getElementById('modal-input');
        Modal._cancelBtn  = document.getElementById('modal-cancel');
        Modal._confirmBtn = document.getElementById('modal-confirm');

        Modal._confirmBtn.addEventListener('click', () => Modal._settle(true));
        Modal._cancelBtn.addEventListener('click',  () => Modal._settle(false));

        Modal._overlay.addEventListener('click', (e) => {
            if (e.target === Modal._overlay) Modal._settle(false);
        });

        document.addEventListener('keydown', (e) => {
            if (!Modal._pending) return;
            if (e.key === 'Enter')  { e.preventDefault(); Modal._settle(true); }
            if (e.key === 'Escape') { e.preventDefault(); Modal._settle(false); }
        });
    }

    static _settle(confirmed) {
        if (!Modal._pending) return;

        const { type, resolve } = Modal._pending;
        Modal._pending = null;
        Modal._overlay.classList.add('hidden');

        if (type === 'prompt')  resolve(confirmed ? Modal._inputEl.value : null);
        else if (type === 'confirm') resolve(confirmed);
        else resolve(undefined); // alert — result unused
    }

    static _show(type, message, defaultValue = '') {
        Modal._init();

        Modal._msgEl.textContent = message;
        Modal._overlay.dataset.type = type;

        const isPrompt  = type === 'prompt';
        const isAlert   = type === 'alert';

        Modal._inputEl.classList.toggle('hidden', !isPrompt);
        Modal._cancelBtn.classList.toggle('hidden', isAlert);

        if (isPrompt) {
            Modal._inputEl.value = defaultValue;
        }

        Modal._overlay.classList.remove('hidden');

        if (isPrompt) {
            Modal._inputEl.focus();
            Modal._inputEl.select();
        } else {
            Modal._confirmBtn.focus();
        }

        return new Promise(resolve => {
            Modal._pending = { type, resolve };
        });
    }

    static alert(message)                      { return Modal._show('alert',   message); }
    static confirm(message)                    { return Modal._show('confirm', message); }
    static prompt(message, defaultValue = '')  { return Modal._show('prompt',  message, defaultValue); }
}
