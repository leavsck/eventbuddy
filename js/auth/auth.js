// js/auth/auth.js
const LS_USERS = "eventbuddy_users";
const LS_SESSION = "eventbuddy_session";

function loadUsers() {
    return JSON.parse(localStorage.getItem(LS_USERS) || "[]");
}

function saveUsers(users) {
    localStorage.setItem(LS_USERS, JSON.stringify(users));
}

export function getCurrentUser() {
    return JSON.parse(localStorage.getItem(LS_SESSION) || "null");
}

export function logout() {
    localStorage.removeItem(LS_SESSION);
}

export function register({ email, password, name }) {
    const users = loadUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some(u => u.email === normalizedEmail)) {
        return { ok: false, error: "E-Mail ist bereits registriert." };
    }

    const newUser = {
        id: Date.now(),
        email: normalizedEmail,
        password,
        name: name.trim(),
    };

    users.push(newUser);
    saveUsers(users);

    localStorage.setItem(
        LS_SESSION,
        JSON.stringify({ id: newUser.id, email: newUser.email, name: newUser.name })
    );
    return { ok: true };
}

export function login({ email, password }) {
    const users = loadUsers();
    const normalizedEmail = email.trim().toLowerCase();

    const user = users.find(u => u.email === normalizedEmail && u.password === password);
    if (!user) return { ok: false, error: "Login fehlgeschlagen. Prüfe E-Mail/Passwort." };

    localStorage.setItem(
        LS_SESSION,
        JSON.stringify({ id: user.id, email: user.email, name: user.name })
    );
    return { ok: true };
}
