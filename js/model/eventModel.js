import Event from "./event.js";
import Participant from "./participant.js";
import Tag from "./tag.js";

export class EventModel extends EventTarget {
    #events;
    #participants;
    #tags;
    #currentEvent;

    constructor() {
        super();
        this.#events = [];
        this.#participants = [];
        this.#tags = [];
        this.#currentEvent = undefined;

        // JSON-Daten beim Start laden
        this.#loadFromJSON();
    }

    // === Getter & Setter ===
    get events() { return this.#events; }
    get participants() { return this.#participants; }
    get tags() { return this.#tags; }
    get currentEvent() { return this.#currentEvent; }

    set currentEvent(ev) {
        this.#currentEvent = ev;
        this.dispatchEvent(new CustomEvent("eventSelected", { detail: ev }));
    }

    // === CRUD-Methoden für Events ===
    addEvent(ev) {
        this.#events.push(ev);
        this.dispatchEvent(new CustomEvent("eventAdded", { detail: ev }));
    }

    updateEvent(updatedEvent) {
        const idx = this.#events.findIndex(e => e.id === updatedEvent.id);
        if (idx >= 0) {
            this.#events[idx] = updatedEvent;
            this.dispatchEvent(new CustomEvent("eventUpdated", { detail: updatedEvent }));
        }
    }

    deleteEvent(id) {
        this.#events = this.#events.filter(e => e.id !== id);
        this.dispatchEvent(new CustomEvent("eventDeleted", { detail: id }));
    }

    // === CRUD-Methoden für Tags ===
    addTag(tag) {
        this.#tags.push(tag);
        this.dispatchEvent(new CustomEvent("tagAdded", { detail: tag }));
    }

    removeTag(id) {
        this.#tags = this.#tags.filter(t => t.id !== id);
        this.dispatchEvent(new CustomEvent("tagRemoved", { detail: id }));
    }

    addParticipant(participant) {
        this.#participants.push(participant);
        this.dispatchEvent(new CustomEvent("participantAdded", { detail: participant }));
    }

    // === JSON-Ladevorgang ===
    #loadFromJSON() {
        Promise.all([ //promise holt in json result und erst wenn das geladen ist
            fetch("json/events.json").then(res => res.json()),
            fetch("json/participants.json").then(res => res.json()),
            fetch("json/tags.json").then(res => res.json())
        ])
            .then(([eventsData, participantsData, tagsData]) => {
                // Teilnehmer laden
                this.#participants = participantsData.map(p => new Participant(p));

                // Tags laden
                this.#tags = tagsData.map(t => new Tag(t));

                // Events laden und Referenzen auflösen
                this.#events = eventsData.map(e => {
                    // Teilnehmer-IDs in Objekte umwandeln
                    const participants = e.participants
                        .map(id => this.#participants.find(p => p.id === id))
                        .filter(p => p);

                    // Tag-Namen in Objekte umwandeln
                    const tags = e.tags
                        .map(name => this.#tags.find(t => t.name === name))
                        .filter(t => t);

                    return new Event({
                        ...e,
                        participants,
                        tags
                    });
                });
            })
            .then(() => {
                //Wichtig, damit Views (event-list, tag-list, etc.) sich aktualisieren
                this.dispatchEvent(new CustomEvent("dataLoaded"));
                console.log("Daten aus JSON geladen:", this.#events.length, "Events gefunden");
            })
            .catch(err => {
                console.error("Fehler beim Laden der JSON-Daten:", err);
            });
    }
}

// Export des Models – außerhalb der Klasse
export const eventModel = new EventModel();

//Kontrolle
console.log("EventModel geladen.");
