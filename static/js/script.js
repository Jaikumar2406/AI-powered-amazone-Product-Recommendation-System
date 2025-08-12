class ChatApp {
  constructor() {
    this.chatBox = document.getElementById("chatBox");
    this.questionInput = document.getElementById("questionInput");
    this.generateBtn = document.getElementById("generateBtn");
    this.btnText = this.generateBtn.querySelector(".btn-text");
    this.btnLoading = this.generateBtn.querySelector(".btn-loading");

    // API configuration
    this.API_BASE_URL = "https://ai-product-recommendation-api.onrender.com";
    
    this.initializeEventListeners();
    this.setupSmoothScrolling();
  }

  initializeEventListeners() {
    // Generate button click
    this.generateBtn.addEventListener("click", () => this.handleGenerate());

    // Enter key press
    this.questionInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.handleGenerate();
      }
    });

    // Auto-resize input
    this.questionInput.addEventListener("input", () => {
      this.questionInput.style.height = "auto";
      this.questionInput.style.height = this.questionInput.scrollHeight + "px";
    });
  }

  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  }

  async handleGenerate() {
    const question = this.questionInput.value.trim();

    if (!question) {
      this.showError("Please enter a question first!");
      return;
    }

    // Add user message
    this.addMessage(question, "user");

    // Clear and reset input
    this.questionInput.value = "";
    this.questionInput.style.height = "auto";

    // Show loading state
    this.setLoadingState(true);

    try {
      // Show typing indicator
      const typingIndicator = this.addTypingIndicator();
      
      // Make API call
      const response = await this.callAPI(question);
      
      // Remove typing indicator and show response
      typingIndicator.remove();
      this.addMessage(response, "bot");
    } catch (error) {
      console.error("API Error:", error);
      this.addMessage(this.getUserFriendlyError(error), "bot");
    } finally {
      this.setLoadingState(false);
    }
  }

  async callAPI(question) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: question,
          session_id: "default",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.recommendation) {
        return data.recommendation;
      } else {
        throw new Error(data.error || "No recommendation found");
      }
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  getUserFriendlyError(error) {
    if (error.message.includes("Failed to fetch")) {
      return "Unable to connect to the server. Please check your internet connection.";
    } else if (error.message.includes("HTTP error")) {
      return "The server encountered an error. Please try again later.";
    }
    return "Sorry, I encountered an error while processing your request. Please try again.";
  }

  addTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.className = "message bot-message typing-indicator";
    typingDiv.innerHTML = `
      <div class="message-avatar bot-avatar">🤖</div>
      <div class="message-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    this.chatBox.appendChild(typingDiv);
    this.scrollToBottom();
    return typingDiv;
  }

  addMessage(content, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}-message`;

    const avatarDiv = document.createElement("div");
    avatarDiv.className = `message-avatar ${sender}-avatar`;
    avatarDiv.textContent = sender === "user" ? "👤" : "🤖";

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";

    const paragraph = document.createElement("p");
    paragraph.textContent = content;
    contentDiv.appendChild(paragraph);

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);

    this.chatBox.appendChild(messageDiv);
    this.scrollToBottom();
  }

  setLoadingState(isLoading) {
    if (isLoading) {
      this.generateBtn.disabled = true;
      this.btnText.style.display = "none";
      this.btnLoading.style.display = "block";
      this.questionInput.disabled = true;
    } else {
      this.generateBtn.disabled = false;
      this.btnText.style.display = "block";
      this.btnLoading.style.display = "none";
      this.questionInput.disabled = false;
      this.questionInput.focus();
    }
  }

  scrollToBottom() {
    this.chatBox.scrollTop = this.chatBox.scrollHeight;
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      z-index: 1001;
      animation: fadeIn 0.3s ease-in;
    `;
    errorDiv.textContent = message;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }
}

// Initialize the chat app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ChatApp();
});

// Add typing indicator styles
document.addEventListener("DOMContentLoaded", () => {
  const style = document.createElement("style");
  style.textContent = `
    .typing-dots {
      display: flex;
      gap: 4px;
      padding: 10px;
    }
    
    .typing-dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #64748b;
      animation: typing 1.4s infinite ease-in-out;
    }
    
    .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes typing {
      0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    .error-message {
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
});
