document.getElementById('login-form').addEventListener('submit', function (event) {
	event.preventDefault();

	const email = document.getElementById('email').value;
	const password = document.getElementById('password').value;

	const data = { email, password };

	fetch('http://localhost:3000/auth/jwt/sign', {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
			if (data.redirect) {
				window.location.href = data.redirect;
			} else {
				alert('Incorrect username or password. Please try again.');
			}
		});
});
