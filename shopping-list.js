const shoppingList = [{ name: "Mango", completed: false, deleted: false, category: "Fruit", cost: 0 }]
let remoteList = []
let totalExpense = 0
let deletedCount = 0
let currentCategory = "All"
let isFetching = true
const API_URL = "https://shoppinglistbackend.asiradnan.com/api"

const addButton = document.getElementById("add")
const shoppingListDisplay = document.getElementById("shoppingList")
const fetching = document.getElementById("fetching")

addButton.addEventListener("click", addItemToList)

async function fetchShoppingList() {
	await setFamily()
	const selectedFamilyId = JSON.parse(localStorage.getItem("family")).id
	isFetching = true
	const response = await fetch('https://shoppinglistbackend.asiradnan.com/api/items/', {
		credentials: 'include'
	});
	if (response.status == 401 || response.status == 403) window.location.href = `https://accounts.asiradnan.com/login?next=${encodeURIComponent(window.location.href)}`
	const data = await response.json();
	console.log(data);
	remoteList = data.filter((item) => item.family == selectedFamilyId);
	console.log(remoteList)
	displayList()
}


async function addItemToList() {
	const itemInput = document.querySelector("#itemName")
	if (itemInput.value.trim() == "") return;

	const newItem = {
		name: itemInput.value,
		family: JSON.parse(localStorage.getItem("family")).id
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
	remoteList.push(data)
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

async function deleteItem(idx) {
	const id = remoteList[idx].id
	const response = await fetch(`${API_URL}/items/${id}/`, {
		method: "DELETE",
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie()
		},
		credentials: "include"
	})
	remoteList.splice(idx, 1)
	displayList()
	// shoppingList[idx].deleted = !shoppingList[idx].deleted
	// deletedCount += (shoppingList[idx].deleted) ? 1 : -1
}

function displayList() {
	const selectedFamilyId = JSON.parse(localStorage.getItem("family")).id
	fetching.style.display = "none"
	shoppingListDisplay.replaceChildren()
	remoteList.filter((item) => item.family == selectedFamilyId)
	if (remoteList.length === 0) {
		const h5 = document.createElement("h5")
		h5.innerHTML = 'No Items for this family. Try switching family or create new item.'
		shoppingListDisplay.appendChild(h5)
		console.log("here")
	}
	remoteList.sort((a, b) => {
		if (a.completed && !b.completed) return 1;
		if (b.completed && !a.completed) return -1;
		return 0
	})
	console.log(remoteList)
	
	remoteList.forEach((item, idx) => {
		const li = document.createElement("li")
		const div = document.createElement("div")
		const itemName = document.createElement("span")
		itemName.innerHTML = `${item.name}`
		if (item.completed) {
			itemName.classList.add("completed")
		}

		const doneButton = document.createElement("button")
		doneButton.innerHTML = (item.completed) ? "Clear" : "Done"
		doneButton.addEventListener("click", () => toggleCompletedStatus(idx))



		const deleteButton = document.createElement("button")
		deleteButton.innerHTML = "Delete"
		deleteButton.addEventListener("click", () => deleteItem(idx))

		div.appendChild(itemName)
		if (item.completed) {
			const cost = document.createElement("span")
			cost.innerText = item.cost + " Taka"
			cost.classList.add("cost")
			div.appendChild(cost)
		}
		div.appendChild(doneButton)
		li.appendChild(div)
		shoppingListDisplay.appendChild(li)
	})
}


async function toggleCompletedStatus(idx) {
	let itemToBeUpdated = remoteList[idx]
	if (itemToBeUpdated.completed) {
		itemToBeUpdated.cost = 0;
	}

	else {
		let cost = prompt("Enter cost: ")
		if (cost == null) return
		cost = Number(cost)
		while (Number.isNaN(cost)) {
			cost = prompt("Enter cost (only digits: ")
			if (cost == null) return
			cost = parseInt(cost)
		}
		itemToBeUpdated.cost = parseInt(cost)
	}
	itemToBeUpdated.completed = !itemToBeUpdated.completed
	console.log(remoteList)
	const updatedItem = await updateItem(itemToBeUpdated)
	remoteList[idx] = updatedItem
	console.log(remoteList)
	displayList()
}



fetchShoppingList()

function update() {

	// shoppingListDisplay.replaceChildren()
	// shoppingList.forEach((item, idx) => {
	// 	if (item.deleted) return;
	// 	if (currentCategory != "All" && currentCategory != item.category) return;
	// 	const li = document.createElement("li")
	// 	li.innerHTML = `${item.name} (${item.category})`
	// 	if (item.completed) {
	// 		li.classList.add("completed")
	// 	}
	// 	const doneButton = document.createElement("button")
	// 	doneButton.innerHTML = (item.completed) ? "Clear" : "Done"
	// 	doneButton.addEventListener("click", () => toggleCompletedStatus(idx))

	// 	const deleteButton = document.createElement("button")
	// 	deleteButton.innerHTML = "Delete"
	// 	deleteButton.addEventListener("click", () => toggleDeletedStatus(idx))

	// 	const cost = document.createElement("span")
	// 	cost.innerText = item.cost
	// 	shoppingListDisplay.appendChild(li)
	// 	shoppingListDisplay.appendChild(doneButton)
	// 	if (item.completed) {
	// 		shoppingListDisplay.appendChild(cost)
	// 	}
	// 	else {
	// 		shoppingListDisplay.appendChild(deleteButton)
	// 	}
	// })
	// if (shoppingList.length - deletedCount === 0) {

	// }
	calculateExpense()
}


function calculateExpense() {
	const total = shoppingList.reduce((curr, item) => item.cost + curr, 0)
	totalExpense = total
	const expenseSection = document.getElementById("expenseSection")
	if (totalExpense) {
		const expense = document.getElementById("expense")
		console.log(totalExpense)
		expense.innerHTML = "Total Expense: " + totalExpense
		expenseSection.classList.remove("vanish")
	}
	else {
		expenseSection.classList.add("vanish")
	}
}




const categories = ["Fruit", "Vegetable", "Grocery", "Meats"]

const filterCategories = document.getElementById("filterCategory")

filterCategories.addEventListener("change", (event) => changeFilterCategory(event))

function changeFilterCategory(event) {
	currentCategory = event.currentTarget.value
	update()
}

function makeCategoryList() {
	const categoriesDropdown = document.getElementById("categories")
	const filterCategories = document.getElementById("filterCategory")

	const option = document.createElement("option")
	option.value = "All"
	option.innerHTML = "All"
	filterCategories.appendChild(option)
	categories.forEach((category) => {
		const option = document.createElement("option")
		option.value = category
		option.innerHTML = category
		categoriesDropdown.appendChild(option)
		filterCategories.appendChild(option.cloneNode(true))
	})
}



const author = { name: "Asir Adnan", address: "Dhaka" }
localStorage.setItem("author", JSON.stringify(author))
//localStorage.setItem("time", Date())
console.log(JSON.parse(localStorage.getItem("author")).address)
// update()
// makeCategoryList()

