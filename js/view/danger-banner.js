// js/view/danger-banner.js
class DangerBanner extends HTMLElement {
    #confirmFn = null;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles/main.css">

      <section id="danger-root">
        <div class="danger-bar">
          <div class="danger-bar__left">
            <div class="danger-bar__icon">!</div>

            <div>
              <div class="danger-bar__title" id="danger-title">Achtung: Löschvorgang!</div>
              <div class="danger-bar__desc" id="danger-desc">
                Sie sind dabei, ausgewählte Tags und/oder Events unwiderruflich zu löschen.
                Dieser Vorgang kann nicht rückgängig gemacht werden.
              </div>
            </div>
          </div>

          <div class="danger-bar__actions">
            <button class="btn btn-cancel" id="btn-cancel">Abbrechen</button>
            <button class="btn btn-danger" id="btn-confirm">Endgültig Löschen</button>
          </div>
        </div>
      </section>
    `;

        // Root muss wie früher fixed oben sein -> wir nutzen genau deine CSS-ID über :host
        // Die eigentliche Positionierung macht CSS (siehe unten in styles/_danger.scss)

        this.shadowRoot.getElementById("btn-cancel")?.addEventListener("click", () => {
            this.hide();
        });

        this.shadowRoot.getElementById("btn-confirm")?.addEventListener("click", () => {
            if (typeof this.#confirmFn === "function") this.#confirmFn();
        });
    }

    setContent({ title, desc, confirmLabel } = {}) {
        const titleEl = this.shadowRoot.getElementById("danger-title");
        const descEl = this.shadowRoot.getElementById("danger-desc");
        const btnConfirm = this.shadowRoot.getElementById("btn-confirm");

        if (titleEl && typeof title === "string") titleEl.textContent = title;
        if (descEl && typeof desc === "string") descEl.textContent = desc;
        if (btnConfirm && typeof confirmLabel === "string") btnConfirm.textContent = confirmLabel;
    }

    setConfirm(fn) {
        this.#confirmFn = fn;
    }

    show() {
        this.classList.add("is-visible");
    }

    hide() {
        this.classList.remove("is-visible");
        this.#confirmFn = null;
    }
}

customElements.define("danger-banner", DangerBanner);
