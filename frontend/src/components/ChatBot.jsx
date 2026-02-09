import { useState, useRef, useEffect } from 'react'
import './ChatBot.css'

// Typing Animation Component
function TypingText({ text, speed = 15, onComplete }) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timeout)
    } else {
      setIsTyping(false)
      if (onComplete) {
        onComplete()
      }
    }
  }, [currentIndex, text, speed, onComplete])

  return (
    <div className={isTyping ? 'typing-active' : ''}>
      <FormattedMessage text={displayedText} />
    </div>
  )
}

// Format message with bullet points and structure
function FormattedMessage({ text }) {
  // Split text into lines
  const lines = text.split('\n').filter(line => line.trim())
  
  return (
    <div className="formatted-message">
      {lines.map((line, index) => {
        const trimmedLine = line.trim()
        
        // Main bullet point with colon (category headers like "College Name:", "Branches:")
        if (trimmedLine.startsWith('*') && trimmedLine.includes(':')) {
          const parts = trimmedLine.substring(1).split(':')
          const label = parts[0].trim()
          const value = parts.slice(1).join(':').trim()
          
          if (value) {
            // Has value - show as label: value
            return (
              <div key={index} className="message-info-row">
                <span className="info-label">{label}:</span>
                <span className="info-value">{value}</span>
              </div>
            )
          } else {
            // No value - it's a section header
            return (
              <div key={index} className="message-section-header">
                {label}
              </div>
            )
          }
        }
        // Regular bullet point (starts with *)
        else if (trimmedLine.startsWith('*')) {
          return (
            <div key={index} className="message-bullet">
              <span className="bullet-icon">•</span>
              <span>{trimmedLine.substring(1).trim()}</span>
            </div>
          )
        }
        // Sub-bullet or indented text (has multiple spaces at start)
        else if (trimmedLine.startsWith('-') || /^\s{2,}/.test(line)) {
          const content = trimmedLine.replace(/^-\s*/, '').trim()
          // Check if it's a sub-category with colon
          if (content.includes(':')) {
            const parts = content.split(':')
            const label = parts[0].trim()
            const value = parts.slice(1).join(':').trim()
            
            return (
              <div key={index} className="message-sub-info">
                <span className="sub-info-label">{label}:</span>
                <span className="sub-info-value">{value}</span>
              </div>
            )
          }
          return (
            <div key={index} className="message-sub-bullet">
              <span className="sub-bullet-icon">◦</span>
              <span>{content}</span>
            </div>
          )
        }
        // Regular text or summary
        else {
          // Check if it's a summary/conclusion line
          if (trimmedLine.toLowerCase().startsWith('summarized') || 
              trimmedLine.toLowerCase().startsWith('summary') ||
              trimmedLine.toLowerCase().startsWith('conclusion')) {
            return (
              <div key={index} className="message-summary-header">
                {trimmedLine}
              </div>
            )
          }
          // Check if line is all caps (might be a heading)
          else if (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 3) {
            return (
              <div key={index} className="message-caps-header">
                {trimmedLine}
              </div>
            )
          }
          return (
            <div key={index} className="message-text">
              {trimmedLine}
            </div>
          )
        }
      })}
    </div>
  )
}

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hi! I\'m Engimate Assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
      isTyping: false
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch(import.meta.env.VITE_N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          sessionId: sessionId
        })
      })

      const data = await response.json()

      // Handle response format: [{ "output": "message" }]
      let botResponseText = 'I received your message!'
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        botResponseText = data[0].output
      } else if (data.output) {
        botResponseText = data.output
      } else if (data.response) {
        botResponseText = data.response
      } else if (data.message) {
        botResponseText = data.message
      }

      const botMessage = {
        id: Date.now() + 1,
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
        isTyping: true
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I\'m having trouble connecting. Please try again later.',
        sender: 'bot',
        timestamp: new Date(),
        isTyping: false
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="chatbot-container">
      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'chat-window-open' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-content">
            <div className="chat-avatar">
              <span>🤖</span>
            </div>
            <div className="chat-header-text">
              <h3>Engimate Assistant</h3>
              <span className="chat-status">
                <span className="status-dot"></span>
                Online
              </span>
            </div>
          </div>
          <button onClick={toggleChat} className="chat-close-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              {message.sender === 'bot' && (
                <div className="message-avatar">🤖</div>
              )}
              <div className="message-content">
                <div className="message-bubble">
                  {message.sender === 'bot' && message.isTyping ? (
                    <TypingText 
                      text={message.text} 
                      speed={15}
                      onComplete={() => {
                        setMessages(prev => 
                          prev.map(msg => 
                            msg.id === message.id ? { ...msg, isTyping: false } : msg
                          )
                        )
                      }}
                    />
                  ) : message.sender === 'bot' ? (
                    <FormattedMessage text={message.text} />
                  ) : (
                    message.text
                  )}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="chat-message bot-message">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="message-bubble typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="chat-input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="chat-send-btn"
            disabled={!inputMessage.trim() || isLoading}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>

      {/* Floating Button */}
      <button 
        onClick={toggleChat}
        className={`chat-toggle-btn ${isOpen ? 'chat-toggle-btn-open' : ''}`}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 5L5 19M5 5L19 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
    </div>
  )
}

export default ChatBot
