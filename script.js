// Message Type Constants
const MessageType = {
    INCOMING: "incoming",
    OUTGOING: "outgoing",
    SYSTEM: "system"
};

// Helper Functions
function createMessage(content, type) {
    return {
        id: Date.now().toString(),
        content,
        type,
        timestamp: new Date().toLocaleTimeString(),
        status: "sent"
    };
}

function displayMessage(message) {
    const chatMessages = document.getElementById("chatMessages");
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", message.type);

    // Render Content
    messageElement.innerHTML = `
        <p>${message.content}</p>
        <span class="timestamp">${message.timestamp}</span>
    `;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the latest message
}

// Simulate API Call
async function simulateBotResponse(userMessage) {
    displayMessage(createMessage("Typing...", MessageType.SYSTEM));
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    const botReply = await fetchBotReply(userMessage); // Fetch API Response
    displayMessage(createMessage(botReply, MessageType.INCOMING));

    // Remove typing indicator
    document.querySelector(".message.system").remove();
}

// Fetch Bot Reply Using OpenAI API
async function fetchBotReply(userMessage) {

    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCGgAnaXrro_JfwkTMKBS4PSLNRM6xfe7U', {
            method: "POST", 
            headers: { 
                "Content-Type": "application/json",

            },
            body:JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text:userMessage}]
                 }]
            })
    })

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
        // Extract the bot's reply
    } catch (error) {
        console.error("Error fetching bot reply:", error);
        return "Sorry, I couldn't process your request. Please try again later.";
    }
}

// Send Message Logic
document.getElementById("sendMessageBtn").addEventListener("click", async () => {
    const inputField = document.getElementById("userMessage");
    const userMessage = inputField.value.trim();

    if (userMessage) {
        const outgoingMessage = createMessage(userMessage, MessageType.OUTGOING);
        displayMessage(outgoingMessage);

        await simulateBotResponse(userMessage);
        inputField.value = ""; // Clear input field
    }
});

// Load Saved Messages
window.onload = function () {
    const chatMessages = JSON.parse(localStorage.getItem("chatHistory")) || [];
    chatMessages.forEach(displayMessage);
};

// Save Chat History on Exit
window.onbeforeunload = function () {
    const chatMessages = Array.from(document.querySelectorAll(".message")).map(msg => ({
        content: msg.querySelector("p").innerText,
        type: msg.classList.contains("incoming") ? MessageType.INCOMING : MessageType.OUTGOING,
        timestamp: msg.querySelector(".timestamp").innerText
    }));
    localStorage.setItem("chatHistory", JSON.stringify(chatMessages));
};
