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
	isFetching = false
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
	if (isFetching == false) {
		document.getElementById("fetching").style.display = "none"
	}
	if (families.length == 0) familyList.innerHTML = "No Family"
	else {
		const selectedFamilyId = JSON.parse(localStorage.getItem("family")).id
		familyList.replaceChildren()
		families.forEach((family, idx) => {
			const li = document.createElement("li")
			const div = document.createElement("div")
			const detailButton = document.createElement("button")
			detailButton.innerHTML = "Show Detail"
			const familyDetailDiv = document.createElement("div")
			detailButton.addEventListener("click", () => {
				if (familyDetailDiv.style.display == "none") {
					familyDetailDiv.style.display = "block"
					detailButton.innerHTML = "Hide Detail"
				}
				else {
					familyDetailDiv.style.display = "none"
					detailButton.innerHTML = "Show Detail"
				}
			})
			div.innerHTML = family.name
			if (family.id != selectedFamilyId) {
				const button = document.createElement("button")
				button.innerHTML = "select"
				button.addEventListener("click", () => selectFamily(family.id))
				div.appendChild(button)
			}
			div.appendChild(detailButton)
			familyDetailDiv.style.display = "none"
			const familyTitle = document.createElement("h3")
			familyTitle.innerHTML = "Members"
			const members = document.createElement("ol")
			family.members.forEach((member) => {
				const memberLi = document.createElement("li")
				memberLi.innerHTML = member.username
				members.appendChild(memberLi)
			})
			familyDetailDiv.appendChild(familyTitle)
			familyDetailDiv.appendChild(members)
			const inviteForm = document.createElement('form')
			const input = document.createElement("input")
			input.type = "email"
			input.placeholder = "member@email.com"
			input.name = "email"
			const formSubmitButton = document.createElement("button")
			formSubmitButton.type = "submit"
			formSubmitButton.innerHTML = "Invite Member"
			inviteForm.appendChild(input)
			inviteForm.appendChild(formSubmitButton)
			inviteForm.addEventListener("submit", (event) => {
				event.preventDefault()
				inviteMember(input.value, family.id)
		})
			familyDetailDiv.appendChild(inviteForm)
			li.appendChild(div)
			li.appendChild(familyDetailDiv)
			familyList.appendChild(li)
		});
	}
}

async function inviteMember(email, familyId) {
	event.preventDefault();
	const selectedFamilyId = JSON.parse(localStorage.getItem("family")).id
	const response = await fetch(`${API_URL}/families/${selectedFamilyId}/invite/`, {
		method: "POST",
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie()
		},
		body: JSON.stringify({ "email": email }),
		credentials: "include"
	})

	const data = await response.json()
	console.log(data)
}
function selectFamily(id) {
	localStorage.setItem("family", JSON.stringify({ id: id }))
	displayFamilies()
}
fetchFamilies()