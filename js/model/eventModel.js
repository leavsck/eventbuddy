import Event from "./event.js";
import Participant from "./participant.js";
import Tag from "./tag.js";

export class EventModel extends EventTarget {
    #events = [];
    #participants = [];
    #tags = [];
    #currentEvent = undefined;

    constructor() {
        super();
        this.#loadFromJSON();
    }

    get events() { return this.#events; }
    get participants() { return this.#participants; }
    get tags() { return this.#tags; }
    get currentEvent() { return this.#currentEvent; }

    set currentEvent(ev) {
        this.#currentEvent = ev;
        this.dispatchEvent(new CustomEvent("eventSelected", { detail: ev }));
    }

    addEvent(ev) {
        this.#events.push(ev);
        this.dispatchEvent(new CustomEvent("eventAdded", { detail: ev }));
    }

    updateEvent(updatedEvent) {
        const idx = this.#events.findIndex(e => e.id === updatedEvent.id);
        if (idx >= 0) {
            this.#events[idx] = updatedEvent;
            if (this.#currentEvent?.id === updatedEvent.id) this.#currentEvent = updatedEvent;
            this.dispatchEvent(new CustomEvent("eventUpdated", { detail: updatedEvent }));
        }
    }

    deleteEvent(id) {
        this.#events = this.#events.filter(e => e.id !== id);
        if (this.#currentEvent?.id === id) this.currentEvent = undefined;
        this.dispatchEvent(new CustomEvent("eventDeleted", { detail: id }));
    }

    addTag(tag) {
        this.#tags.push(tag);
        this.dispatchEvent(new CustomEvent("tagAdded", { detail: tag }));
    }

    /** Tag darf nur gelöscht werden, wenn KEIN Event ihn nutzt */
    canDeleteTag(tagId) {
        const idStr = String(tagId);

        return !this.#events.some(ev => {
            const tags = ev.tags || [];

            // tags können Tag-Objekte ODER Strings sein → beides abfangen
            return tags.some(t => {
                if (t && typeof t === "object" && "id" in t) return String(t.id) === idStr;
                if (typeof t === "string") {
                    const tagObj = this.#tags.find(x => x.name === t);
                    return tagObj ? String(tagObj.id) === idStr : false;
                }
                return false;
            });
        });
    }

    /** returns boolean (true = gelöscht, false = blockiert) */
    removeTag(tagId) {
        if (!this.canDeleteTag(tagId)) {
            this.dispatchEvent(new CustomEvent("tagDeleteBlocked", { detail: tagId }));
            return false;
        }

        const idStr = String(tagId);

        // aus tag-liste entfernen
        this.#tags = this.#tags.filter(t => String(t.id) !== idStr);

        // referenzen aus events entfernen (safety)
        this.#events = this.#events.map(ev => {
            const tags = ev.tags || [];
            ev.tags = tags.filter(t => {
                if (t && typeof t === "object" && "id" in t) return String(t.id) !== idStr;
                if (typeof t === "string") {
                    const tagObj = this.#tags.find(x => x.name === t);
                    // wenn tagObj nicht mehr existiert, bleibt string evtl. übrig – entfernen wir
                    return tagObj ? String(tagObj.id) !== idStr : false;
                }
                return true;
            });
            return ev;
        });

        this.dispatchEvent(new CustomEvent("tagRemoved", { detail: tagId }));
        return true;
    }

    addParticipant(participant) {
        this.#participants.push(participant);
        this.dispatchEvent(new CustomEvent("participantAdded", { detail: participant }));
    }

    async #loadFromJSON() {
        try {
            const [eventsData, participantsData, tagsData] = await Promise.all([
                fetch("json/events.json").then(r => r.json()),
                fetch("json/participants.json").then(r => r.json()),
                fetch("json/tags.json").then(r => r.json())
            ]);

            this.#participants = participantsData.map(p => new Participant(p));
            this.#tags = tagsData.map(t => new Tag(t));

            this.#events = eventsData.map(e => {
                const participants = (e.participants || [])
                    .map(id => this.#participants.find(p => p.id === id))
                    .filter(Boolean);

                const tags = (e.tags || [])
                    .map(name => this.#tags.find(t => t.name === name))
                    .filter(Boolean);

                return new Event({
                    ...e,
                    participants,
                    tags,
                    image: e.image || ""
                });
            });

            this.dispatchEvent(new CustomEvent("dataLoaded"));
        } catch (err) {
            console.error("Fehler beim Laden der JSON-Daten:", err);
        }
    }
}

export const eventModel = new EventModel();
