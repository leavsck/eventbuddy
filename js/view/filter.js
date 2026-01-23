import { eventModel } from "../model/eventModel.js";

// lokaler filter-state (sets = keine doppelten werte + schnell prüfen)
const state = {
    selectedParticipantIds: new Set(),
    selectedTagIds: new Set(),
    selectedStatuses: new Set(),
};

// dropdown auf/zu + aria für accessibility
function setDdOpen(ddEl, open) {
    ddEl.classList.toggle("is-open", open);
    const btn = ddEl.querySelector(".filter-dd__btn");
    if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
}

// labels oben im dropdown aktualisieren ("x ausgewählt" / "alle")
function updateLabels() {
    const pVal = document.getElementById("filter-participants-value");
    const tVal = document.getElementById("filter-tags-value");
    const sVal = document.getElementById("filter-status-value");

    if (pVal) pVal.textContent = state.selectedParticipantIds.size ? `${state.selectedParticipantIds.size} ausgewählt` : "Alle";
    if (tVal) tVal.textContent = state.selectedTagIds.size ? `${state.selectedTagIds.size} ausgewählt` : "Alle";
    if (sVal) sVal.textContent = state.selectedStatuses.size ? `${state.selectedStatuses.size} ausgewählt` : "Alle";
}

// status-checkboxen rendern (fixe 2 status-werte)
function renderStatusCheckboxes() {
    const box = document.getElementById("filter-statuses");
    if (!box) return;

    const statuses = [
        { id: "geplant", label: "Geplant" },
        { id: "abgeschlossen", label: "Abgeschlossen" },
    ];

    // panel html bauen
    box.innerHTML = `
    <div class="filter-dd__panel-actions">
      <strong>Status</strong>
      <button type="button" class="filter-link" id="s-reset">Reset</button>
    </div>

    ${statuses
        .map(
            (s) => `
      <label class="filter-check">
        <input type="checkbox" value="${s.id}" ${state.selectedStatuses.has(s.id) ? "checked" : ""}>
        <span>${s.label}</span>
      </label>
    `
        )
        .join("")}
  `;

    // reset setzt set leer + rendert neu
    box.querySelector("#s-reset")?.addEventListener("click", () => {
        state.selectedStatuses.clear();
        renderStatusCheckboxes();
        updateLabels();
    });

    // bei checkbox change → set updaten
    box.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        cb.addEventListener("change", () => {
            const id = cb.value;
            cb.checked ? state.selectedStatuses.add(id) : state.selectedStatuses.delete(id);
            updateLabels();
        });
    });

    updateLabels();
}

// teilnehmer-checkboxen rendern (kommt aus eventModel)
function renderParticipantCheckboxes() {
    const box = document.getElementById("filter-participants");
    if (!box) return;

    const items = eventModel.participants || [];

    box.innerHTML = `
    <div class="filter-dd__panel-actions">
      <strong>Teilnehmer</strong>
      <button type="button" class="filter-link" id="p-reset">Reset</button>
    </div>

    ${items
        .map(
            (p) => `
      <label class="filter-check">
        <input type="checkbox" value="${p.id}" ${state.selectedParticipantIds.has(String(p.id)) ? "checked" : ""}>
        <span>${p.name}</span>
      </label>
    `
        )
        .join("")}
  `;

    // reset
    box.querySelector("#p-reset")?.addEventListener("click", () => {
        state.selectedParticipantIds.clear();
        renderParticipantCheckboxes();
        updateLabels();
    });

    // set updaten (ids als string, damit vergleiche sauber sind)
    box.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        cb.addEventListener("change", () => {
            const id = String(cb.value);
            cb.checked ? state.selectedParticipantIds.add(id) : state.selectedParticipantIds.delete(id);
            updateLabels();
        });
    });

    updateLabels();
}

