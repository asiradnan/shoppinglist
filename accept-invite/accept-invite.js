let params = new URLSearchParams(document.location.search);
let token = params.get("token");
console.log(token)

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
    const data = await response.json()
    if (response.ok) window.location.href = "/"
    else {
        document.getElementById("error").innerHTML = data.error
    }
}

joinFamily(token)
