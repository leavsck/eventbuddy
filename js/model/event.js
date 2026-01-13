export default class Event {
    #id;
    #title;
    #dateTime;
    #location;
    #description;
    #status;
    #tags;
    #participants;

    constructor({ id, title, dateTime, location, description, status, tags = [], participants = [] }) {
        this.#id = id;
        this.#title = title;
        this.#dateTime = dateTime;
        this.#location = location;
        this.#description = description;
        this.#status = status;
        this.#tags = tags;
        this.#participants = participants;
    }

    get id() { return this.#id; }
    get title() { return this.#title; }
    get dateTime() { return this.#dateTime; }
    get location() { return this.#location; }
    get description() { return this.#description; }
    get status() { return this.#status; }
    get tags() { return this.#tags; }
    get participants() { return this.#participants; }

    addTag(tag) { this.#tags.push(tag); }
    addParticipant(p) { this.#participants.push(p); }

    update(data) {
        this.#title = data.title;
        this.#dateTime = data.dateTime;
        this.#location = data.location;
        this.#description = data.description;
        this.#status = data.status;
    }
}
