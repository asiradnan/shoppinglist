let params = new URLSearchParams(document.location.search);
let token = params.get("token");
async function joinFamily(token) {
    const response = await fetch(`https://shoppinglistbackend.asiradnan.com/api/families/accept-invite/`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie()
        },
        body: JSON.stringify({ "token": token }),
        credentials: "include"
    })
    const data  = await response.json()
    console.log(data)
    console.log(response)
    if (response.ok) window.location.href = "/"
    else if (response.status === 401 || data.detail?.includes("Authentication")) window.location.href = `https://accounts.asiradnan.com/login?next=${encodeURIComponent(window.location.href)}`
    else {
        document.getElementById("status").textContent = data.error
    }
}

joinFamily(token)
