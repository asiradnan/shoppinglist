let isFetching = true
const API_URL = "https://shoppinglistbackend.asiradnan.com/api"
let families = []

const familyList = document.getElementById("familyList")
const familyCreateForm = document.getElementById("familyCreateForm")

familyCreateForm.addEventListener("submit", async (event) => {
	event.preventDefault()
	const formSubmitButton = document.querySelector("#familyCreateForm button")
	formSubmitButton.disabled = true
	formSubmitButton.textContent = "Creating"
	try {
		await createFamily()
	} finally {
		formSubmitButton.disabled = false
		formSubmitButton.textContent = "Create Family"
	}
})


async function fetchFamilies() {
	const response = await fetch(`${API_URL}/families/`, {
		credentials: "include"
	})
	const data = await response.json()
	console.log(data)
	families = data
	if (localStorage.getItem("user") == null) {
		await fetchUser()
	}
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
	document.getElementById("fetching").style.display = "none"
	if (families.length == 0) familyList.textContent = "No Family"
	else {
		const selectedFamilyId = JSON.parse(localStorage.getItem("family"))?.id ?? 0;
		const currentUser = JSON.parse(localStorage.getItem("user"))
		familyList.replaceChildren()
		families.forEach((family, idx) => {
			const li = document.createElement("li")
			const div = document.createElement("div")
			const container = document.createElement("div")
			div.classList.add("familyListFirstDiv")
			container.classList.add("container")
			const detailButton = document.createElement("button")
			detailButton.classList.add("detailButton")
			detailButton.innerHTML =
				`
				<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" style="vertical-align: middle; margin-right: 4px;">
					<path fill="currentColor" d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/>
				</svg>
				Show Detail
				`;
			const familyDetailDiv = document.createElement("div")
			familyDetailDiv.classList.add("familyDetail")
			detailButton.addEventListener("click", () => {
				if (familyDetailDiv.style.display == "none") {
					familyDetailDiv.style.display = "block"
					detailButton.innerHTML = `
					<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" style="vertical-align: middle; margin-right: 4px;">
						<path fill="currentColor" d="M480-528 296-344l-56-56 240-240 240 240-56 56-240-240Z"/>
					</svg>
					Hide Detail
					`;
				}
				else {
					familyDetailDiv.style.display = "none"
					detailButton.innerHTML =
						`
				<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" style="vertical-align: middle; margin-right: 4px;">
					<path fill="currentColor" d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/>
				</svg>
				Show Detail
				`;
				}
			})
			const span = document.createElement("span")
			span.textContent = family.name
			div.appendChild(span)
			const buttonsDiv = document.createElement("div")
			buttonsDiv.classList.add("buttonsDiv")
			if (family.id != selectedFamilyId) {
				const button = document.createElement("button")
				button.textContent = "Select"
				button.addEventListener("click", () => selectFamily(family))
				buttonsDiv.appendChild(button)
			}
			else {
				const button = document.createElement("button")
				button.innerHTML = `
				<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" style="vertical-align: middle; margin-right: 4px;">
					<path fill="currentColor" d="M268-240 42-466l57-56 170 170 56 56-57 56Zm226 0L268-466l56-57 170 170 368-368 56 57-424 424Zm0-226-57-56 198-198 57 56-198 198Z"/>
				</svg>
				Selected Family
				`;
				button.disabled = true
				button.addEventListener("click", () => selectFamily(family))
				buttonsDiv.appendChild(button)
				const activeChip = document.createElement("span")
				activeChip.textContent = "Active"
				activeChip.id = "activeChip"
				div.appendChild(activeChip)
			}
			buttonsDiv.appendChild(detailButton)
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
				const updateFormHeader = document.createElement("h5")
				updateFormHeader.textContent = "Rename Family"
				const updateForm = document.createElement('form')
				const nameInput = document.createElement("input")
				nameInput.placeholder = family.name
				nameInput.name = "name"
				const updateFormSubmitButton = document.createElement("button")
				updateFormSubmitButton.type = "submit"
				updateFormSubmitButton.textContent = "Update"
				updateForm.appendChild(nameInput)
				updateForm.appendChild(updateFormSubmitButton)
				updateForm.addEventListener("submit", async (event) => {
					event.preventDefault()
					if (nameInput.value.trim() == "") return
					updateFormSubmitButton.disabled = true
					updateFormSubmitButton.textContent = "Updating"
					try {
						const updatedFamily = await updateFamily({ ...family, "name": nameInput.value })
						family.name = updatedFamily.name
						span.textContent = updatedFamily.name
						nameInput.placeholder = updatedFamily.name
						if (family.id == selectedFamilyId) {
							localStorage.setItem("family", JSON.stringify({ id: updatedFamily.id, name: updatedFamily.name }))
						}
						nameInput.value = ""
					} finally {
						updateFormSubmitButton.disabled = false
						updateFormSubmitButton.textContent = "Update"
					}
				})
				familyDetailDiv.appendChild(updateFormHeader)
				familyDetailDiv.appendChild(updateForm)

				const inviteFormHeader = document.createElement("h5")
				inviteFormHeader.textContent = "Invite Family Member"
				const inviteForm = document.createElement('form')
				const input = document.createElement("input")
				input.type = "email"
				input.placeholder = "member@email.com"
				input.name = "email"
				const formSubmitButton = document.createElement("button")
				formSubmitButton.type = "submit"
				formSubmitButton.textContent = "Invite"
				inviteForm.appendChild(input)
				inviteForm.appendChild(formSubmitButton)
				inviteForm.addEventListener("submit", async (event) => {
					event.preventDefault()
					if (input.value.trim() == "") return
					formSubmitButton.disabled = true
					formSubmitButton.textContent = "Inviting"
					try {
						const response = await inviteMember(input.value, family.id)
						if (response.ok) {
							input.value = ""
							await showAlertDialog({
								title: "Invite Sent",
								message: "Your family invitation has been sent!",
								variant: "success"
							})
						}
						else {
							const data = await response.json()
							await showAlertDialog({
								title: "Couldn't Send Invite",
								message: data.error || "Something went wrong.",
								variant: "error"
							})
						}
					} finally {
						formSubmitButton.disabled = false
						formSubmitButton.textContent = "Invite"
					}
				})
				familyDetailDiv.appendChild(inviteFormHeader)
				familyDetailDiv.appendChild(inviteForm)
			}
			container.appendChild(div)
			const moreText = document.createElement("span")
			moreText.textContent = `${family.members.length} members`
			container.appendChild(moreText)
			li.appendChild(container)
			li.appendChild(buttonsDiv)
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
	window.location.href = "index.html"
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