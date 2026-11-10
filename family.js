let isFetching = true
const API_URL = "https://shoppinglistbackend.asiradnan.com/api"
let families = []

const familyList = document.getElementById('familyList')
const addButton = document.getElementById("add")

addButton.addEventListener("click", createFamily)


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
		const selectedFamilyId = JSON.parse(localStorage.getItem("family")).id
		familyList.replaceChildren()
		families.forEach((family, idx) => {
			const li = document.createElement("li")
			const div = document.createElement("div")
			div.innerHTML = family.name
			if (family.id != selectedFamilyId) {
				const button = document.createElement("button")
				button.innerHTML = "select"
				button.addEventListener("click", () => selectFamily(family.id))
				div.appendChild(button)
			}
			li.appendChild(div)
			familyList.appendChild(li)
		});
	}
}

function selectFamily(id) {
	console.log("id=",id)
	localStorage.setItem("family", JSON.stringify({ id: id }))
	displayFamilies()
}
fetchFamilies()