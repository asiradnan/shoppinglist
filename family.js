let isFetching = true
const API_URL = "https://shoppinglistbackend.asiradnan.com/api"
let families = []

const familyList = document.getElementById("familyList")
const familyCreateForm = document.getElementById("familyCreateForm")

familyCreateForm.addEventListener("submit", (event) => {
	event.preventDefault()
	createFamily()
})


async function fetchFamilies() {
	const response = await fetch(`${API_URL}/families/`, {
		credentials: "include"
	})
	const data = await response.json()
	console.log(data)
	families = data
	isFetching = false
	if (localStorage.getItem("user") == null) {
		await fetchUser()
	}
	document.getElementById("profile").textContent = JSON.parse(localStorage.getItem("user")).username
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
	if (families.length == 1) selectFamily(data)
	displayFamilies()
}

function displayFamilies() {
	if (isFetching == false) {
		document.getElementById("fetching").style.display = "none"
	}
	if (families.length == 0) familyList.textContent = "No Family"
	else {
		const selectedFamilyId = JSON.parse(localStorage.getItem("family"))?.id ?? 0;
		const currentUser = JSON.parse(localStorage.getItem("user"))
		familyList.replaceChildren()
		families.forEach((family, idx) => {
			const li = document.createElement("li")
			const div = document.createElement("div")
			const detailButton = document.createElement("button")
			detailButton.textContent = "Show Detail"
			const familyDetailDiv = document.createElement("div")
			detailButton.addEventListener("click", () => {
				if (familyDetailDiv.style.display == "none") {
					familyDetailDiv.style.display = "block"
					detailButton.textContent = "Hide Detail"
				}
				else {
					familyDetailDiv.style.display = "none"
					detailButton.textContent = "Show Detail"
				}
			})
			const span = document.createElement("span")
			span.textContent = family.name
			div.appendChild(span)
			if (family.id != selectedFamilyId) {
				const button = document.createElement("button")
				button.textContent = "select"
				button.addEventListener("click", () => selectFamily(family))
				div.appendChild(button)
			}
			div.appendChild(detailButton)
			familyDetailDiv.style.display = "none"
			const familyTitle = document.createElement("h3")
			familyTitle.textContent = "Members"
			const members = document.createElement("ol")
			family.members.forEach((member) => {
				const memberLi = document.createElement("li")
				memberLi.textContent = member.username
				members.appendChild(memberLi)
			})
			familyDetailDiv.appendChild(familyTitle)
			familyDetailDiv.appendChild(members)
			console.log(currentUser, family.created_by)
			if (currentUser.username == family.created_by || currentUser.user_id == family.created_by) {
				const updateForm = document.createElement('form')
				const nameInput = document.createElement("input")
				nameInput.placeholder = "New family name"
				nameInput.name = "name"
				const updateFormSubmitButton = document.createElement("button")
				updateFormSubmitButton.type = "submit"
				updateFormSubmitButton.textContent = "Change Name"
				updateForm.appendChild(nameInput)
				updateForm.appendChild(updateFormSubmitButton)
				updateForm.addEventListener("submit", async (event) => {
					event.preventDefault()
					const updatedFamily = await updateFamily({ ...family, "name": nameInput.value })
					span.textContent = updatedFamily.name
					if (family.id == selectedFamilyId) selectFamily({ id: updatedFamily.id, name: updatedFamily.name })
					nameInput.value = ""
				})
				familyDetailDiv.appendChild(updateForm)

				const inviteForm = document.createElement('form')
				const input = document.createElement("input")
				input.type = "email"
				input.placeholder = "member@email.com"
				input.name = "email"
				const formSubmitButton = document.createElement("button")
				formSubmitButton.type = "submit"
				formSubmitButton.textContent = "Invite Member"
				inviteForm.appendChild(input)
				inviteForm.appendChild(formSubmitButton)
				inviteForm.addEventListener("submit", async (event) => {
					event.preventDefault()
					const response = await inviteMember(input.value, family.id)
					alert(response.ok? "Invite sent!" : "Could not sent invite")
					input.value = ""
				})
				familyDetailDiv.appendChild(inviteForm)
			}
			li.appendChild(div)
			li.appendChild(familyDetailDiv)
			familyList.appendChild(li)
		});
	}
}

async function inviteMember(email, familyId) {
	const response = await fetch(`${API_URL}/families/${familyId}/invite/`, {
		method: "POST",
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie()
		},
		body: JSON.stringify({ "email": email }),
		credentials: "include"
	})
	return response
}

function selectFamily(family) {
	localStorage.setItem("family", JSON.stringify({ id: family.id, name: family.name }))
	displayFamilies()
}

async function updateFamily(toBeUpdatedFamily) {
	console.log("update:", JSON.stringify(toBeUpdatedFamily))
	const response = await fetch(`${API_URL}/families/${toBeUpdatedFamily.id}/`, {
		method: "PUT",
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie()
		},
		credentials: "include",

		body: JSON.stringify(toBeUpdatedFamily)
	})
	const data = await response.json()
	return data
}

fetchFamilies()