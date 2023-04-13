window.onload = function () {
	renderTasks();
};

async function fetchTasks() {
	const response = await fetch('http://localhost:3000/tasks');
	const tasks = await response.json();
	return tasks.slice(-6); // get the latest 6 tasks
}

function createTaskCard(task) {
	const card = document.createElement('div');
	card.classList.add('card');
	card.innerHTML = `
      <h2>${task.title}</h2>
      <p class="taskID">ID: ${task.id}</p>
      <p>Completed: ${task.completed}</p>
	  <i class="pen fa-solid fa-pen-to-square fa-lg"></i>
	  <i class="trash fa-solid fa-trash fa-lg"</i>
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

function addTask() {
	const taskName = document.getElementById('task_name').value;

	const body = {
		completed: false,
		title: taskName,
	};

	fetch('http://localhost:3000/tasks', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	})
		.then((response) => response.json())
		.then((data) => {
			console.log('Task added:', data);
		})
		.catch((error) => {
			console.error('Error adding task:', error);
		});
}
