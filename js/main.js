import { controller } from "./controller.js";

// Views importieren
import "./view/event-list.js";
import "./view/event-form.js";
import "./view/tag-list.js";
import "./view/participant-list.js";
import "./view/event-detail.js";
import "./view/filter.js";
import "./view/danger.js";

// Auth
import { getCurrentUser, login, register, logout } from "./auth/auth.js";

function show(el) { if (el) el.style.display = ""; }
function hide(el) { if (el) el.style.display = "none"; }

function showApp() {
    const authSection = document.getElementById("auth-section");
    const appSection = document.getElementById("app-section");
    hide(authSection);
    show(appSection);
    controller.init();
}

function showAuth() {
    const authSection = document.getElementById("auth-section");
    const appSection = document.getElementById("app-section");
    show(authSection);
    hide(appSection);
}

window.addEventListener("DOMContentLoaded", () => {
    try {
        const user = getCurrentUser();

        if (user) showApp();
        else showAuth();

        const errEl = document.getElementById("auth-error");

        document.getElementById("login-form")?.addEventListener("submit", (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const res = login({
                email: fd.get("email"),
                password: fd.get("password"),
            });

            if (!res.ok) {
                if (errEl) errEl.textContent = res.error;
                return;
            }
            if (errEl) errEl.textContent = "";
            showApp();
        });

        document.getElementById("register-form")?.addEventListener("submit", (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const res = register({
                name: fd.get("name"),
                email: fd.get("email"),
                password: fd.get("password"),
            });

            if (!res.ok) {
                if (errEl) errEl.textContent = res.error;
                return;
            }
            if (errEl) errEl.textContent = "";
            showApp();
        });

        document.getElementById("btn-logout")?.addEventListener("click", () => {
            logout();
            // optional: reload, damit alles sauber reset ist
            location.reload();
        });

    } catch (err) {
        console.error("Main init crashed:", err);

        // ABSOLUTER NOTFALL: app anzeigen, damit du nie wieder black screen hast
        const authSection = document.getElementById("auth-section");
        const appSection = document.getElementById("app-section");
        hide(authSection);
        show(appSection);

        controller.init();
    }
});
