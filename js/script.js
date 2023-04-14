// -- Token -- //

const token = getToken();
function getToken() {
	return sessionStorage.getItem('jwtToken');
}
if (!token) {
	const message = 'You are not Logged in!';
	const encodedMessage = encodeURIComponent(message);
	window.location.href = `/login.html?message=${encodedMessage}`;
}

function logout() {
	sessionStorage.removeItem('jwtToken');
	const message = 'You have been logged out!';
	const encodedMessage = encodeURIComponent(message);
	window.location.href = `/login.html?message=${encodedMessage}`;
}

// -- OnLoad -- //

window.onload = function () {
	alertify.set('notifier', 'position', 'top-left');
	checkParam('do');
};

// -- Single Card view -- //

function openTask(taskId) {
	window.location.href = `/index.html?task=${taskId}`;
}

function checkParam(type) {
	const urlParams = new URLSearchParams(window.location.search);
	const taskId = urlParams.get('task');
	if (type === 'check') {
		if (taskId) {
			return true;
		} else {
			return false;
		}
	} else if (type === 'do') {
		if (taskId) {
			renderSingleTask(taskId);
		} else {
			renderTasks();
		}
	}
}

async function getSingleTask(taskId) {
	if (!token) {
		throw new Error('Token not found!');
	}

	const response = await fetch(`http://localhost:3000/auth/jwt/task/${taskId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	const task = await response.json();
	if (response.status === 404) {
		return null;
	} else {
		return task;
	}
}

function createSingleCard(task) {
	const card = document.createElement('div');
	card.classList.add('card');
	card.innerHTML = `
      <h2>${task.title}</h2>
      <p class="taskID">ID: ${task.id}</p>
      <p>Completed: ${task.completed}</p>
	  <i class="trash fa-solid fa-trash fa-lg" onclick="deleteTask(${task.id})"</i>
    `;
	return card;
}

async function renderSingleTask(taskId) {
	const task = await getSingleTask(taskId);
	if (task === null) {
		const cardsDiv = document.getElementById('task-container');
		const noTaskDiv = document.createElement('div');
		noTaskDiv.innerHTML = `Task with ID ${taskId} not Found!`;
		noTaskDiv.style.cssText = 'text-align: center; font-size: 30px;';
		cardsDiv.appendChild(noTaskDiv);
	} else {
		const cardsDiv = document.getElementById('task-container');
		cardsDiv.innerHTML = '';

		const card = createSingleCard(task);
		cardsDiv.appendChild(card);

		openEditMenu(task.id);
		document.getElementById('popup-menu').style.cssText += 'top: 70vh; width: 708px; height: 300px;';
		document.getElementsByClassName('close-button')[0].remove();
	}
}

// -- GET -- //

async function getTasks() {
	if (!token) {
		throw new Error('Token not found!');
	}

	const response = await fetch('http://localhost:3000/auth/jwt/tasks', {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	const tasks = await response.json();
	return tasks;
}

function createCard(task) {
	const card = document.createElement('div');
	card.classList.add('card');
	card.onclick = function () {
		openTask(task.id);
	};
	card.innerHTML = `
		<h2>${task.title}</h2>
		<p class="taskID">ID: ${task.id}</p>
		<p>Completed: ${task.completed}</p>
		<i class="pen fa-solid fa-pen-to-square fa-lg" onclick="event.stopPropagation(); openEditMenu(${task.id})"></i>
		<i class="trash fa-solid fa-trash fa-lg" onclick="event.stopPropagation(); deleteTask(${task.id})"</i>
	  `;
	return card;
}

async function renderTasks() {
	const tasks = await getTasks();
	const cardsDiv = document.getElementById('task-container');
	cardsDiv.innerHTML = '';

	if (tasks.length === 0) {
		const noTasksDiv = document.createElement('div');
		noTasksDiv.innerHTML = 'No Tasks...';
		noTasksDiv.style.cssText = 'text-align: center; font-size: 30px;';
		cardsDiv.appendChild(noTasksDiv);
		return;
	}

	tasks.forEach((task) => {
		const card = createCard(task);
		cardsDiv.appendChild(card);
	});
}

// -- POST -- //

function addTask() {
	if (!token) {
		console.error('Token not found!');
		return;
	}

	const taskName = document.getElementById('task_name').value;
	if (taskName) {
		const taskElements = document.querySelectorAll('.card h2');
		for (let i = 0; i < taskElements.length; i++) {
			if (taskElements[i].textContent === taskName) {
				alertify.error('That Task already exists');
				return;
			}
		}

		const body = {
			completed: false,
			title: taskName,
		};

		fetch('http://localhost:3000/auth/jwt/tasks', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(body),
		})
			.then((response) => response.json())
			.then(() => {
				alertify.success('Task added');
				document.getElementById('task_name').value = '';

				if (checkParam('check')) {
					window.location.href = '/index.html';
				} else {
					renderTasks();
				}
			})
			.catch((error) => {
				alertify.error('Error adding Task');
				console.log(error);
			});
	} else {
		alertify.error('Cannot add a Task with no title');
	}
}

// -- DELETE -- //

function deleteTask(taskId) {
	if (!token) {
		console.error('Token not found!');
		return;
	}

	fetch(`http://localhost:3000/auth/jwt/task/${taskId}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})
		.then((response) => {
			if (response.status === 200) {
				alertify.success('Successfully deleted Task ' + taskId);
				if (checkParam('check')) {
					window.location.href = '/index.html';
				} else {
					renderTasks();
				}
			} else {
				alertify.error('Error with deleting Task ' + taskId);
			}
		})
		.catch((error) => {
			alertify.error('Error with deleting Task ' + taskId);
			console.log(error);
		});
}

// -- EDIT -- //

let editTaskId;

function openEditMenu(taskId) {
	editTaskId = taskId;

	const popupMenu = document.getElementById('popup-menu');
	popupMenu.style.display = 'block';
}

function closeEditMenu() {
	const popupMenu = document.getElementById('popup-menu');
	popupMenu.style.display = 'none';
}

function editTask() {
	const form = document.querySelector('#popup-menu form');
	const taskId = editTaskId;
	const formData = new FormData(form);
	const token = getToken();

	const title = formData.get('title').trim();

	if (title === '') {
		alertify.error('Title cannot be empty!');
		return;
	}

	if (/^\s*$/.test(title)) {
		alertify.error('Title cannot be empty!');
		return;
	}

	fetch(`http://localhost:3000/auth/jwt/tasks`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			id: taskId,
			completed: formData.get('completion') === 'true',
			title: title,
		}),
	})
		.then((response) => {
			if (response.status === 200) {
				alertify.success('Successfully updated Task ' + taskId);
				closeEditMenu();
				document.getElementById('Tasktitle').value = '';
				document.getElementById('completion').value = '';
				renderTasks();
			} else {
				alertify.error('Error with updating Task ' + taskId);
			}
		})
		.catch((error) => {
			alertify.error('Error with updating Task ' + taskId);
			console.log(error);
		});
}
