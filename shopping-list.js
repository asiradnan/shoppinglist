let shoppingList = []
let deletedCount = 0
let currentCategory = "All"
let isFetching = true
const API_URL = "https://shoppinglistbackend.asiradnan.com/api"

const itemAddForm = document.getElementById("itemAddForm")
const shoppingListDisplay = document.getElementById("shoppingList")
const checkedListDisplay = document.getElementById("checkedList")
const fetching = document.getElementById("fetching")
const shoppingListHeading = document.getElementById("shoppingListHeading")
const checkedListHeading = document.getElementById("checkedListHeading")

itemAddForm.addEventListener("submit", async (event) => {
	event.preventDefault()
	const formSubmitButton = document.querySelector("#itemAddForm button")
	formSubmitButton.disabled = true
	formSubmitButton.textContent = "Adding"
	try {
		await addItemToList()
	} finally {
		formSubmitButton.disabled = false
		formSubmitButton.textContent = "+ \u00A0Add"
	}
})


function removeLoadingScreen() {
	document.getElementById("loadingDiv").style.display = "none"
	document.querySelector("main").style.display = "flex"
}

async function fetchUserAndShoppingList() {
	if (localStorage.getItem("user") == null) {
		await fetchUser()
	}
	removeLoadingScreen()
	await fetchShoppingList();
}

async function fetchShoppingList() {
	await setFamily()
	const selectedFamilyId = JSON.parse(localStorage.getItem("family"))?.id
	if (!selectedFamilyId) {
		fetching.classList.add("noSpinner")
		fetching.textContent = "Join a family or create one"
		return
	}
	isFetching = true
	const response = await fetch('https://shoppinglistbackend.asiradnan.com/api/items/', {
		credentials: 'include'
	});
	if (response.status == 401 || response.status == 403) window.location.href = `https://accounts.asiradnan.com/login?next=${encodeURIComponent(window.location.href)}`
	const data = await response.json();
	console.log(data);
	shoppingList = data.filter((item) => item.family == selectedFamilyId);
	console.log(shoppingList)
	displayList()
}


async function addItemToList() {
	const itemInput = document.querySelector("#itemName")
	if (itemInput.value.trim() == "") return;
	const selectedFamilyId = JSON.parse(localStorage.getItem("family"))?.id
	if (!selectedFamilyId) {
		alert("Please create or select a family first")
		return
	}
	const newItem = {
		name: itemInput.value,
		family: selectedFamilyId
	}

	const response = await fetch(`${API_URL}/items/`, {
		method: "POST",
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie()
		},
		body: JSON.stringify(newItem),
		credentials: "include"
	})

	const data = await response.json()
	console.log(data)
	shoppingList.push(data)
	itemInput.value = ""
	displayList()
}

async function updateItem(itemToBeUpdated) {
	const response = await fetch(`${API_URL}/items/${itemToBeUpdated.id}/`, {
		method: "PUT",
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie()
		},
		credentials: "include",
		body: JSON.stringify(itemToBeUpdated),
	})
	const data = await response.json();
	console.log(data)
	return data
}

async function deleteItem(idx, button) {
	const id = shoppingList[idx].id
	if (button) {
		button.disabled = true
		button.textContent = ""
		button.classList.add("deleting")
	}
	try {
		await fetch(`${API_URL}/items/${id}/`, {
			method: "DELETE",
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': getCookie()
			},
			credentials: "include"
		})
		shoppingList.splice(idx, 1)
		displayList()
	} catch (err) {
		if (button) {
			button.disabled = false
			button.classList.remove("deleting")
			button.textContent = "\u2715"
		}
	}
}

