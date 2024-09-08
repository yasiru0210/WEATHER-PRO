document.addEventListener('DOMContentLoaded', function() {
    const location = 'YOUR_DEFAULT_LOCATION'; // Set a default location or get from user input

    fetch(`https://api.weatherapi.com/v1/current.json?key=edfa7945f1a74d22bf4115257242908&q=${location}`)
        .then(response => response.json())
        .then(data => {
            // Display detailed weather data
            document.getElementById('detailed-location').textContent = `Location: ${data.name}`;
            document.getElementById('detailed-temp').textContent = `Temperature: ${data.main.temp} °C`;
            document.getElementById('detailed-humidity').textContent = `Humidity: ${data.main.humidity}%`;
            document.getElementById('detailed-wind').textContent = `Wind Speed: ${data.wind.speed} m/s`;
            document.getElementById('detailed-condition').textContent = `Condition: ${data.weather[0].description}`;

            // Initialize map
            if (window.google && window.google.maps) {
                const map = new google.maps.Map(document.getElementById('detailed-map'), {
                    center: { lat: data.coord.lat, lng: data.coord.lon },
                    zoom: 12
                });
                new google.maps.Marker({
                    position: { lat: data.coord.lat, lng: data.coord.lon },
                    map: map,
                    title: data.name
                });
            }
        })
        .catch(error => console.error('Error fetching weather data:', error));
});
