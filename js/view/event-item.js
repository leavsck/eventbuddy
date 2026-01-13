import { eventModel } from "../model/eventModel.js";

class EventItem extends HTMLElement {
    #event;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    set event(ev) {
        this.#event = ev;
        this.render();
    }

    render() {
        if (!this.#event) return;

        const ev = this.#event;

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="./styles/main.css">
            <li class="event-list__item" data-id="${ev.id}" tabindex="0">
                <div class="event-list__meta">
                    <div class="event-list__title">${ev.title}</div>
                    <div class="event-list__date">${new Date(ev.dateTime).toLocaleString()}</div>
                    <div class="event-list__location">${ev.location}</div>
                    <div class="event-list__status ${ev.status === "abgeschlossen" ? "event-list__status--done" : ""}">
                        ${ev.status}
                    </div>
                </div>
                <div class="event-list__actions">
                    <button class="event-list__btn event-list__btn--edit">Bearbeiten</button>
                    <button class="event-list__btn event-list__btn--delete">Löschen</button>
                </div>
            </li>
        `;

        //damit wenn ich auf event klicke detailansicht kommt
        this.shadowRoot
            .querySelector(".event-list__item")
            .addEventListener("click", (e) => {
                // verhindern, dass Button-Klicks auch Detail öffnen
                if (e.target.tagName === "BUTTON") return;

                this.dispatchEvent(new CustomEvent("show-event-detail", {
                    detail: this.#event,
                    bubbles: true,
                    composed: true
                }));
            });

        // === Event-Buttons ===
        const editBtn = this.shadowRoot.querySelector(".event-list__btn--edit");
        const deleteBtn = this.shadowRoot.querySelector(".event-list__btn--delete");

        editBtn.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("edit-event", {
                detail: this.#event,
                bubbles: true,
                composed: true
            }));
        });

        deleteBtn.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("delete-event", {
                detail: this.#event.id,
                bubbles: true,
                composed: true
            }));
        });
    }
}

customElements.define("event-item", EventItem);
