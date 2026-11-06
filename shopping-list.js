const shoppingList = [{ name: "Mango", completed: false, deleted: false, category: "Fruit", cost: 0 }]
let remoteList = []
let totalExpense = 0
let deletedCount = 0
let currentCategory = "All"
const API_URL = "https://shoppinglistbackend.asiradnan.com/api"
const addButton = document.getElementById("add")
addButton.addEventListener("click", addItemToList)

function getCookie(name='csrftoken') {
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

async function fetchShoppingList() {
	const response = await fetch('https://shoppinglistbackend.asiradnan.com/api/items/', {
		credentials: 'include'
	});
	if (response.status == 401 || response.status == 403) window.location.href = `https://accounts.asiradnan.com/login?next=${encodeURIComponent(window.location.href)}`
	const data = await response.json();
	console.log(data);
	remoteList = data;
	console.log(remoteList)
}

fetchShoppingList()

async function addItemToList() {
	const itemInput = document.querySelector("#itemName")
	if (itemInput.value.trim() == "") return;
	const itemCategory = document.getElementById("categories")
	//console.log(itemCategory.value)
    
	const newItem = {
		name: itemInput.value
	}

	const response = await fetch(`${API_URL}/items/`, {
		method: "POST",
		headers: {
			'Content-Type' : 'application/json',
			'X-CSRFToken': getCookie()
		},
		body: JSON.stringify(newItem),
		credentials: "include"
	})
	console.log(response)
	const data = await response.json()
	console.log(data)
	shoppingList.push(newItem)
	itemInput.value = ""
	// alert(shoppingList)
	update()
}

const shoppingListDisplay = document.getElementById("shoppingList")

function update() {
	
	shoppingListDisplay.replaceChildren()
	shoppingList.forEach((item, idx) => {
		if (item.deleted) return;
		if (currentCategory != "All" && currentCategory != item.category) return;
		const li = document.createElement("li")
		li.innerHTML = `${item.name} (${item.category})`
		if (item.completed) {
			li.classList.add("completed")
		}
		const doneButton = document.createElement("button")
		doneButton.innerHTML = (item.completed) ? "Clear" : "Done"
		doneButton.addEventListener("click", () => toggleCompletedStatus(idx))
		
		const deleteButton = document.createElement("button")
		deleteButton.innerHTML = "Delete"
		deleteButton.addEventListener("click", () => toggleDeletedStatus(idx))
		
		const cost = document.createElement("span")
		cost.innerText = item.cost
		shoppingListDisplay.appendChild(li)
		shoppingListDisplay.appendChild(doneButton)
		if (item.completed) {
			shoppingListDisplay.appendChild(cost)
		}
		else {
			shoppingListDisplay.appendChild(deleteButton)
		}
	})
	if (shoppingList.length - deletedCount === 0) {
		const h3 = document.createElement("h3")
		h3.innerHTML = 'No Items'
		shoppingListDisplay.appendChild(h3)
	if (shoppingList.length - deletedCount === 0) {
	const h3 = document.createElement("h3")
	h3.innerHTML = 'No Items'
	shoppingListDisplay.appendChild(h3)
}}
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

function toggleCompletedStatus(idx) {
	// idx = event.currentTarget.id
	console.log(idx)
	let isCompleted = shoppingList[idx].completed
	if (isCompleted) {
		shoppingList[idx].cost = 0;
	}
	
	else {
		let cost = prompt("Enter cost: ")
		if (cost == null) return
		cost = Number(cost)
		while (Number.isNaN(cost))
		{
			cost = prompt("Enter cost (only digits: ")
			if (cost == null) return
			cost = parseInt(cost)
		}
		shoppingList[idx].cost = parseInt(cost)
	}
	isCompleted = !isCompleted
	shoppingList[idx].completed = isCompleted
	update()
}

function toggleDeletedStatus(idx) {
	shoppingList[idx].deleted = !shoppingList[idx].deleted
	deletedCount += (shoppingList[idx].deleted) ? 1 : -1
	update()
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

const author = {name: "Asir Adnan", address: "Dhaka"}
localStorage.setItem("author",JSON.stringify(author))
//localStorage.setItem("time", Date())
console.log(JSON.parse(localStorage.getItem("author")).address)
update()
makeCategoryList()