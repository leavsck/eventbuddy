import "./event-item.js";
import { eventModel } from "../model/eventModel.js";


class EventList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        // Initiales Rendern
        this.render();

        // Aktualisieren, wenn sich die Daten ändern
        eventModel.addEventListener("dataLoaded", () => this.render());
        eventModel.addEventListener("eventAdded", () => this.render());
        eventModel.addEventListener("eventDeleted", () => this.render());
        eventModel.addEventListener("eventUpdated", () => this.render());
    }

    render() {
        // Shadow DOM leeren und neu aufbauen
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="./styles/main.css">
            <ul class="event-list"></ul>
        `;

        const list = this.shadowRoot.querySelector(".event-list");

        // Prüfen, ob Daten vorhanden sind
        if (!eventModel.events || eventModel.events.length === 0) {
            const emptyMsg = document.createElement("p");
            emptyMsg.textContent = "Keine Events vorhanden.";
            emptyMsg.style.opacity = "0.7";
            emptyMsg.style.fontStyle = "italic";
            emptyMsg.style.padding = "1rem";
            list.appendChild(emptyMsg);
            return;
        }

        // Alle Events aus dem Model rendern
        for (const ev of eventModel.events) {
            const item = document.createElement("event-item");
            item.event = ev;
            list.appendChild(item);
        }
    }
}

customElements.define("event-list", EventList);
