import { eventModel } from "./model/eventModel.js";

export class Controller {
    constructor() {
        this.sections = {
            list: document.getElementById("event-list-section"),
            form: document.getElementById("event-form-section"),
            detail: document.getElementById("event-detail-section"),
            participants: document.getElementById("participant-section"),
            tags: document.getElementById("tag-section"),
        };
    }

    init() {
        console.log("🎮 Controller initialisiert");

        // === Startansicht ===
        this.showSection("list");
        this.setActiveButton("btn-all-events");

        // === Sidebar Buttons ===
        document.getElementById("btn-all-events")
            .addEventListener("click", () => {
                this.showSection("list");
                this.setActiveButton("btn-all-events");
            });

        document.getElementById("btn-new-event")
            .addEventListener("click", () => {
                const form = document.querySelector("event-form");
                if (form) form.event = null; // leeres Formular erzwingen
                this.showSection("form");
                this.setActiveButton("btn-new-event");
            });

        document.getElementById("btn-new-participant")
            .addEventListener("click", () => {
                this.showSection("participants");
                this.setActiveButton("btn-new-participant");
            });

        document.getElementById("btn-manage-tags")
            .addEventListener("click", () => {
                this.showSection("tags");
                this.setActiveButton("btn-manage-tags");
            });

        // === Views holen ===
        const list = document.querySelector("event-list");
        const form = document.querySelector("event-form");
        const detail = document.querySelector("event-detail");

        // === Daten geladen ===
        eventModel.addEventListener("dataLoaded", () => {
            console.log("Daten geladen");
            list?.render?.();
        });

        // === Event-Liste → Detail ===
        list.addEventListener("show-event-detail", (e) => {
            eventModel.currentEvent = e.detail;
            this.showSection("detail");
            this.setActiveButton("btn-all-events");
        });

        // === Event-Liste → Bearbeiten ===
        list.addEventListener("edit-event", (e) => {
            form.event = e.detail;
            this.showSection("form");
            this.setActiveButton("btn-new-event");
        });

        // === Event-Liste → Löschen ===
        list.addEventListener("delete-event", (e) => {
            eventModel.deleteEvent(e.detail);
            this.showSection("list");
            this.setActiveButton("btn-all-events");
        });

        // === Formular → Speichern ===
        form.addEventListener("save-event", (e) => {
            const ev = e.detail;

            const exists = eventModel.events.some(x => x.id === ev.id);

            if (exists) {
                eventModel.updateEvent(ev);
            } else {
                eventModel.addEvent(ev);
            }

            this.showSection("list");
            this.setActiveButton("btn-all-events");
        });

        // === Detailansicht → Bearbeiten ===
        detail.addEventListener("edit-current-event", (e) => {
            form.event = e.detail;
            this.showSection("form");
            this.setActiveButton("btn-new-event");
        });

        // === Detailansicht → Löschen ===
        detail.addEventListener("delete-current-event", (e) => {
            eventModel.deleteEvent(e.detail);
            this.showSection("list");
            this.setActiveButton("btn-all-events");
        });

        //bei event löschen wieder zurück zu listenansicht 
        form.addEventListener("cancel-event-form", () => {
            this.showSection("list");
            this.setActiveButton("btn-all-events");
        });

    }

    // === Ansicht wechseln ===
    showSection(name) {
        Object.values(this.sections).forEach(section =>
            section.classList.add("hidden")
        );
        this.sections[name].classList.remove("hidden");
    }

    // === Aktiven Sidebar-Button markieren ===
    setActiveButton(activeId) {
        const buttons = document.querySelectorAll(".sidebar__btn");
        buttons.forEach(btn =>
            btn.classList.remove("sidebar__btn--active")
        );

        const activeBtn = document.getElementById(activeId);
        if (activeBtn) {
            activeBtn.classList.add("sidebar__btn--active");
        }
    }
}

export const controller = new Controller();
