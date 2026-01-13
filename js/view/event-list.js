import "./event-item.js";
import { eventModel } from "../model/eventModel.js";

class EventList extends HTMLElement {
    #filters = { statuses: [], participantIds: [], tagIds: [] };

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render();

        eventModel.addEventListener("dataLoaded", () => this.render());
        eventModel.addEventListener("eventAdded", () => this.render());
        eventModel.addEventListener("eventDeleted", () => this.render());
        eventModel.addEventListener("eventUpdated", () => this.render());

        document.addEventListener("filtersChanged", (e) => {
            this.#filters = e.detail;
            this.render();
        });
    }

    #matchesFilters(ev) {
        const { statuses, participantIds, tagIds } = this.#filters;

        // Status (multi)
        if (statuses?.length) {
            if (!statuses.includes(ev.status)) return false;
        }

        // Teilnehmer (OR-Logik)
        if (participantIds?.length) {
            const eventParticipantIds = (ev.participants || []).map(p => String(p.id));
            const ok = participantIds.some(id => eventParticipantIds.includes(String(id)));
            if (!ok) return false;
        }

        // Tags (OR-Logik)
        if (tagIds?.length) {
            const eventTagIds = (ev.tags || []).map(t => String(t.id));
            const ok = tagIds.some(id => eventTagIds.includes(String(id)));
            if (!ok) return false;
        }

        return true;
    }

    render() {
        this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="./styles/main.css">
      <ul class="event-list"></ul>
    `;

        const list = this.shadowRoot.querySelector(".event-list");
        const all = eventModel.events || [];
        const filtered = all.filter(ev => this.#matchesFilters(ev));

        if (!filtered.length) {
            const emptyMsg = document.createElement("p");
            emptyMsg.textContent = "Keine Events vorhanden (oder Filter zu streng).";
            emptyMsg.style.opacity = "0.7";
            emptyMsg.style.fontStyle = "italic";
            emptyMsg.style.padding = "1rem";
            list.appendChild(emptyMsg);
            return;
        }

        for (const ev of filtered) {
            const item = document.createElement("event-item");
            item.event = ev;
            list.appendChild(item);
        }
    }
}

customElements.define("event-list", EventList);
