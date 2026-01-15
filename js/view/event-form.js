import { eventModel } from "../model/eventModel.js";
import Event from "../model/event.js";

class EventForm extends HTMLElement {
    #event;
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this._rerender = () => this.render();
    }

    connectedCallback() {
        this.render();
        eventModel.addEventListener("dataLoaded", this._rerender);
        eventModel.addEventListener("tagAdded", this._rerender);
        eventModel.addEventListener("tagRemoved", this._rerender);
        eventModel.addEventListener("participantAdded", this._rerender);
    }

    set event(ev) {
        this.#event = ev;
        this.render();
    }

    render() {
        const ev = this.#event || {};

        const selectedTagIds = (ev.tags || []).map(t => String(t.id));
        const selectedParticipantIds = (ev.participants || []).map(p => String(p.id));

        const tagOptions = (eventModel.tags || [])
            .map(t => `<option value="${t.id}" ${selectedTagIds.includes(String(t.id)) ? "selected" : ""}>${t.name}</option>`)
            .join("");

        const participantOptions = (eventModel.participants || [])
            .map(p => `<option value="${p.id}" ${selectedParticipantIds.includes(String(p.id)) ? "selected" : ""}>${p.name} (${p.email})</option>`)
            .join("");

        this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles/main.css">

      <section class="form-card">
        <div class="form-card__header">
          <h2 class="form-card__title">${ev.id ? "Event bearbeiten" : "Neues Event"}</h2>
        </div>

        <form id="event-form" class="form-grid">
          <div class="form-field">
            <label class="form-label">Name des Events</label>
            <input class="form-input" name="title" placeholder="Event Name" value="${ev.title || ""}" required>
          </div>

          <div class="form-field">
            <label class="form-label">Datum und Uhrzeit</label>
            <input class="form-input" type="datetime-local" name="dateTime" value="${ev.dateTime || ""}" required>
          </div>

          <div class="form-field">
            <label class="form-label">Ort</label>
            <input class="form-input" name="location" placeholder="Büro" value="${ev.location || ""}" required>
          </div>

          <div class="form-field">
            <label class="form-label">Beschreibung</label>
            <textarea class="form-textarea" name="description" placeholder="Beschreibung...">${ev.description || ""}</textarea>
          </div>

          <div class="form-field">
            <label class="form-label">Status</label>
            <select class="form-select" name="status">
              <option value="geplant" ${ev.status === "geplant" ? "selected" : ""}>geplant</option>
              <option value="abgeschlossen" ${ev.status === "abgeschlossen" ? "selected" : ""}>abgeschlossen</option>
            </select>
          </div>

          <div class="form-field">
            <label class="form-label">Bild-URL (optional)</label>
            <input class="form-input" name="image" value="${ev.image || ""}">
          </div>

          <div class="form-field">
            <label class="form-label">Tags (mehrfach möglich)</label>
            <select class="form-select" name="tags" multiple size="4">
              ${tagOptions || `<option disabled>Keine Tags vorhanden</option>`}
            </select>
          </div>

          <div class="form-field">
            <label class="form-label">Teilnehmer (mehrfach möglich)</label>
            <select class="form-select" name="participants" multiple size="6">
              ${participantOptions || `<option disabled>Keine Teilnehmer vorhanden</option>`}
            </select>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-delete" id="btn-cancel">Änderungen verwerfen</button>
            <button type="submit" class="btn btn-primary">Änderungen speichern</button>
          </div>
        </form>
      </section>
    `;

        this.shadowRoot.querySelector("#btn-cancel")?.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("cancel-event-form", { bubbles: true, composed: true }));
        });

        this.shadowRoot.querySelector("#event-form")?.addEventListener("submit", (e) => {
            e.preventDefault();

            const form = e.target;
            const fd = new FormData(form);
            const data = Object.fromEntries(fd.entries());

            // Pflicht-Validierung (zusätzlich zu required)
            const title = (data.title || "").trim();
            const location = (data.location || "").trim();
            const dateTime = data.dateTime;

            if (!title || !location || !dateTime) return;

            const id = ev.id || Date.now();
            const tagIds = fd.getAll("tags").map(String);
            const participantIds = fd.getAll("participants").map(String);

            const tags = (eventModel.tags || []).filter(t => tagIds.includes(String(t.id)));
            const participants = (eventModel.participants || []).filter(p => participantIds.includes(String(p.id)));

            const newEvent = new Event({
                id,
                title,
                dateTime,
                location,
                description: (data.description || "").trim(),
                status: data.status,
                tags,
                participants,
                image: (data.image || "").trim()
            });

            this.dispatchEvent(new CustomEvent("save-event", { detail: newEvent, bubbles: true, composed: true }));
        });
    }
}

customElements.define("event-form", EventForm);
