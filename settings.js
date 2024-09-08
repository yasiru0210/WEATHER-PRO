function saveSettings() {
    const tempUnit = document.getElementById('temperature-unit').value;
    const theme = document.getElementById('theme').value;

    localStorage.setItem('temperature-unit', tempUnit);
    localStorage.setItem('theme', theme);

    alert('Settings saved!');
}
