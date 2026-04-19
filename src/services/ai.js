const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

export const aiAPI = {
  /**
   * Helper function to call Gemini REST API
   */
  async generateContent(promptText) {
    if (!API_KEY) {
      throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
    }

    try {
      const response = await fetch(`${GEMINI_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptText,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Failed to communicate with AI service.');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  },

  /**
   * Generates a professional email draft based on a short prompt
   */
  async generateDraft(prompt) {
    const fullPrompt = `You are a helpful and professional email assistant. Write a complete, well-formatted email based on the following instruction: "${prompt}". Do not include placeholder text like [Your Name]. Just write the body of the email.`;
    return await this.generateContent(fullPrompt);
  },

  /**
   * Improves the writing of the provided text
   */
  async improveWriting(text, tone = 'professional') {
    const fullPrompt = `You are an expert editor. Rewrite the following email text to make it more ${tone}. Ensure it has perfect grammar and flows well. Only return the rewritten text, nothing else.\n\nOriginal Text:\n${text}`;
    return await this.generateContent(fullPrompt);
  },

  /**
   * Summarizes a long email
   */
  async summarizeEmail(emailBody) {
    const fullPrompt = `You are an AI assistant. Please provide a concise 2-3 sentence summary of the following email. Only return the summary.\n\nEmail Content:\n${emailBody}`;
    return await this.generateContent(fullPrompt);
  },

  /**
   * Extracts action items from an email
   */
  async extractActionItems(emailBody) {
    const fullPrompt = `Analyze the following email and extract any implicit or explicit action items, tasks, or follow-ups required. Present them as a concise bulleted list. If there are no action items, reply with "No action items found."\n\nEmail Content:\n${emailBody}`;
    return await this.generateContent(fullPrompt);
  },

  /**
   * Generates an Out-Of-Office auto-reply
   */
  async generateAutoReply(context) {
    const fullPrompt = `You are an AI assistant. Write a professional Out-Of-Office (OOO) auto-reply email based on the following context: "${context}". Keep it concise and polite.`;
    return await this.generateContent(fullPrompt);
  },

  /**
   * Chat bot handler with MailForge Platform Context
   */
  async chatWithPlatformContext(chatHistory, userMessage) {
    const SYSTEM_PROMPT = `
You are the official MailForge AI Assistant. You are a helpful, knowledgeable, and polite chatbot integrated directly into the MailForge platform.
Here is what you know about MailForge:
- MailForge is an advanced, privacy-first email service inspired by modern clean UIs but built with security as the number one priority.
- Features include Client-Side AES-256 Encryption (End-to-End Encryption where the server never sees the plaintext).
- Cryptographic Hash Integrity Checks: Emails are hashed so users can verify if tampering occurred.
- Secure Identity: Users create a unique '@mailforge.com' Mail ID upon registration.
- Microservices Architecture: Powered by Spring Boot / Node.js microservices (Auth, User, Mail) and a centralized Supabase PostgreSQL database.
- Universal Availability: You (the chatbot) are available to both logged-out guests on the landing page and logged-in users inside their encrypted inbox.

Please answer the user's message appropriately based on this context. Keep your answers concise, formatted well, and friendly.

User Message: "${userMessage}"
`;

    // To properly handle history with the basic generateContent endpoint, 
    // we will format the history into the prompt string.
    let fullPrompt = SYSTEM_PROMPT + '\n\nChat History:\n';
    
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.forEach(msg => {
        fullPrompt += `${msg.role === 'user' ? 'User' : 'MailForge AI'}: ${msg.text}\n`;
      });
    }

    fullPrompt += `\nMailForge AI:`;

    return await this.generateContent(fullPrompt);
  }
};
