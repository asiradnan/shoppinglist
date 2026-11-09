let isFetching = true
const API_URL = "https://shoppinglistbackend.asiradnan.com/api"
let families = []

const familyList = document.getElementById('familyList')
const addButton = document.getElementById("add")

addButton.addEventListener("click", createFamily)


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

async function fetchFamilies() {
    const response = await fetch(`${API_URL}/families/`, {
        credentials: "include"
    })
    const data = await response.json()
    console.log(data)
    families = data
    displayFamilies()
}

async function createFamily() {
    const familyName = document.querySelector("#familyName")
	if (familyName.value.trim() == "") return;

	const family = {
		name: familyName.value
	}

	const response = await fetch(`${API_URL}/families/`, {
		method: "POST",
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie()
		},
		body: JSON.stringify(family),
		credentials: "include"
	})

	const data = await response.json()
	console.log(data)
    familyName.value = ""
    families.push(data)
    displayFamilies()
}

function displayFamilies() {
    if (families.length == 0) familyList.innerHTML = "No Family"
    else {
        families.forEach(family => {
            const li = document.createElement("li")
            li.innerHTML = family.name
            familyList.appendChild(li)
        });
    }
}

fetchFamilies()