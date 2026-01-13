export default class Participant {
    #id;
    #name;
    #email;

    constructor({ id, name, email }) {
        this.#id = id;
        this.#name = name;
        this.#email = email;
    }

    get id() { return this.#id; }
    get name() { return this.#name; }
    get email() { return this.#email; }
}
