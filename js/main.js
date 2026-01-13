// js/main.js
import { controller } from "./controller.js";
import { eventModel } from "./model/eventModel.js";

// Views importieren
import "./view/event-list.js";
import "./view/event-item.js";
import "./view/event-form.js";
import "./view/tag-list.js";
import "./view/participant-list.js";
import "./view/event-detail.js";


//Überprüfung ob es eh geladen wird
window.addEventListener("DOMContentLoaded", () => {
    console.log("EventBuddy gestartet");
    controller.init();
});
