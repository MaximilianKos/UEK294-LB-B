const token = getToken();
if (!token) {
	window.location.href = '/login.html';
}

window.onload = function () {
	renderTasks();
};

function getToken() {
	return sessionStorage.getItem('jwtToken');
}

// -- GET -- //

async function fetchTasks() {
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

function createTaskCard(task) {
	const card = document.createElement('div');
	card.classList.add('card');
	card.innerHTML = `
      <h2>${task.title}</h2>
      <p class="taskID">ID: ${task.id}</p>
      <p>Completed: ${task.completed}</p>
	  <i class="pen fa-solid fa-pen-to-square fa-lg" onclick="editTask(${task.id})"></i>
	  <i class="trash fa-solid fa-trash fa-lg" onclick="deleteTask(${task.id})"</i>
    `;
	return card;
}

async function renderTasks() {
	const tasks = await fetchTasks();
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
		const card = createTaskCard(task);
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
				alertify.set('notifier', 'position', 'top-left');
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
			.then((data) => {
				alertify.set('notifier', 'position', 'top-left');
				alertify.success('Task added');
				document.getElementById('task_name').value = '';

				renderTasks();
			})
			.catch((error) => {
				alertify.set('notifier', 'position', 'top-left');
				alertify.error('Error adding Task');
			});
	} else {
		alertify.set('notifier', 'position', 'top-left');
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
				alertify.set('notifier', 'position', 'top-left');
				alertify.success('Successfully deleted Task ' + taskId);
				renderTasks();
			} else {
				alertify.set('notifier', 'position', 'top-left');
				alertify.error('Error with deleting Task ' + taskId);
			}
		})
		.catch((error) => {
			alertify.set('notifier', 'position', 'top-left');
			alertify.error('Error with deleting Task ' + taskId);
		});
}

// -- EDIT -- //
