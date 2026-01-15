export default class Event {
    #id;
    #title;
    #dateTime;
    #location;
    #description;
    #status;
    #tags;
    #participants;
    #image;

    constructor({
                    id,
                    title,
                    dateTime,
                    location,
                    description,
                    status,
                    tags = [],
                    participants = [],
                    image = ""
                }) {
        this.#id = id;
        this.#title = title;
        this.#dateTime = dateTime;
        this.#location = location;
        this.#description = description;
        this.#status = status;
        this.#tags = tags;
        this.#participants = participants;
        this.#image = image || "";
    }

    get id() { return this.#id; }
    get title() { return this.#title; }
    get dateTime() { return this.#dateTime; }
    get location() { return this.#location; }
    get description() { return this.#description; }
    get status() { return this.#status; }
    get tags() { return this.#tags; }
    get participants() { return this.#participants; }
    get image() { return this.#image; }

    set tags(val) { this.#tags = Array.isArray(val) ? val : []; }
    set participants(val) { this.#participants = Array.isArray(val) ? val : []; }
    set image(val) { this.#image = val || ""; }

    update(data) {
        this.#title = data.title ?? this.#title;
        this.#dateTime = data.dateTime ?? this.#dateTime;
        this.#location = data.location ?? this.#location;
        this.#description = data.description ?? this.#description;
        this.#status = data.status ?? this.#status;
        if (data.image !== undefined) this.#image = data.image || "";
    }
}
