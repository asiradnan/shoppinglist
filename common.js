function getCookie(name = 'csrftoken') {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function fetchUser() {
    localStorage.removeItem("user")
    const response = await fetch(`${API_URL}/me/`, {
        credentials: 'include'
    });
    if (response.status == 401 || response.status == 403) {
        window.location.href = `https://accounts.asiradnan.com/login?next=${encodeURIComponent(window.location.href)}`
        return
    }
    const data = await response.json();
    localStorage.setItem("user", JSON.stringify(data))
    console.log(data);
}

async function setFamily() {
    if (localStorage.getItem("family")) return
    const response = await fetch(`${API_URL}/families/`, {
        credentials: "include"
    })
    const data = await response.json()
    if (Array.isArray(data) && data.length > 0)
        localStorage.setItem("family", JSON.stringify({ id: data[0].id, name: data[0].name }))
}

function showAlertDialog({ title = "Notice", message = "", buttonText = "OK", variant = "success" } = {}) {
    return new Promise((resolve) => {
        const dialog = document.createElement("dialog")
        dialog.className = "appDialog"
        dialog.setAttribute("closedby", "any")
        const icon = variant === "error" ? "⚠️" : "✓"
        dialog.innerHTML = `
            <form method="dialog" class="appDialogForm">
                <div class="appDialogIcon ${variant}">${icon}</div>
                <h3 class="appDialogTitle"></h3>
                <p class="appDialogMessage"></p>
                <div class="appDialogActions single">
                    <button type="submit" class="appDialogConfirm">${buttonText}</button>
                </div>
            </form>
        `
        dialog.querySelector(".appDialogTitle").textContent = title
        dialog.querySelector(".appDialogMessage").textContent = message

        dialog.addEventListener("close", () => {
            dialog.remove()
            resolve()
        })
        dialog.addEventListener("click", (e) => {
            if (e.target === dialog) dialog.close()
        })

        document.body.appendChild(dialog)
        dialog.showModal()
    })
}

function showCostDialog(itemName) {
    return new Promise((resolve) => {
        const dialog = document.createElement("dialog")
        dialog.className = "appDialog"
        dialog.setAttribute("closedby", "any")
        dialog.innerHTML = `
            <form class="appDialogForm" novalidate>
                <div class="appDialogIcon success">🛒</div>
                <h3 class="appDialogTitle">Mark as Done</h3>
                <p class="appDialogMessage"></p>
                <div class="appDialogInputWrapper">
                    <input type="number" class="appDialogInput" placeholder="0" min="0" step="1" inputmode="numeric" required autofocus>
                    <span class="appDialogSuffix">Taka</span>
                </div>
                <p class="appDialogError vanish">Please enter a valid number</p>
                <div class="appDialogActions">
                    <button type="button" class="appDialogCancel">Cancel</button>
                    <button type="submit" class="appDialogConfirm">Save</button>
                </div>
            </form>
        `
        dialog.querySelector(".appDialogMessage").textContent = `How much did "${itemName}" cost?`

        const form = dialog.querySelector("form")
        const input = dialog.querySelector(".appDialogInput")
        const errorMsg = dialog.querySelector(".appDialogError")
        const cancelBtn = dialog.querySelector(".appDialogCancel")
        let result = null

        input.addEventListener("input", () => {
            errorMsg.classList.add("vanish")
        })

        cancelBtn.addEventListener("click", () => {
            dialog.close()
        })

        form.addEventListener("submit", (e) => {
            e.preventDefault()
            const raw = input.value.trim()
            const num = raw === "" ? NaN : Number(raw)
            if (Number.isNaN(num) || num < 0) {
                errorMsg.classList.remove("vanish")
                input.focus()
                return
            }
            result = parseInt(num, 10)
            dialog.close()
        })

        dialog.addEventListener("click", (e) => {
            if (e.target === dialog) dialog.close()
        })

        dialog.addEventListener("close", () => {
            dialog.remove()
            resolve(result)
        })

        document.body.appendChild(dialog)
        dialog.showModal()
        input.focus()
    })
}


