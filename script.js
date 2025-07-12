document.addEventListener('DOMContentLoaded', () => {
    const myButton = document.getElementById('myButton');
    const messageElement = document.getElementById('message');

    myButton.addEventListener('click', () => {
        messageElement.textContent = "Button clicked! You're learning web dev!";
        alert("Hello from JavaScript!"); // A simple popup message
    });
});
