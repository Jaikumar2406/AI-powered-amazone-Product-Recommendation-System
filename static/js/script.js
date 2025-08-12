class ChatApp {
  constructor() {
    this.chatBox = document.getElementById("chatBox");
    this.questionInput = document.getElementById("questionInput");
    this.generateBtn = document.getElementById("generateBtn");
    this.btnText = this.generateBtn.querySelector(".btn-text");
    this.btnLoading = this.generateBtn.querySelector(".btn-loading");
    
    // Configure with your Render URL
    this.API_BASE_URL = "https://ai-powered-amazone-product.onrender.com";
    
    this.initialize();
  }

  initialize() {
    this.setupEventListeners();
    this.addWelcomeMessage();
  }

  setupEventListeners() {
    // Generate button
    this.generateBtn.addEventListener("click", () => this.handleGenerate());

    // Enter key (but allow Shift+Enter for new lines)
    this.questionInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.handleGenerate();
      }
    });

    // Auto-resizing textarea
    this.questionInput.addEventListener("input", () => {
      this.adjustInputHeight();
    });
  }

  adjustInputHeight() {
    this.questionInput.style.height = "auto";
    this.questionInput.style.height = `${Math.min(this.questionInput.scrollHeight, 200)}px`;
  }

  addWelcomeMessage() {
    this.addMessage("Hello! I'm your AI shopping assistant. How can I help you today?", "bot");
  }

  async handleGenerate() {
    const question = this.questionInput.value.trim();
    if (!question) {
      this.showError("Please enter your question first");
      return;
    }

    this.addMessage(question, "user");
    this.resetInput();
    this.setLoadingState(true);

    try {
      const typingIndicator = this.showTypingIndicator();
      const response = await this.fetchRecommendation(question);
      this.hideTypingIndicator(typingIndicator);
      this.displayResponse(response);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.setLoadingState(false);
    }
  }

  resetInput() {
    this.questionInput.value = "";
    this.adjustInputHeight();
  }

  async fetchRecommendation(question) {
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
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }

    return await response.json();
  }

  showTypingIndicator() {
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

  hideTypingIndicator(indicator) {
    indicator?.remove();
  }

  displayResponse(response) {
    const message = response?.recommendation || response?.answer || "I couldn't find a recommendation.";
    this.addMessage(message, "bot");
  }

  handleError(error) {
    console.error("API Error:", error);
    let errorMessage = "Sorry, I encountered an error. Please try again.";
    
    if (error.message.includes("Failed to fetch")) {
      errorMessage = "Couldn't connect to the server. Please check your internet connection.";
    } else if (error.message.includes("500")) {
      errorMessage = "Server error occurred. Please try again later.";
    }
    
    this.addMessage(errorMessage, "bot");
  }

  addMessage(content, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = `
      <div class="message-avatar ${sender}-avatar">${sender === "user" ? "👤" : "🤖"}</div>
      <div class="message-content">
        <p>${content}</p>
      </div>
    `;
    
    this.chatBox.appendChild(messageDiv);
    this.scrollToBottom();
  }

  setLoadingState(isLoading) {
    this.generateBtn.disabled = isLoading;
    this.questionInput.disabled = isLoading;
    this.btnText.style.display = isLoading ? "none" : "block";
    this.btnLoading.style.display = isLoading ? "block" : "none";
    
    if (!isLoading) {
      this.questionInput.focus();
    }
  }

  scrollToBottom() {
    this.chatBox.scrollTop = this.chatBox.scrollHeight;
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 3000);
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new ChatApp();
  
  // Add typing animation styles
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
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }
    .error-message {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
});
