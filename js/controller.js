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
        //wird eig so gut wie immer aufgerufen wenn benutzer interagiert
    init() {
        console.log("🎮 Controller initialisiert");

        // sections
        this.filterSection = document.getElementById("filter-section");
        //ruft er alle aus view auf
        this.sections = {
            list: document.getElementById("event-list-section"),
            form: document.getElementById("event-form-section"),
            detail: document.getElementById("event-detail-section"),
            participants: document.getElementById("participant-section"),
            tags: document.getElementById("tag-section"),
        };

        // components
        this.danger = document.querySelector("danger-banner");
        this.list = document.querySelector("event-list");
        this.form = document.querySelector("event-form");
        this.detail = document.querySelector("event-detail");

        // start views
        this.go("list", "btn-all-events");

        // sidebar navigation
        //aktiviert nur sicht bei all events
        document.getElementById("btn-all-events")?.addEventListener("click", () => {
            this.go("list", "btn-all-events");
        });
        // neues event erstellen
        document.getElementById("btn-new-event")?.addEventListener("click", () => {
            if (this.form) this.form.event = null;
            this.go("form", "btn-new-event");
        });
        // neuen teilnehmer anlegen
        document.getElementById("btn-new-participant")?.addEventListener("click", () => {
            this.go("participants", "btn-new-participant");
        });
        // tagverwaltung
        document.getElementById("btn-manage-tags")?.addEventListener("click", () => {
            this.go("tags", "btn-manage-tags");
        });

        // liste zu detailansicht
        this.list?.addEventListener("show-event-detail", (e) => {
            const id = this.getIdFromDetail(e.detail);
            if (!id) return;

            // currentEvent setzen
            if (typeof eventModel.changeEvent === "function") {
                eventModel.changeEvent(id);
            } else {
                eventModel.currentEvent = this.getEventByIdSafe(id);
            }
            //ruft in view detail auf und wird geöffnet
            this.go("detail", "btn-all-events");
        });

        // liste zu bearbeiten ansicht
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

        // liste löschen funktioniern
        this.list?.addEventListener("delete-event", (e) => {
            const id = this.getIdFromDetail(e.detail);
            if (!id) return;
            this.confirmDeleteEvent(id);
        });

        // fomrular saven
        this.form?.addEventListener("save-event", (e) => {
            const ev = e.detail;
            if (!ev || !ev.id) return;

            //true event gibt es schon, false noch nicht
            const exists =
                typeof eventModel.getEventById === "function"
                    ? !!eventModel.getEventById(ev.id)
                    : (eventModel.events || []).some((x) => x.id === ev.id);
                // wenn es schon gibt dann geupdatet sonst neues zu liste hinzufügen
            if (exists) eventModel.updateEvent(ev);
            else eventModel.addEvent(ev);

            this.go("list", "btn-all-events");
        });

        // formular speichern
        this.form?.addEventListener("cancel-event-form", () => {
            // wird in view zu webcomponent dazugefügt
            this.go("list", "btn-all-events");
        });

        // detailansicht bearbeitne
        this.detail?.addEventListener("edit-current-event", (e) => {
            if (this.form) this.form.event = e.detail;
            this.go("form", "btn-new-event");
        });

        // detail löschen
        this.detail?.addEventListener("delete-current-event", (e) => {
            const id = this.getIdFromDetail(e.detail);
            if (!id) return;
            //fehlermeldung wird aufgerufen
            this.confirmDeleteEvent(id);
        });
    }
     // wenn bei einer section der button aktiv ist wird nur die eine section ausgeblendet udn die anderen weg
    go(sectionName, activeBtnId) {
        this.showSection(sectionName);
        if (activeBtnId) this.setActiveButton(activeBtnId);
    }
      // das die anderen ausgeblendet werden
    showSection(name) {
        Object.values(this.sections).forEach((section) =>
            section?.classList.add("hidden")
        );
        this.sections[name]?.classList.remove("hidden");

        //Filter nur bei Listensicht sichtbar
        if (this.filterSection) {
            this.filterSection.classList.toggle("hidden", name !== "list");
        }
    }
   // bei klick auf button ruft active button auf
    setActiveButton(activeId) {
        document
            .querySelectorAll(".sidebar__btn")
            .forEach((btn) => btn.classList.remove("sidebar__btn--active"));
        document.getElementById(activeId)?.classList.add("sidebar__btn--active");
    }
        // ids können unterschiedlich werden so wird alles genommen um event zu dispatchen
    getIdFromDetail(detail) {
        if (!detail) return null;
        if (typeof detail === "string" || typeof detail === "number") return detail;
        if (typeof detail === "object" && detail.id != null) return detail.id;
        return null;
    }

        //holt event by id aber safe also egal wie es aussieht und wenn er es nicht findet sucht er selbst im event array
    getEventByIdSafe(id) {
        if (typeof eventModel.getEventById === "function") return eventModel.getEventById(id);
        return (eventModel.events || []).find((x) => x.id === id) || null;
    }
        // delelte meldung
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
