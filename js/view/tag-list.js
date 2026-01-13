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
        <section class="tag-list">
          <h2>Tags verwalten</h2>
          <form id="tag-form" class="form">
            <label for="tag-name">Neuer Tag:</label>
            <input id="tag-name" name="name" type="text" required placeholder="z. B. Workshop"/>
            <button class="form__btn form__btn--primary" type="submit">Tag hinzufügen</button>
          </form>

          <ul class="tag-list__items"></ul>
        </section>`;

        const list = this.shadowRoot.querySelector(".tag-list__items");
        list.innerHTML = "";

        // Tags aus dem Model laden
        for (let tag of eventModel.tags) {
            const li = document.createElement("li");
            li.className = "tag-list__item";
            li.innerHTML = `
                <span class="tag-list__label">${tag.name}</span>
                <button class="tag-list__delete" title="Löschen">🗑️</button>
            `;

            li.querySelector(".tag-list__delete").addEventListener("click", () => {
                eventModel.removeTag(tag.id);
            });

            list.appendChild(li);
        }

        // Neuen Tag hinzufügen
        const form = this.shadowRoot.querySelector("#tag-form");
        form.addEventListener("submit", e => {
            e.preventDefault();
            const name = this.shadowRoot.querySelector("#tag-name").value.trim();
            if (!name) return;
            const newTag = new Tag({ id: Date.now(), name });
            eventModel.addTag(newTag);
            form.reset();
        });
    }
}

customElements.define("tag-list", TagList);
