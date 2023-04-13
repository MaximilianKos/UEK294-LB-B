const token = getToken();

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
	  <i class="pen fa-solid fa-pen-to-square fa-lg"></i>
	  <i class="trash fa-solid fa-trash fa-lg" onclick="deleteTask(${task.id})"</i>
    `;
	return card;
}

async function renderTasks() {
	const tasks = await fetchTasks();
	const cardsDiv = document.getElementById('task-container');
	cardsDiv.innerHTML = '';
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
		})
		.catch((error) => {
			alertify.set('notifier', 'position', 'top-left');
			alertify.error('Error adding task');
		});
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
				alertify.success('Successfully deleted Task: ' + taskId);
				renderTasks();
			} else {
				alertify.set('notifier', 'position', 'top-left');
				alertify.error('Error with deleting Task: q' + taskId);
			}
		})
		.catch((error) => {
			alertify.set('notifier', 'position', 'top-left');
			alertify.error('Error with deleting Task: ' + taskId);
		});
}
