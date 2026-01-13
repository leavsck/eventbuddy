import { eventModel } from "../model/eventModel.js";
import Tag from "../model/tag.js";

class TagList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render();

        // Wenn Daten geladen wurden oder sich Tags ändern → neu rendern
        eventModel.addEventListener("dataLoaded", () => this.render());
        eventModel.addEventListener("tagAdded", () => this.render());
        eventModel.addEventListener("tagRemoved", () => this.render());
    }

    render() {
        this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="./styles/main.css">

      <section class="form-card">
        <div class="form-card__header">
          <h2 class="form-card__title">Tags verwalten</h2>
        </div>

        <form id="tag-form" class="form-grid">
          <div class="form-field">
            <label class="form-label" for="tag-name">Neuer Tag</label>
            <input
              class="form-input"
              id="tag-name"
              name="name"
              type="text"
              required
              placeholder="z. B. Workshop"
            />
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" type="submit">Tag hinzufügen</button>
          </div>
        </form>

        <h3 class="list-title">Bestehende Tags</h3>
        <ul class="tag-items"></ul>
      </section>
    `;

        const list = this.shadowRoot.querySelector(".tag-items");
        list.innerHTML = "";

        // Tags aus dem Model rendern
        for (const tag of eventModel.tags) {
            const li = document.createElement("li");
            li.className = "tag-item";
            li.innerHTML = `
        <span class="tag-name">${tag.name}</span>
        <button class="tag-delete" type="button" title="Löschen">🗑️</button>
      `;

            li.querySelector(".tag-delete").addEventListener("click", () => {
                eventModel.removeTag(tag.id);
            });

            list.appendChild(li);
        }

        // Neuen Tag hinzufügen
        const form = this.shadowRoot.querySelector("#tag-form");
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const input = this.shadowRoot.querySelector("#tag-name");
            const name = input.value.trim();
            if (!name) return;

            const newTag = new Tag({ id: Date.now(), name });
            eventModel.addTag(newTag);

            form.reset();
        });
    }
}

customElements.define("tag-list", TagList);
