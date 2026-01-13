import { eventModel } from "../model/eventModel.js";
import Event from "../model/event.js";

class EventForm extends HTMLElement {
    #event;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render(); // <-- DAS ist der Fix
    }

    set event(ev) {
        this.#event = ev;
        this.render();
    }

    render() {
        const ev = this.#event || {};
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

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="btn-cancel">Event verwerfen</button>
        <button type="submit" class="btn btn-primary">Event speichern</button>
      </div>
    </form>
  </section>
`;


        this.shadowRoot.querySelector("form").addEventListener("submit", e => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target));
            data.id = ev.id || Date.now();
            const newEvent = new Event(data);
            this.dispatchEvent(new CustomEvent("save-event", { detail: newEvent, bubbles: true, composed: true }));
        });
    }
}
customElements.define("event-form", EventForm);