// tag-checkboxen rendern (kommt aus eventModel)
function renderTagCheckboxes() {
    const box = document.getElementById("filter-tags");
    if (!box) return;

    const tags = eventModel.tags || [];

    box.innerHTML = `
    <div class="filter-dd__panel-actions">
      <strong>Tags</strong>
      <button type="button" class="filter-link" id="t-reset">Reset</button>
    </div>

    ${tags
        .map(
            (t) => `
      <label class="filter-check">
        <input type="checkbox" value="${t.id}" ${state.selectedTagIds.has(String(t.id)) ? "checked" : ""}>
        <span>${t.name}</span>
      </label>
    `
        )
        .join("")}
  `;

    // reset
    box.querySelector("#t-reset")?.addEventListener("click", () => {
        state.selectedTagIds.clear();
        renderTagCheckboxes();
        updateLabels();
    });

    // set updaten
    box.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        cb.addEventListener("change", () => {
            const id = String(cb.value);
            cb.checked ? state.selectedTagIds.add(id) : state.selectedTagIds.delete(id);
            updateLabels();
        });
    });

    updateLabels();
}

// feuert ein globales event, damit z.b. event-list neu filtert
function applyFilters() {
    document.dispatchEvent(
        new CustomEvent("filtersChanged", {
            detail: {
                statuses: Array.from(state.selectedStatuses),
                participantIds: Array.from(state.selectedParticipantIds),
                tagIds: Array.from(state.selectedTagIds),
            },
        })
    );
}

// dropdowns öffnen/schließen + outside click handling
function initDropdowns() {
    const wrapS = document.getElementById("dd-status");
    const wrapP = document.getElementById("dd-participants");
    const wrapT = document.getElementById("dd-tags");

    const ddS = wrapS?.querySelector(".filter-dd");
    const ddP = wrapP?.querySelector(".filter-dd");
    const ddT = wrapT?.querySelector(".filter-dd");

    const btnS = ddS?.querySelector(".filter-dd__btn");
    const btnP = ddP?.querySelector(".filter-dd__btn");
    const btnT = ddT?.querySelector(".filter-dd__btn");

    // toggle: eins auf, die anderen zu
    btnS?.addEventListener("click", (e) => {
        e.stopPropagation();
        ddS && setDdOpen(ddS, !ddS.classList.contains("is-open"));
        ddP && setDdOpen(ddP, false);
        ddT && setDdOpen(ddT, false);
    });

    btnP?.addEventListener("click", (e) => {
        e.stopPropagation();
        ddP && setDdOpen(ddP, !ddP.classList.contains("is-open"));
        ddS && setDdOpen(ddS, false);
        ddT && setDdOpen(ddT, false);
    });

    btnT?.addEventListener("click", (e) => {
        e.stopPropagation();
        ddT && setDdOpen(ddT, !ddT.classList.contains("is-open"));
        ddS && setDdOpen(ddS, false);
        ddP && setDdOpen(ddP, false);
    });

    // klick außerhalb schließt alles
    document.addEventListener("click", () => {
        ddS && setDdOpen(ddS, false);
        ddP && setDdOpen(ddP, false);
        ddT && setDdOpen(ddT, false);
    });

    // klick im panel soll nicht schließen
    ddS?.querySelector(".filter-dd__panel")?.addEventListener("click", (e) => e.stopPropagation());
    ddP?.querySelector(".filter-dd__panel")?.addEventListener("click", (e) => e.stopPropagation());
    ddT?.querySelector(".filter-dd__panel")?.addEventListener("click", (e) => e.stopPropagation());
}

// init baut alles auf + hängt listeners dran
function init() {
    initDropdowns();
    renderStatusCheckboxes();

    // sobald daten geladen → teilnehmer & tags rendern
    eventModel.addEventListener("dataLoaded", () => {
        renderParticipantCheckboxes();
        renderTagCheckboxes();
    });

    // live updates, wenn neue teilnehmer/tags dazukommen oder gelöscht werden
    eventModel.addEventListener("participantAdded", renderParticipantCheckboxes);
    eventModel.addEventListener("tagAdded", renderTagCheckboxes);
    eventModel.addEventListener("tagRemoved", renderTagCheckboxes);

    // apply button feuert filtersChanged
    document.getElementById("btn-apply-filter")?.addEventListener("click", applyFilters);

    updateLabels();
}

init();
