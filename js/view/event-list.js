import "./event-item.js";
import { eventModel } from "../model/eventModel.js";

// web component für die event-liste
class EventList extends HTMLElement {
    // aktuell gesetzte filter
    #filters = { statuses: [], participantIds: [], tagIds: [] };

    constructor() {
        super();
        // shadow dom für gekapseltes layout
        this.attachShadow({ mode: "open" });

        // helper zum neu rendern
        this._rerender = () => this.render();
    }

    connectedCallback() {
        // initiales rendern
        this.render();

        // neu rendern, wenn sich events im model ändern
        eventModel.addEventListener("eventsChanged", this._rerender);

        // filter aus externer filter-komponente übernehmen
        document.addEventListener("filtersChanged", (e) => {
            this.#filters = e.detail;
            this.render();
        });
    }

    // prüft, ob ein event zu den aktuellen filtern passt
    #matchesFilters(ev) {
        const { statuses, participantIds, tagIds } = this.#filters;

        // status-filter
        if (statuses?.length) {
            if (!statuses.includes(ev.status)) return false;
        }

        // teilnehmer-filter
        if (participantIds?.length) {
            const eventParticipantIds = (ev.participants || []).map(p => String(p.id));
            const ok = participantIds.some(id => eventParticipantIds.includes(String(id)));
            if (!ok) return false;
        }

        // tag-filter
        if (tagIds?.length) {
            const eventTagIds = (ev.tags || []).map(t => String(t.id));
            const ok = tagIds.some(id => eventTagIds.includes(String(id)));
            if (!ok) return false;
        }

        return true;
    }

    render() {
        // grundstruktur der liste
        this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="./styles/main.css">
      <ul class="event-list"></ul>
    `;

        const list = this.shadowRoot.querySelector(".event-list");

        // alle events aus dem model holen
        const all = eventModel.events || [];

        // events anhand der filter einschränken
        const filtered = all.filter(ev => this.#matchesFilters(ev));

        // leerzustand anzeigen
        if (!filtered.length) {
            const emptyMsg = document.createElement("p");
            emptyMsg.textContent = "Keine Events vorhanden (oder Filter zu streng).";
            emptyMsg.style.opacity = "0.7";
            emptyMsg.style.fontStyle = "italic";
            emptyMsg.style.padding = "1rem";
            list.appendChild(emptyMsg);
            return;
        }

        // event-items erzeugen und anhängen
        for (const ev of filtered) {
            const item = document.createElement("event-item");
            item.event = ev;
            list.appendChild(item);
        }
    }
}

// custom element registrieren
customElements.define("event-list", EventList);
