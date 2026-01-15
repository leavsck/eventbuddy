import { eventModel } from "../model/eventModel.js";
import Event from "../model/event.js";

class EventDetail extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.onData = () => this.render();
    }

    connectedCallback() {
        this.render();
        eventModel.addEventListener("eventSelected", this.onData);
        eventModel.addEventListener("eventUpdated", this.onData);
        eventModel.addEventListener("participantAdded", this.onData);
    }

    disconnectedCallback() {
        eventModel.removeEventListener("eventSelected", this.onData);
        eventModel.removeEventListener("eventUpdated", this.onData);
        eventModel.removeEventListener("participantAdded", this.onData);
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

        const allParticipants = eventModel.participants || [];
        const selectedIds = new Set((ev.participants || []).map(p => String(p.id)));

        const imgHtml = ev.image
            ? `<img src="${ev.image}" alt="Event Bild" style="width:70px;height:70px;object-fit:cover;border-radius:6px;border:1px solid var(--border);">`
            : `<div class="detail-image" aria-label="Kein Bild"></div>`;

        this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles/main.css">

      <section class="detail-wrap">
        <div class="detail-card">
          <h2 class="detail-title">Event-Detailansicht: ${ev.title}</h2>

          <div class="detail-grid">
            <div class="detail-col">
              <div class="detail-row">
                <div class="detail-label">Titel</div>
                <div class="detail-value">${ev.title || "—"}</div>
              </div>

              <div class="detail-row">
                <div class="detail-label">Datum & Uhrzeit</div>
                <div class="detail-value">${ev.dateTime ? new Date(ev.dateTime).toLocaleString() : "—"}</div>
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
                ${imgHtml}
              </div>

              <div class="detail-actions">
                <button class="btn btn-edit" type="button">Event bearbeiten</button>
                <button class="btn btn-delete" type="button">Event löschen</button>
              </div>
            </div>

            <div class="detail-col">
              <div class="detail-row">
                <div class="detail-label">Teilnehmer zuordnen</div>
                <select class="form-select" id="participant-select" multiple size="6">
                  ${(allParticipants).map(p => `
                    <option value="${p.id}" ${selectedIds.has(String(p.id)) ? "selected" : ""}>
                      ${p.name} (${p.email})
                    </option>
                  `).join("")}
                </select>

                <div class="form-actions" style="margin-top:10px; justify-content:flex-start;">
                  <button class="btn btn-primary" type="button" id="save-participants">
                    Teilnehmer speichern
                  </button>
                </div>
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

        this.shadowRoot.querySelector(".btn-edit")?.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("edit-current-event", { detail: ev, bubbles: true, composed: true }));
        });

        this.shadowRoot.querySelector(".btn-delete")?.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("delete-current-event", { detail: ev.id, bubbles: true, composed: true }));
        });

        this.shadowRoot.querySelector("#save-participants")?.addEventListener("click", () => {
            const sel = this.shadowRoot.querySelector("#participant-select");
            const selected = Array.from(sel.selectedOptions).map(o => String(o.value));
            const participants = (eventModel.participants || []).filter(p => selected.includes(String(p.id)));

            const updated = new Event({
                id: ev.id,
                title: ev.title,
                dateTime: ev.dateTime,
                location: ev.location,
                description: ev.description,
                status: ev.status,
                tags: ev.tags || [],
                participants,
                image: ev.image || ""
            });

            eventModel.updateEvent(updated);
        });
    }
}

customElements.define("event-detail", EventDetail);
