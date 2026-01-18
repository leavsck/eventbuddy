import { eventModel } from "../model/eventModel.js";
import Participant from "../model/participant.js";

class ParticipantList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.onSubmit = this.onSubmit.bind(this);
        this.onDataChanged = this.onDataChanged.bind(this);
    }

    connectedCallback() {
        this.render();

        eventModel.addEventListener("dataLoaded", this.onDataChanged);
        eventModel.addEventListener("participantAdded", this.onDataChanged);

        this.shadowRoot.querySelector("#participant-form")?.addEventListener("submit", this.onSubmit);
    }

    disconnectedCallback() {
        eventModel.removeEventListener("dataLoaded", this.onDataChanged);
        eventModel.removeEventListener("participantAdded", this.onDataChanged);

        this.shadowRoot.querySelector("#participant-form")?.removeEventListener("submit", this.onSubmit);
    }

    onDataChanged() {
        this.renderList();
    }

    render() {
        this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles/main.css">

      <section class="form-card">
        <div class="form-card__header">
          <h2 class="form-card__title">Teilnehmer anlegen</h2>
        </div>

        <form id="participant-form" class="form-grid">
          <div class="form-field">
            <label class="form-label" for="participant-name">Name*</label>
            <input class="form-input" id="participant-name" name="name" type="text" required placeholder="Max Mustermann" />
          </div>

          <div class="form-field">
            <label class="form-label" for="participant-email">E-Mail*</label>
            <input class="form-input" id="participant-email" name="email" type="email" required placeholder="max@example.com" />
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" type="submit">Hinzufügen</button>
          </div>
        </form>

        <h3 class="list-title">Bestehende Teilnehmer</h3>
        <ul class="participant-items"></ul>
      </section>
    `;

        this.renderList();
    }

    renderList() {
        const list = this.shadowRoot.querySelector(".participant-items");
        if (!list) return;

        list.innerHTML = "";

        const participants = eventModel.participants || [];
        if (!participants.length) {
            const empty = document.createElement("div");
            empty.className = "participant-empty";
            empty.textContent = "Noch keine Teilnehmer vorhanden.";
            list.appendChild(empty);
            return;
        }

        for (const p of participants) {
            const li = document.createElement("li");
            li.className = "participant-item";
            li.innerHTML = `
        <div class="participant-name">${p.name}</div>
        <div class="participant-mail">${p.email}</div>
      `;
            list.appendChild(li);
        }
    }

    onSubmit(e) {
        e.preventDefault();

        const form = this.shadowRoot.querySelector("#participant-form");
        if (!form) return;

        const data = Object.fromEntries(new FormData(form));
        const name = (data.name || "").trim();
        const email = (data.email || "").trim();

        if (!name || !email) return;

        const newParticipant = new Participant({ id: Date.now(), name, email });
        eventModel.addParticipant(newParticipant);

        form.reset();
        this.shadowRoot.querySelector("#participant-name")?.focus();
    }
}

customElements.define("participant-list", ParticipantList);
