document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Handle form submission, e.g., send data to a server
    console.log('Contact Form Submitted:', { name, email, message });

    alert('Thank you for contacting us!');
});
