// js/main.js
import { controller } from "./controller.js";

// Views importieren
import "./view/event-list.js";
import "./view/event-form.js";
import "./view/tag-list.js";
import "./view/participant-list.js";
import "./view/event-detail.js";
import "./view/filter.js";
import "./view/danger-banner.js";

window.addEventListener("DOMContentLoaded", () => {
    console.log("EventBuddy gestartet");
    controller.init();
});
