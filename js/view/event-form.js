import { eventModel } from "../model/eventModel.js";
import Event from "../model/event.js";

class EventForm extends HTMLElement {
    #event;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        // bind damit removeEventListener möglich wäre (optional)
        this._rerender = () => this.render();
    }

    connectedCallback() {
        this.render();

        // wenn Daten später aus JSON kommen → neu rendern
        eventModel.addEventListener("dataLoaded", this._rerender);

        // wenn Tags/Teilnehmer geändert werden → neu rendern (damit neue Auswahl erscheint)
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

        // Für Edit-Modus: preselected IDs
        const selectedTagIds = (ev.tags || []).map(t => String(t.id));
        const selectedParticipantIds = (ev.participants || []).map(p => String(p.id));

        // Options für Tags (JSON + neu hinzugefügt)
        const tagOptions = (eventModel.tags || [])
            .map(t => {
                const selected = selectedTagIds.includes(String(t.id)) ? "selected" : "";
                return `<option value="${t.id}" ${selected}>${t.name}</option>`;
            })
            .join("");

        // Options für Teilnehmer (aus Model)
        const participantOptions = (eventModel.participants || [])
            .map(p => {
                const selected = selectedParticipantIds.includes(String(p.id)) ? "selected" : "";
                return `<option value="${p.id}" ${selected}>${p.name} (${p.email})</option>`;
            })
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
            <textarea class="form-textarea" name="description" placeholder="Dies ist eine Beschreibung des Events.">${ev.description || ""}</textarea>
          </div>

          <div class="form-field">
            <label class="form-label">Status</label>
            <select class="form-select" name="status">
              <option value="geplant" ${ev.status === "geplant" ? "selected" : ""}>geplant</option>
              <option value="abgeschlossen" ${ev.status === "abgeschlossen" ? "selected" : ""}>abgeschlossen</option>
            </select>
          </div>

          <!-- ✅ TAGS (aus JSON + neu hinzugefügt) -->
          <div class="form-field">
            <label class="form-label">Tags (mehrfach möglich)</label>
            <select class="form-select" name="tags" multiple size="4">
              ${tagOptions || `<option disabled>Keine Tags vorhanden</option>`}
            </select>
          </div>

          <!-- ✅ TEILNEHMER (aus JSON / Model) -->
          <div class="form-field">
            <label class="form-label">Teilnehmer (mehrfach möglich)</label>
            <select class="form-select" name="participants" multiple size="5">
              ${participantOptions || `<option disabled>Keine Teilnehmer vorhanden</option>`}
            </select>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-delete" id="btn-cancel">Event verwerfen</button>
            <button type="submit" class="btn btn-primary">Event speichern</button>
          </div>
        </form>
      </section>
    `;

        // Cancel Button (optional: zurück zur Liste)
        this.shadowRoot.querySelector("#btn-cancel").addEventListener("click", () => {
            // einfach Event nach außen schicken, Controller kann reagieren
            this.dispatchEvent(
                new CustomEvent("cancel-event-form", { bubbles: true, composed: true })
            );
        });

        // Submit
        this.shadowRoot.querySelector("#event-form").addEventListener("submit", (e) => {
            e.preventDefault();

            const form = e.target;
            const fd = new FormData(form);

            // normale Felder
            const data = Object.fromEntries(fd.entries());
            const id = ev.id || Date.now();

            // MULTI SELECTS: getAll()
            const tagIds = fd.getAll("tags").map(String);
            const participantIds = fd.getAll("participants").map(String);

            // IDs → Objekte aus dem Model
            const tags = (eventModel.tags || []).filter(t => tagIds.includes(String(t.id)));
            const participants = (eventModel.participants || []).filter(p => participantIds.includes(String(p.id)));

            const newEvent = new Event({
                id,
                title: data.title?.trim(),
                dateTime: data.dateTime,
                location: data.location?.trim(),
                description: data.description?.trim(),
                status: data.status,
                tags,
                participants
            });

            this.dispatchEvent(
                new CustomEvent("save-event", { detail: newEvent, bubbles: true, composed: true })
            );
        });
    }
}

customElements.define("event-form", EventForm);
