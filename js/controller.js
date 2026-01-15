// js/controller.js
import { eventModel } from "./model/eventModel.js";

export class Controller {
    constructor() {
        this.sections = {};
        this.filterSection = null;

        this.danger = null;
        this.list = null;
        this.form = null;
        this.detail = null;
    }

    init() {
        console.log("🎮 Controller initialisiert");

        // --- Sections ---
        this.filterSection = document.getElementById("filter-section");

        this.sections = {
            list: document.getElementById("event-list-section"),
            form: document.getElementById("event-form-section"),
            detail: document.getElementById("event-detail-section"),
            participants: document.getElementById("participant-section"),
            tags: document.getElementById("tag-section"),
        };

        // --- Components ---
        this.danger = document.querySelector("danger-banner");
        this.list = document.querySelector("event-list");
        this.form = document.querySelector("event-form");
        this.detail = document.querySelector("event-detail");

        // --- Start view ---
        this.go("list", "btn-all-events");

        // --- Sidebar navigation ---
        document.getElementById("btn-all-events")?.addEventListener("click", () => {
            this.go("list", "btn-all-events");
        });

        document.getElementById("btn-new-event")?.addEventListener("click", () => {
            if (this.form) this.form.event = null;
            this.go("form", "btn-new-event");
        });

        document.getElementById("btn-new-participant")?.addEventListener("click", () => {
            this.go("participants", "btn-new-participant");
        });

        document.getElementById("btn-manage-tags")?.addEventListener("click", () => {
            this.go("tags", "btn-manage-tags");
        });

        // --- List -> Detail ---
        this.list?.addEventListener("show-event-detail", (e) => {
            const id = this.getIdFromDetail(e.detail);
            if (!id) return;

            // currentEvent setzen (kompatibel zu beiden Varianten)
            if (typeof eventModel.changeEvent === "function") {
                eventModel.changeEvent(id);
            } else {
                eventModel.currentEvent = this.getEventByIdSafe(id);
            }

            this.go("detail", "btn-all-events");
        });

        // --- List -> Edit ---
        this.list?.addEventListener("edit-event", (e) => {
            const payload = e.detail;
            const id = this.getIdFromDetail(payload);
            if (!id) return;

            const ev =
                typeof payload === "object" && payload
                    ? payload
                    : this.getEventByIdSafe(id);

            if (this.form) this.form.event = ev;
            this.go("form", "btn-new-event");
        });

        // --- List -> Delete ---
        this.list?.addEventListener("delete-event", (e) => {
            const id = this.getIdFromDetail(e.detail);
            if (!id) return;
            this.confirmDeleteEvent(id);
        });

        // --- Form -> Save ---
        this.form?.addEventListener("save-event", (e) => {
            const ev = e.detail;
            if (!ev || !ev.id) return;

            const exists =
                typeof eventModel.getEventById === "function"
                    ? !!eventModel.getEventById(ev.id)
                    : (eventModel.events || []).some((x) => x.id === ev.id);

            if (exists) eventModel.updateEvent(ev);
            else eventModel.addEvent(ev);

            this.go("list", "btn-all-events");
        });

        // --- Form -> Cancel ---
        this.form?.addEventListener("cancel-event-form", () => {
            this.go("list", "btn-all-events");
        });

        // --- Detail -> Edit ---
        this.detail?.addEventListener("edit-current-event", (e) => {
            if (this.form) this.form.event = e.detail;
            this.go("form", "btn-new-event");
        });

        // --- Detail -> Delete ---
        this.detail?.addEventListener("delete-current-event", (e) => {
            const id = this.getIdFromDetail(e.detail);
            if (!id) return;
            this.confirmDeleteEvent(id);
        });
    }

    // -----------------------------
    // Navigation helpers
    // -----------------------------
    go(sectionName, activeBtnId) {
        this.showSection(sectionName);
        if (activeBtnId) this.setActiveButton(activeBtnId);
    }

    showSection(name) {
        Object.values(this.sections).forEach((section) =>
            section?.classList.add("hidden")
        );
        this.sections[name]?.classList.remove("hidden");

        // ✅ Filter nur bei Liste sichtbar
        if (this.filterSection) {
            this.filterSection.classList.toggle("hidden", name !== "list");
        }
    }

    setActiveButton(activeId) {
        document
            .querySelectorAll(".sidebar__btn")
            .forEach((btn) => btn.classList.remove("sidebar__btn--active"));
        document.getElementById(activeId)?.classList.add("sidebar__btn--active");
    }

    // -----------------------------
    // Data helpers
    // -----------------------------
    getIdFromDetail(detail) {
        if (!detail) return null;
        if (typeof detail === "string" || typeof detail === "number") return detail;
        if (typeof detail === "object" && detail.id != null) return detail.id;
        return null;
    }

    getEventByIdSafe(id) {
        if (typeof eventModel.getEventById === "function") return eventModel.getEventById(id);
        return (eventModel.events || []).find((x) => x.id === id) || null;
    }

    // -----------------------------
    // Delete confirm
    // -----------------------------
    confirmDeleteEvent(idToDelete) {
        const danger = this.danger || document.querySelector("danger-banner");

        // Fallback: ohne Banner direkt löschen
        if (!danger) {
            eventModel.deleteEvent(idToDelete);
            this.go("list", "btn-all-events");
            return;
        }

        danger.setContent({
            title: "Achtung: Löschvorgang!",
            desc:
                "Sie sind dabei, ein Event unwiderruflich zu löschen. Dieser Vorgang kann nicht rückgängig gemacht werden.",
            confirmLabel: "Endgültig Löschen",
        });

        danger.setConfirm(() => {
            eventModel.deleteEvent(idToDelete);
            danger.hide();
            this.go("list", "btn-all-events");
        });

        danger.show();
    }
}

export const controller = new Controller();
