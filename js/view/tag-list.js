import { eventModel } from "../model/eventModel.js";
import Tag from "../model/tag.js";

class TagList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.onSubmit = this.onSubmit.bind(this);
        this.onData = this.onData.bind(this);
    }

    connectedCallback() {
        this.render();

        eventModel.addEventListener("dataLoaded", this.onData);
        eventModel.addEventListener("tagAdded", this.onData);
        eventModel.addEventListener("tagRemoved", this.onData);
        eventModel.addEventListener("eventAdded", this.onData);
        eventModel.addEventListener("eventDeleted", this.onData);
        eventModel.addEventListener("eventUpdated", this.onData);

        this.shadowRoot.querySelector("#tag-form")?.addEventListener("submit", this.onSubmit);
    }

    disconnectedCallback() {
        eventModel.removeEventListener("dataLoaded", this.onData);
        eventModel.removeEventListener("tagAdded", this.onData);
        eventModel.removeEventListener("tagRemoved", this.onData);
        eventModel.removeEventListener("eventAdded", this.onData);
        eventModel.removeEventListener("eventDeleted", this.onData);
        eventModel.removeEventListener("eventUpdated", this.onData);

        this.shadowRoot.querySelector("#tag-form")?.removeEventListener("submit", this.onSubmit);
    }

    onData() {
        this.renderList();
    }

    render() {
        this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles/main.css">

      <section class="form-card">
        <div class="form-card__header">
          <h2 class="form-card__title">Tags verwalten</h2>
        </div>

        <form id="tag-form" class="form-grid">
          <div class="form-field">
            <label class="form-label" for="tag-name">Neuer Tag</label>
            <input class="form-input" id="tag-name" name="name" type="text" required placeholder="z. B. Workshop" />
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" type="submit">Tag hinzufügen</button>
          </div>
        </form>

        <h3 class="list-title">Bestehende Tags</h3>
        <ul class="tag-items"></ul>
      </section>
    `;

        this.renderList();
        this.shadowRoot.querySelector("#tag-form")?.addEventListener("submit", this.onSubmit);
    }

    renderList() {
        const list = this.shadowRoot.querySelector(".tag-items");
        if (!list) return;

        list.innerHTML = "";

        for (const t of (eventModel.tags || [])) {
            const li = document.createElement("li");
            li.className = "tag-item";

            const inUse = !eventModel.canDeleteTag(t.id);

            li.innerHTML = `
        <span class="tag-name">${t.name}</span>
        <button class="tag-delete" type="button" title="Löschen">
          🗑️
        </button>
      `;

            li.querySelector(".tag-delete")?.addEventListener("click", () => {
                // IMMER Feedback geben:
                if (inUse) {
                    alert(`„${t.name}“ kann nicht gelöscht werden, weil er noch einem Event zugeordnet ist.`);
                    return;
                }

                const ok = window.confirm(`Tag „${t.name}“ wirklich endgültig löschen?`);
                if (!ok) return;

                const success = eventModel.removeTag(t.id);
                if (!success) {
                    alert("Tag konnte nicht gelöscht werden (wird noch verwendet).");
                }
            });

            list.appendChild(li);
        }
    }

    onSubmit(e) {
        e.preventDefault();

        const input = this.shadowRoot.querySelector("#tag-name");
        const name = (input?.value || "").trim();
        if (!name) return;

        const success = eventModel.addTag(new Tag({ id: Date.now(), name }));

        if (!success) {
            alert(`Tag „${name}“ existiert bereits. Bitte wähle einen anderen Namen.`);
            input?.focus();
            input?.select?.();
            return;
        }

        e.target.reset();
        input?.focus();
    }

}

customElements.define("tag-list", TagList);
