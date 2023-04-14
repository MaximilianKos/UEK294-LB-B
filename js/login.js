window.onload = function () {
	document.getElementById('login-form').addEventListener('submit', function (event) {
		event.preventDefault();

		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;

		const data = { email, password };

		fetch('http://localhost:3000/auth/jwt/sign', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})
			.then((response) => {
				if (response.status === 200) {
					return response.json();
				} else {
					alertify.set('notifier', 'position', 'top-left');
					alertify.error('Incorrect Password!' + taskId);
					throw new Error('Incorrect Password!');
				}
			})
			.then((data) => {
				sessionStorage.setItem('jwtToken', data.token);

				window.location.href = '/index.html';
			})
			.catch((error) => {
				console.error(error);
			});
	});
};
