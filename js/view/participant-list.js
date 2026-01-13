import { eventModel } from "../model/eventModel.js";
import Participant from "../model/participant.js";

class ParticipantList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render();

        // Wenn JSON-Daten geladen wurden → neu rendern
        eventModel.addEventListener("dataLoaded", () => this.render());

        // Wenn ein Teilnehmer hinzugefügt wurde → neu rendern
        eventModel.addEventListener("participantAdded", () => this.render());
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


        // Liste rendern
        const list = this.shadowRoot.querySelector(".participant-items");
        list.innerHTML = "";

        for (const p of eventModel.participants) {
            const li = document.createElement("li");
            li.className = "participant-item";
            li.innerHTML = `
    <div class="participant-name">${p.name}</div>
    <div class="participant-mail">${p.email}</div>
  `;
            list.appendChild(li);
        }


        // Form submit
        const form = this.shadowRoot.querySelector("#participant-form");
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const data = Object.fromEntries(new FormData(form));
            const newParticipant = new Participant({
                id: Date.now(),
                name: data.name.trim(),
                email: data.email.trim(),
            });

            eventModel.addParticipant(newParticipant);

            form.reset();
        });
    }
}

customElements.define("participant-list", ParticipantList);
