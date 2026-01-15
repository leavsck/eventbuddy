// js/controller.js
import { eventModel } from "./model/eventModel.js";

export class Controller {
    constructor() {
        this.sections = {};
        this.danger = null;
        this.list = null;
        this.form = null;
        this.detail = null;
    }

    init() {
        console.log("🎮 Controller initialisiert");

        // === DOM erst JETZT holen (wichtig!) ===
        this.sections = {
            list: document.getElementById("event-list-section"),
            form: document.getElementById("event-form-section"),
            detail: document.getElementById("event-detail-section"),
            participants: document.getElementById("participant-section"),
            tags: document.getElementById("tag-section"),
        };

        this.danger = document.querySelector("danger-banner");

        this.list = document.querySelector("event-list");
        this.form = document.querySelector("event-form");
        this.detail = document.querySelector("event-detail");

        // === Startansicht ===
        this.showSection("list");
        this.setActiveButton("btn-all-events");

        // === Sidebar Buttons ===
        document.getElementById("btn-all-events")?.addEventListener("click", () => {
            this.showSection("list");
            this.setActiveButton("btn-all-events");
        });

        document.getElementById("btn-new-event")?.addEventListener("click", () => {
            if (this.form) this.form.event = null; // leeres Formular
            this.showSection("form");
            this.setActiveButton("btn-new-event");
        });

        document.getElementById("btn-new-participant")?.addEventListener("click", () => {
            this.showSection("participants");
            this.setActiveButton("btn-new-participant");
        });

        document.getElementById("btn-manage-tags")?.addEventListener("click", () => {
            this.showSection("tags");
            this.setActiveButton("btn-manage-tags");
        });

        // === Event-Liste → Detail ===
        // Unterstützt BEIDES:
        // - Übungsstyle: e.detail = ID
        // - Dein alter style: e.detail = Event-Objekt
        this.list?.addEventListener("show-event-detail", (e) => {
            const payload = e.detail;
            const id = (payload && typeof payload === "object") ? payload.id : payload;

            if (typeof eventModel.changeEvent === "function") {
                eventModel.changeEvent(id); // Übungsstyle
            } else {
                // fallback, falls du noch old-style Model hast
                eventModel.currentEvent = (payload && typeof payload === "object")
                    ? payload
                    : eventModel.events.find(x => x.id === id);
            }

            this.showSection("detail");
            this.setActiveButton("btn-all-events");
        });

        // === Event-Liste → Bearbeiten ===
        this.list?.addEventListener("edit-event", (e) => {
            const payload = e.detail;
            const id = (payload && typeof payload === "object") ? payload.id : payload;

            const ev = (typeof eventModel.getEventById === "function")
                ? eventModel.getEventById(id)         // Übungsstyle
                : (payload && typeof payload === "object"
                    ? payload
                    : eventModel.events.find(x => x.id === id));

            if (this.form) this.form.event = ev;
            this.showSection("form");
            this.setActiveButton("btn-new-event");
        });

        // === Event-Liste → Löschen ===
        this.list?.addEventListener("delete-event", (e) => {
            const idToDelete = e.detail;
            this.confirmDeleteEvent(idToDelete);
        });

        // === Formular → Speichern ===
        this.form?.addEventListener("save-event", (e) => {
            const ev = e.detail;

            const exists = (typeof eventModel.getEventById === "function")
                ? !!eventModel.getEventById(ev.id)
                : (eventModel.events || []).some(x => x.id === ev.id);

            if (exists) eventModel.updateEvent(ev);
            else eventModel.addEvent(ev);

            this.showSection("list");
            this.setActiveButton("btn-all-events");
        });

        // === Formular → Abbrechen ===
        this.form?.addEventListener("cancel-event-form", () => {
            this.showSection("list");
            this.setActiveButton("btn-all-events");
        });

        // === Detailansicht → Bearbeiten ===
        this.detail?.addEventListener("edit-current-event", (e) => {
            if (this.form) this.form.event = e.detail;
            this.showSection("form");
            this.setActiveButton("btn-new-event");
        });

        // === Detailansicht → Löschen ===
        this.detail?.addEventListener("delete-current-event", (e) => {
            const idToDelete = e.detail;
            this.confirmDeleteEvent(idToDelete);
        });
    }

    // === Zentrale Delete-Confirmation ===
    confirmDeleteEvent(idToDelete) {
        const danger = this.danger || document.querySelector("danger-banner");

        if (!danger) {
            eventModel.deleteEvent(idToDelete);
            this.showSection("list");
            this.setActiveButton("btn-all-events");
            return;
        }

        danger.setContent({
            title: "Achtung: Löschvorgang!",
            desc: "Sie sind dabei, ein Event unwiderruflich zu löschen. Dieser Vorgang kann nicht rückgängig gemacht werden.",
            confirmLabel: "Endgültig Löschen",
        });

        danger.setConfirm(() => {
            eventModel.deleteEvent(idToDelete);
            danger.hide();
            this.showSection("list");
            this.setActiveButton("btn-all-events");
        });

        danger.show();
    }

    // === Ansicht wechseln ===
    showSection(name) {
        Object.values(this.sections).forEach((section) => section?.classList.add("hidden"));
        this.sections[name]?.classList.remove("hidden");
    }

    // === Aktiven Sidebar-Button markieren ===
    setActiveButton(activeId) {
        document.querySelectorAll(".sidebar__btn").forEach(btn =>
            btn.classList.remove("sidebar__btn--active")
        );
        document.getElementById(activeId)?.classList.add("sidebar__btn--active");
    }
}

export const controller = new Controller();
