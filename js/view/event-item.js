// js/view/event-item.js

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

        // optionales Thumbnail
        const thumb = ev.image
            ? `<img class="event-thumb" src="${ev.image}" alt="Event Bild">`
            : "";

        this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="./styles/main.css">

      <li class="event-list__item" data-id="${ev.id}" tabindex="0">
        ${thumb}

        <div class="event-list__meta">
          <div class="event-list__title">${ev.title}</div>
          <div class="event-list__date">${new Date(ev.dateTime).toLocaleString()}</div>
          <div class="event-list__location">${ev.location}</div>
          <div class="event-list__status ${ev.status === "abgeschlossen" ? "event-list__status--done" : ""}">
            ${ev.status}
          </div>
        </div>

        <div class="event-list__actions">
          <button class="btn btn-edit" type="button">Bearbeiten</button>
          <button class="btn btn-delete" type="button">Löschen</button>
        </div>
      </li>
    `;

        const li = this.shadowRoot.querySelector(".event-list__item");
        const btnEdit = this.shadowRoot.querySelector(".btn-edit");
        const btnDelete = this.shadowRoot.querySelector(".btn-delete");

        // Klick auf List-Item → Detailansicht
        li?.addEventListener("click", (e) => {
            if (e.target.closest("button")) return;

            this.dispatchEvent(
                new CustomEvent("show-event-detail", {
                    detail: ev.id,        // nur ID
                    bubbles: true,
                    composed: true,
                })
            );
        });

        // Bearbeiten
        btnEdit?.addEventListener("click", () => {
            this.dispatchEvent(
                new CustomEvent("edit-event", {
                    detail: ev.id,        // nur ID
                    bubbles: true,
                    composed: true,
                })
            );
        });

        // Löschen
        btnDelete?.addEventListener("click", () => {
            this.dispatchEvent(
                new CustomEvent("delete-event", {
                    detail: ev.id,
                    bubbles: true,
                    composed: true,
                })
            );
        });
    }
}

customElements.define("event-item", EventItem);