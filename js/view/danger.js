// js/view/danger.js
let confirmFn = null;
let listenersBound = false;

function getEls() {
    return {
        dangerSection: document.getElementById("danger-section"),
        btnCancel: document.getElementById("btn-cancel-delete"),
        btnConfirm: document.getElementById("btn-confirm-delete"),
        titleEl: document.getElementById("danger-title"),
        descEl: document.getElementById("danger-desc"),
    };
}

function ensureListeners() {
    if (listenersBound) return;

    const { btnCancel, btnConfirm } = getEls();
    if (!btnCancel || !btnConfirm) return; // DOM noch nicht da

    btnCancel.addEventListener("click", () => {
        hideDanger();
    });

    btnConfirm.addEventListener("click", () => {
        if (typeof confirmFn === "function") confirmFn();
    });

    listenersBound = true;
}

export function setDangerConfirm(fn) {
    confirmFn = fn;
    ensureListeners();
}

export function setDangerContent({ title, desc, confirmLabel } = {}) {
    const { titleEl, descEl, btnConfirm } = getEls();
    if (titleEl && typeof title === "string") titleEl.textContent = title;
    if (descEl && typeof desc === "string") descEl.textContent = desc;
    if (btnConfirm && typeof confirmLabel === "string") btnConfirm.textContent = confirmLabel;

    ensureListeners();
}

export function showDanger() {
    const { dangerSection } = getEls();
    if (!dangerSection) return;

    ensureListeners();

    dangerSection.classList.remove("is-visible");
    requestAnimationFrame(() => dangerSection.classList.add("is-visible"));
}

export function hideDanger() {
    const { dangerSection } = getEls();
    if (!dangerSection) return;

    dangerSection.classList.remove("is-visible");
    confirmFn = null;
}
