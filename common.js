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

async function setFamily() {
    if (localStorage.getItem("family")) return
    const response = await fetch(`${API_URL}/families/`, {
        credentials: "include"
    })
    const data = await response.json()
    localStorage.setItem("family", JSON.stringify({ id: data[0].id }))
}

