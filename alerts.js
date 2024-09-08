document.addEventListener('DOMContentLoaded', function() {
    const location = 'YOUR_DEFAULT_LOCATION'; // Set a default location or get from user input

    fetch(`https://api.weatherapi.com/v1/current.json?key=edfa7945f1a74d22bf4115257242908&q=${location}`)
        .then(response => response.json())
        .then(data => {
            // Display weather alerts
            let alertsHtml = '<h2>Current Alerts:</h2>';
            data.alerts.forEach(alert => {
                alertsHtml += `
                    <div class="alert alert-warning">
                        <h4 class="alert-heading">${alert.title}</h4>
                        <p>${alert.description}</p>
                    </div>
                `;
            });
            document.getElementById('weather-alerts').innerHTML = alertsHtml;
        })
        .catch(error => console.error('Error fetching weather alerts:', error));
});
