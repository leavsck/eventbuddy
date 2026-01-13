import { eventModel } from "../model/eventModel.js";

const state = {
    participantsJsonOnly: [],
    selectedParticipantIds: new Set(),
    selectedTagIds: new Set(),
    selectedStatuses: new Set(),
};

function setDdOpen(ddEl, open) {
    ddEl.classList.toggle("is-open", open);
    const btn = ddEl.querySelector(".filter-dd__btn");
    if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
}

function updateLabels() {
    const pVal = document.getElementById("filter-participants-value");
    const tVal = document.getElementById("filter-tags-value");
    const sVal = document.getElementById("filter-status-value");

    if (pVal) pVal.textContent = state.selectedParticipantIds.size ? `${state.selectedParticipantIds.size} ausgewählt` : "Alle";
    if (tVal) tVal.textContent = state.selectedTagIds.size ? `${state.selectedTagIds.size} ausgewählt` : "Alle";
    if (sVal) sVal.textContent = state.selectedStatuses.size ? `${state.selectedStatuses.size} ausgewählt` : "Alle";
}

function renderStatusCheckboxes() {
    const box = document.getElementById("filter-statuses");
    if (!box) return;

    const statuses = [
        { id: "geplant", label: "Geplant" },
        { id: "abgeschlossen", label: "Abgeschlossen" },
    ];

    box.innerHTML = `
    <div class="filter-dd__panel-actions">
      <strong>Status</strong>
      <button type="button" class="filter-link" id="s-reset">Reset</button>
    </div>

    ${statuses.map(s => `
      <label class="filter-check">
        <input type="checkbox" value="${s.id}" ${state.selectedStatuses.has(s.id) ? "checked" : ""}>
        <span>${s.label}</span>
      </label>
    `).join("")}
  `;

    box.querySelector("#s-reset")?.addEventListener("click", () => {
        state.selectedStatuses.clear();
        renderStatusCheckboxes();
        updateLabels();
    });

    box.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener("change", () => {
            const id = cb.value;
            if (cb.checked) state.selectedStatuses.add(id);
            else state.selectedStatuses.delete(id);
            updateLabels();
        });
    });

    updateLabels();
}

function renderParticipantCheckboxes() {
    const box = document.getElementById("filter-participants");
    if (!box) return;

    const items = state.participantsJsonOnly;

    box.innerHTML = `
    <div class="filter-dd__panel-actions">
      <strong>Teilnehmer</strong>
      <button type="button" class="filter-link" id="p-reset">Reset</button>
    </div>

    ${items.map(p => `
      <label class="filter-check">
        <input type="checkbox" value="${p.id}" ${state.selectedParticipantIds.has(String(p.id)) ? "checked" : ""}>
        <span>${p.name}</span>
      </label>
    `).join("")}
  `;

    box.querySelector("#p-reset")?.addEventListener("click", () => {
        state.selectedParticipantIds.clear();
        renderParticipantCheckboxes();
        updateLabels();
    });

    box.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener("change", () => {
            const id = String(cb.value);
            if (cb.checked) state.selectedParticipantIds.add(id);
            else state.selectedParticipantIds.delete(id);
            updateLabels();
        });
    });

    updateLabels();
}

function renderTagCheckboxes() {
    const box = document.getElementById("filter-tags");
    if (!box) return;

    const tags = eventModel.tags || [];

    box.innerHTML = `
    <div class="filter-dd__panel-actions">
      <strong>Tags</strong>
      <button type="button" class="filter-link" id="t-reset">Reset</button>
    </div>

    ${tags.map(t => `
      <label class="filter-check">
        <input type="checkbox" value="${t.id}" ${state.selectedTagIds.has(String(t.id)) ? "checked" : ""}>
        <span>${t.name}</span>
      </label>
    `).join("")}
  `;

    box.querySelector("#t-reset")?.addEventListener("click", () => {
        state.selectedTagIds.clear();
        renderTagCheckboxes();
        updateLabels();
    });

    box.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener("change", () => {
            const id = String(cb.value);
            if (cb.checked) state.selectedTagIds.add(id);
            else state.selectedTagIds.delete(id);
            updateLabels();
        });
    });

    updateLabels();
}

function applyFilters() {
    document.dispatchEvent(new CustomEvent("filtersChanged", {
        detail: {
            statuses: Array.from(state.selectedStatuses),
            participantIds: Array.from(state.selectedParticipantIds),
            tagIds: Array.from(state.selectedTagIds),
        }
    }));
}

function initDropdowns() {
    const ddS = document.getElementById("dd-status");
    const ddP = document.getElementById("dd-participants");
    const ddT = document.getElementById("dd-tags");

    ddS?.querySelector(".filter-dd__btn")?.addEventListener("click", (e) => {
        e.stopPropagation();
        setDdOpen(ddS, !ddS.classList.contains("is-open"));
        if (ddP) setDdOpen(ddP, false);
        if (ddT) setDdOpen(ddT, false);
    });

    ddP?.querySelector(".filter-dd__btn")?.addEventListener("click", (e) => {
        e.stopPropagation();
        setDdOpen(ddP, !ddP.classList.contains("is-open"));
        if (ddS) setDdOpen(ddS, false);
        if (ddT) setDdOpen(ddT, false);
    });

    ddT?.querySelector(".filter-dd__btn")?.addEventListener("click", (e) => {
        e.stopPropagation();
        setDdOpen(ddT, !ddT.classList.contains("is-open"));
        if (ddS) setDdOpen(ddS, false);
        if (ddP) setDdOpen(ddP, false);
    });

    document.addEventListener("click", () => {
        if (ddS) setDdOpen(ddS, false);
        if (ddP) setDdOpen(ddP, false);
        if (ddT) setDdOpen(ddT, false);
    });

    ddS?.querySelector(".filter-dd__panel")?.addEventListener("click", (e) => e.stopPropagation());
    ddP?.querySelector(".filter-dd__panel")?.addEventListener("click", (e) => e.stopPropagation());
    ddT?.querySelector(".filter-dd__panel")?.addEventListener("click", (e) => e.stopPropagation());
}

function init() {
    initDropdowns();

    // Status ist statisch
    renderStatusCheckboxes();

    // Teilnehmer nur aus JSON (nicht neu hinzugefügte)
    eventModel.addEventListener("dataLoaded", async () => {
        try {
            const res = await fetch("json/participants.json");
            const data = await res.json();
            state.participantsJsonOnly = data;
            renderParticipantCheckboxes();
            renderTagCheckboxes();
        } catch (e) {
            console.error("Filter: participants.json konnte nicht geladen werden", e);
        }
    });

    // Tags live aktuell halten (JSON + neu hinzugefügt)
    eventModel.addEventListener("tagAdded", () => renderTagCheckboxes());
    eventModel.addEventListener("tagRemoved", () => renderTagCheckboxes());

    document.getElementById("btn-apply-filter")?.addEventListener("click", applyFilters);

    updateLabels();
}

init();
