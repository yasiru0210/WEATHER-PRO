document.addEventListener('DOMContentLoaded', function() {
    const location = 'YOUR_DEFAULT_LOCATION'; // Set a default location or get from user input

    fetch(`https://api.weatherapi.com/v1/current.json?key=edfa7945f1a74d22bf4115257242908&q=${location}`)
        .then(response => response.json())
        .then(data => {
            // Display forecast for the next 3 days
            document.getElementById('forecast-day1-temp').textContent = `${data.list[0].main.temp} °C`;
            document.getElementById('forecast-day1-cond').textContent = data.list[0].weather[0].description;

            document.getElementById('forecast-day2-temp').textContent = `${data.list[8].main.temp} °C`;
            document.getElementById('forecast-day2-cond').textContent = data.list[8].weather[0].description;

            document.getElementById('forecast-day3-temp').textContent = `${data.list[16].main.temp} °C`;
            document.getElementById('forecast-day3-cond').textContent = data.list[16].weather[0].description;
        })
        .catch(error => console.error('Error fetching forecast data:', error));
});
