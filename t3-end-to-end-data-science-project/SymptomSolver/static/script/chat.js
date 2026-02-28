// Get elements
const chatForm = document.getElementById('chatForm');
const chatMessages = document.getElementById('chatMessages');
const loadingAnimation = document.getElementById('loadingAnimation');
const responseContainer = document.getElementById('responseContainer');
const responseText = document.getElementById('responseText');

chatForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const promptInput = document.getElementById('prompt');
    const userMessage = promptInput.value;
    
    // Show user's message
    chatMessages.innerHTML += `
        <div class="flex justify-end">
            <div class="bg-blue-500 text-white p-3 rounded-lg max-w-xs text-sm shadow">
                ${userMessage}
            </div>
        </div>
    `;
    promptInput.value = '';  // Clear input field

    // Show loading animation
    loadingAnimation.classList.remove('hidden');
    
    // Send request to Flask server
    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'prompt': userMessage
        })
    })
    .then(response => response.json())
    .then(data => {
        // Hide loading animation
        loadingAnimation.classList.add('hidden');
        
        // Show the bot's response
        chatMessages.innerHTML += `
            <div class="flex justify-start">
                <div class="bg-gray-300 text-gray-800 p-3 rounded-lg max-w-xs text-sm shadow">
                    ${data.response}
                </div>
            </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
    })
    .catch(error => {
        loadingAnimation.classList.add('hidden');
        alert('Error: ' + error);
    });
});