function displayList() {
	const selectedFamily = JSON.parse(localStorage.getItem("family"))
	const selectedFamilyId = selectedFamily.id
	document.getElementById("headerWithFamilyName").textContent = `${selectedFamily.name} Family Shopping List`
	fetching.style.display = "none"
	checkedListDisplay.replaceChildren()
	shoppingList.filter((item) => item.family == selectedFamilyId)
	if (shoppingList.length === 0) {
		shoppingListDisplay.replaceChildren()
		checkedListDisplay.replaceChildren()
		document.getElementById("hr").classList.add("vanish")
		checkedListHeading.classList.add("vanish")
		shoppingListHeading.classList.add("vanish")
		const emptyDiv = document.createElement("div")
		emptyDiv.classList.add("emptyState")
		emptyDiv.innerHTML = `
			<div class="emptyStateIcon">🧺</div>
			<h4>Your list is empty</h4>
			<p>Add an item above or <a href="family.html">switch family</a>.</p>
		`
		shoppingListDisplay.appendChild(emptyDiv)
		return
	}
	let checkedList = []
	let uncheckedList = []
	let checkedIdices = []
	let uncheckedIdices = []
	shoppingList.forEach((item, idx) => {
		if (item.completed) {
			checkedList.push(item)
			checkedIdices.push(idx)
		}
		else {
			uncheckedList.push(item)
			uncheckedIdices.push(idx)
		}
	})
	displayUncheckedList(uncheckedList, uncheckedIdices)
	document.getElementById("stillToGet").textContent = uncheckedList.length
	document.getElementById("doneCount").textContent = checkedList.length
	if (checkedList.length) {
		let totalCost = 0
		checkedList.forEach((item, idx) => {
			totalCost += item.cost
			const li = document.createElement("li")
			const div = document.createElement("div")
			div.id = "checkedListDiv"
			const img = document.createElement('img');
			img.src = './assets/check.svg';
			img.alt = 'Checkmark';

			const itemName = document.createElement("span")
			itemName.textContent = `${item.name}`
			itemName.classList.add("completed")

			const buttonsDiv = document.createElement("div")

			const cost = document.createElement("span")
			cost.id = "cost"
			cost.innerText = item.cost + " Taka"
			cost.classList.add("cost")

			const clearButton = document.createElement("button")
			clearButton.id = "clearButton"
			clearButton.textContent = "Clear"
			clearButton.addEventListener("click", () => toggleCompletedStatus(checkedIdices[idx], clearButton))

			const deleteButton = document.createElement("button")
			deleteButton.textContent = "\u2715"
			deleteButton.addEventListener("click", () => deleteItem(checkedIdices[idx], deleteButton))

			buttonsDiv.appendChild(cost)
			buttonsDiv.appendChild(clearButton)
			buttonsDiv.appendChild(deleteButton)

			div.appendChild(img)
			div.appendChild(itemName)

			div.appendChild(cost)
			div.appendChild(clearButton)
			div.appendChild(deleteButton)
			li.appendChild(div)
			checkedListDisplay.appendChild(li)
		})
		document.getElementById("totalAmount").textContent = `${totalCost} Taka`
		document.getElementById("hr").classList.remove("vanish")
		checkedListHeading.classList.remove("vanish")
	}
	else {
		document.getElementById("hr").classList.add("vanish")
		checkedListHeading.classList.add("vanish")
	}
}

function displayUncheckedList(uncheckedList, uncheckedIdices) {
	shoppingListHeading.classList.remove("vanish")
	shoppingListDisplay.replaceChildren()
	uncheckedList.forEach((item, idx) => {
		const li = document.createElement("li")
		const div = document.createElement("div")
		const itemName = document.createElement("span")
		itemName.textContent = `${item.name}`


		const doneButton = document.createElement("button")
		doneButton.textContent = "\u2713 Done"
		doneButton.addEventListener("click", () => toggleCompletedStatus(uncheckedIdices[idx], doneButton))
		doneButton.classList.add("doneButton")

		const deleteButton = document.createElement("button")
		deleteButton.textContent = "\u2715"
		deleteButton.addEventListener("click", () => deleteItem(uncheckedIdices[idx], deleteButton))

		div.appendChild(itemName)
		div.appendChild(doneButton)
		div.appendChild(deleteButton)
		li.appendChild(div)
		shoppingListDisplay.appendChild(li)
	})
}


async function toggleCompletedStatus(idx, button) {
	let itemToBeUpdated = shoppingList[idx]
	const wasCompleted = itemToBeUpdated.completed
	if (wasCompleted) {
		itemToBeUpdated.cost = 0;
	}

	else {
		let cost = prompt("Enter cost: ")
		if (cost == null) return
		cost = Number(cost.trim())
		while (Number.isNaN(cost)) {
			cost = prompt("Enter cost (only digits): ")
			if (cost == null) return
			cost = Number(cost.trim())
		}
		itemToBeUpdated.cost = parseInt(cost)
	}
	itemToBeUpdated.completed = !wasCompleted
	const originalLabel = button ? button.textContent : ""
	if (button) {
		button.disabled = true
		button.textContent = ""
		button.classList.add("clearing")
	}
	try {
		const updatedItem = await updateItem(itemToBeUpdated)
		shoppingList[idx] = updatedItem
		displayList()
	} catch (err) {
		itemToBeUpdated.completed = wasCompleted
		if (button) {
			button.disabled = false
			button.classList.remove("clearing")
			button.textContent = originalLabel
		}
	}
}


fetchUserAndShoppingList()


