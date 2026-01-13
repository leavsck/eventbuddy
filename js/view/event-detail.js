import { eventModel } from "../model/eventModel.js";

class EventDetail extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render();

        eventModel.addEventListener("eventSelected", () => this.render());
        eventModel.addEventListener("eventUpdated", () => this.render());
    }

    render() {
        const ev = eventModel.currentEvent;

        if (!ev) {
            this.shadowRoot.innerHTML = `
       <link rel="stylesheet" href="styles/main.css">
        <div class="detail-empty">Kein Event ausgewählt.</div>
      `;
            return;
        }

        const participants = (ev.participants || []).map(p => p.name).join("<br>") || "—";
        const tags = (ev.tags || []).map(t => t.name).join(" ") || "";

        this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="./styles/main.css">

      <section class="detail-wrap">
        <div class="detail-header">
          <div class="detail-brand">EventBuddy</div>
        </div>

        <div class="detail-card">
          <h2 class="detail-title">Event-Detailansicht: ${ev.title}</h2>

          <div class="detail-grid">
            <!-- Links -->
            <div class="detail-col">
              <div class="detail-row">
                <div class="detail-label">Titel</div>
                <div class="detail-value">${ev.title || "—"}</div>
              </div>

              <div class="detail-row">
                <div class="detail-label">Datum & Uhrzeit</div>
                <div class="detail-value">${new Date(ev.dateTime).toLocaleString()}</div>
              </div>

              <div class="detail-row">
                <div class="detail-label">Ort</div>
                <div class="detail-value">${ev.location || "—"}</div>
              </div>

              <div class="detail-row">
                <div class="detail-label">Beschreibung</div>
                <div class="detail-value">${ev.description || "—"}</div>
              </div>

              <div class="detail-row">
                <div class="detail-label">Status</div>
                <div class="detail-value">${ev.status || "—"}</div>
              </div>

              <div class="detail-row">
                <div class="detail-label">Symbol/Bild</div>
                <div class="detail-image"></div>
              </div>

              <div class="detail-actions">
                <button class="btn btn-edit" type="button">Event bearbeiten</button>
                <button class="btn btn-delete" type="button">Event löschen</button>
              </div>
            </div>

            <!-- Rechts -->
            <div class="detail-col">
              <div class="detail-row">
                <div class="detail-label">Zugeordnete</div>
                <div class="detail-value">${participants}</div>
              </div>

              <div class="detail-row">
                <div class="detail-label">Tags</div>
                <div class="detail-chips">
                  ${(ev.tags || []).length
            ? (ev.tags || []).map(t => `<span class="chip">${t.name}</span>`).join("")
            : "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

        // Buttons: Events nach außen schicken (Controller kann reagieren)
        this.shadowRoot.querySelector(".btn-edit").addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("edit-current-event", {
                detail: ev,
                bubbles: true,
                composed: true
            }));
        });

        this.shadowRoot.querySelector(".btn-delete").addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("delete-current-event", {
                detail: ev.id,
                bubbles: true,
                composed: true
            }));
        });
    }
}

customElements.define("event-detail", EventDetail);
