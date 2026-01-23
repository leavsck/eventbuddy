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
        this.#events = new Map();
        this.#participants = [];
        this.#tags = [];
        this.#currentEvent = undefined;

        this.#loadFromJSON();
    }

    get events() {
        return Array.from(this.#events.values());
    }
    get participants() {
        return [...this.#participants];
    }
    get tags() {
        return [...this.#tags];
    }
    get currentEvent() {
        return this.#currentEvent;
    }

    // getById
    getEventById(id) {
        return this.#events.get(Number(id));
    }

    // currentEvent setzen + Event dispatchen (event aktiv auslösen)
    changeEvent(newEventId) {
        const ev = this.getEventById(newEventId);
        this.#currentEvent = ev;
        this.dispatchEvent(new CustomEvent("eventSelected", { detail: ev }));
        return ev;
    }
        // hinzufügen
    addEvent(ev) {
        this.#events.set(Number(ev.id), ev);
        // model sagt es hat sich ein event geändert
        this.dispatchEvent(new CustomEvent("eventsChanged"));
    }
        //updaten
    updateEvent(updatedEvent) {
        const id = Number(updatedEvent.id);
        //qird nochmal überprüft ob es das eh gibt in map wegen #
        if (!this.#events.has(id)) return;

        this.#events.set(id, updatedEvent);

        // wenn gerade ausgewählt -> updaten + eventSelected erneut machen
        if (this.#currentEvent?.id === updatedEvent.id) {
            this.#currentEvent = updatedEvent;
            this.dispatchEvent(
                new CustomEvent("eventSelected", { detail: updatedEvent })
            );
        }

        this.dispatchEvent(new CustomEvent("eventUpdated", { detail: updatedEvent }));
        this.dispatchEvent(new CustomEvent("eventsChanged"));
    }
        //löschen eines events
    deleteEvent(id) {
        const numId = Number(id);
        this.#events.delete(numId);

        if (this.#currentEvent?.id === numId) {
            this.#currentEvent = undefined;
            this.dispatchEvent(
                new CustomEvent("eventSelected", { detail: undefined })
            );
        }

        this.dispatchEvent(new CustomEvent("eventDeleted", { detail: numId }));
        this.dispatchEvent(new CustomEvent("eventsChanged"));
    }

    // tags
    addTag(tag) {
        const newName = (tag?.name || "").trim();
        const normNew = newName.toLowerCase();
        if (!newName) return false;

        const exists = this.#tags.some(
            (t) => (t?.name || "").trim().toLowerCase() === normNew
        );

        if (exists) {
            this.dispatchEvent(new CustomEvent("tagDuplicate", { detail: newName }));
            return false;
        }
        // tag in tagliste hinzufügen
        this.#tags.push(tag);
        this.dispatchEvent(new CustomEvent("tagAdded", { detail: tag }));
        return true;
    }
        // ob es üpberhaupt möglich ist einen tag zu löschen
    canDeleteTag(tagId) {
        const idStr = String(tagId);

        return !this.events.some((ev) => {
            const tags = ev.tags || [];
            return tags.some((t) => {
                if (t && typeof t === "object" && "id" in t) return String(t.id) === idStr;

                // fallback, falls irgendwo doch strings liegen
                if (typeof t === "string") {
                    const tagObj = this.#tags.find((x) => x.name === t);
                    return tagObj ? String(tagObj.id) === idStr : false;
                }

                return false;
            });
        });
    }

    removeTag(tagId) {
        if (!this.canDeleteTag(tagId)) {
            this.dispatchEvent(new CustomEvent("tagDeleteBlocked", { detail: tagId }));
            return false;
        }

        const idStr = String(tagId);
        this.#tags = this.#tags.filter((t) => String(t.id) !== idStr);

        // Referenzen aus Events entfernen
        for (const ev of this.events) {
            const tags = ev.tags || [];
            ev.tags = tags.filter((t) => {
                if (t && typeof t === "object" && "id" in t) return String(t.id) !== idStr;
                if (typeof t === "string") return false;
                return true;
            });
            this.#events.set(Number(ev.id), ev);
        }

        this.dispatchEvent(new CustomEvent("tagRemoved", { detail: tagId }));
        this.dispatchEvent(new CustomEvent("eventsChanged"));
        return true;
    }

    // participants
    addParticipant(participant) {
        this.#participants.push(participant);
        this.dispatchEvent(new CustomEvent("participantAdded", { detail: participant }));
    }

    // Lädt die initialen Daten (Events, Teilnehmer, Tags) aus JSON-Dateien
// und baut daraus die internen Model-Strukturen auf
    async #loadFromJSON() {
        try {
            // Promise.all lädt alle drei JSON-Dateien parallel (gleichzeitig)
            // fetch() holt die Datei, r.json() wandelt sie in JS-Objekte um
            const [eventsData, participantsData, tagsData] = await Promise.all([
                fetch("json/events.json").then((r) => r.json()),
                fetch("json/participants.json").then((r) => r.json()),
                fetch("json/tags.json").then((r) => r.json()),
            ]);

            // Teilnehmer aus den Rohdaten erzeugen und als Participant-Objekte speichern
            this.#participants = participantsData.map((p) => new Participant(p));

            // Tags aus den Rohdaten erzeugen und als Tag-Objekte speichern
            this.#tags = tagsData.map((t) => new Tag(t));

            // Events aus der JSON-Datei durchgehen
            for (const e of eventsData) {

                // Teilnehmer-IDs aus dem Event werden auf echte Participant-Objekte gemappt
                // Falls eine ID nicht gefunden wird, wird sie herausgefiltert
                const participants = (e.participants || [])
                    .map((id) => this.#participants.find((p) => p.id === id))
                    .filter(Boolean);

                // Tag-Namen aus dem Event werden auf echte Tag-Objekte gemappt
                // Auch hier werden ungültige Referenzen entfernt
                const tags = (e.tags || [])
                    .map((name) => this.#tags.find((t) => t.name === name))
                    .filter(Boolean);

                // Neues Event-Objekt erstellen
                // Spread-Operator kopiert alle Felder aus dem JSON-Event
                // participants und tags werden durch die gemappten Objekte ersetzt
                const ev = new Event({
                    ...e, // kopiert alle ursprünglichen Event-Eigenschaften
                    participants, // echte Participant-Objekte statt IDs
                    tags, // echte Tag-Objekte statt Namen
                    image: e.image || "", // Fallback, falls kein Bild vorhanden ist
                });

                // Event wird in der Map gespeichert (ID als Number für Konsistenz)
                this.#events.set(Number(ev.id), ev);
            }

            // Signalisiert: Alle Daten wurden erfolgreich geladen
            this.dispatchEvent(new CustomEvent("dataLoaded"));

            // Signalisiert: Event-Daten haben sich geändert → Views können neu rendern
            this.dispatchEvent(new CustomEvent("eventsChanged"));

        } catch (err) {
            // Fehlerbehandlung, falls das Laden oder Parsen der JSON-Dateien fehlschlägt
            console.error("Fehler beim Laden der JSON-Daten:", err);
        }
    }

}

export const eventModel = new EventModel();
