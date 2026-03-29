async function protectAdminPage() {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
        window.location.href = "login.html";
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
            window.location.href = "admin.html";
            return;
        }
        initLogin();
    } else {
        await protectAdminPage();
        await loadAdminData();
        setupLogout();
    }
});

function initLogin() {
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const errorAlert = document.getElementById("errorAlert");
    const errorMessage = document.getElementById("errorMessage");
    const togglePassword = document.getElementById("togglePassword");

    if (togglePassword) {
        togglePassword.addEventListener("click", () => {
            password.type = password.type === "password" ? "text" : "password";
        });
    }

    document.getElementById("loginForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        hideError();
        try {
            const formData = new FormData();
            formData.append("action", "login");
            formData.append("email", email.value);
            formData.append("password", password.value);

            const response = await fetch("admin/auth.php", {
                method: "POST",
                body: formData
            });
            const result = await response.json();

            if (result.status === "success") {
                window.location.href = "admin.html";
            } else {
                showError(result.message || "Invalid email or password");
            }
        } catch (error) {
            showError("Could not connect to authentication server");
        }
    });

    function showError(msg) {
        errorMessage.textContent = msg;
        errorAlert.style.display = "flex";
    }

    function hideError() {
        errorAlert.style.display = "none";
    }
}

async function isLoggedIn() {
    try {
        const formData = new FormData();
        formData.append("action", "check");

        const response = await fetch("admin/auth.php", {
            method: "POST",
            body: formData
        });
        const result = await response.json();
        return result.status === "success" && result.loggedIn === true;
    } catch (error) {
        return false;
    }
}

async function loadAdminData() {
    let user = null;
    try {
        const formData = new FormData();
        formData.append("action", "check");
        const response = await fetch("admin/auth.php", {
            method: "POST",
            body: formData
        });
        const result = await response.json();
        user = result.user || null;
    } catch (error) {
        user = null;
    }

    if (!user) return;

    const nameEl = document.getElementById("admin-name");
    const emailEl = document.getElementById("admin-email");

    if (nameEl) nameEl.textContent = user.name;
    if (emailEl) emailEl.textContent = user.email;
}

function setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                const formData = new FormData();
                formData.append("action", "logout");
                await fetch("admin/auth.php", {
                    method: "POST",
                    body: formData
                });
            } catch (error) {
                // Redirect even if server logout request fails.
            }
            window.location.href = "login.html";
        });
    }
}
