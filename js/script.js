// Function to load components
function loadComponent(componentId, filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            document.getElementById(componentId).innerHTML = data;
        })
        .catch(error => console.error('Error loading component:', error));
}

// Load header and footer when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('header', 'components/header.html');
    loadComponent('footer', 'components/footer.html');
});
