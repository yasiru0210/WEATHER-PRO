function fetchHistoricalData() {
    const date = document.getElementById('historical-date').value;
    const location = 'YOUR_DEFAULT_LOCATION'; // Set a default location or get from user input

    fetch(`https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=YOUR_LATITUDE&lon=YOUR_LONGITUDE&dt=${new Date(date).getTime() / 1000}&appid=YOUR_API_KEY`)
        .then(response => response.json())
        .then(data => {
            // Display historical data
            document.getElementById('historical-data').innerHTML = `
                <h3>Temperature: ${data.current.temp} °C</h3>
                <p>Weather: ${data.current.weather[0].description}</p>
            `;
        })
        .catch(error => console.error('Error fetching historical data:', error));
}
