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
    const profileEl = document.getElementById("profile");
    if (profileEl) {
        profileEl.textContent = data.username;
    }
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

