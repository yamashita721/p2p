import { useEffect, useState, useRef } from 'react';
import { socket } from './socket';
import './App.css'; // Import the new styles!

export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null); // Used for auto-scrolling

  // Auto-scroll to bottom whenever messages array changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    
    socket.on("waiting", (msg) => {
        setMessages((prev) => [...prev, { sender: 'system', text: msg }]);
    });
    
    socket.on("match_success", (msg) => {
        setMessages((prev) => [...prev, { sender: 'system', text: msg }]);
    });
    
    socket.on("chat_message", (msg) => {
        setMessages((prev) => [...prev, { sender: 'stranger', text: msg }]);
    });
    
    socket.on("partner_disconnected", (msg) => {
        setMessages((prev) => [...prev, { sender: 'system', text: msg }]);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("waiting");
      socket.off("match_success");
      socket.off("chat_message");
      socket.off("partner_disconnected");
    };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (text.trim() === "") return;
    
    socket.emit("chat_message", text);
    setMessages((prev) => [...prev, { sender: 'you', text }]);
    setText("");
  };

  const handleSkip = () => {
    setMessages([]); 
    socket.emit("skip");
  };

  return (
    <div className="app-container">
      <div className="chat-window">
        
        {/* Header */}
        <div className="chat-header">
          <h1>P2P CHAT</h1>
          <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot"></div>
            {isConnected ? "Connected" : "Disconnected"}
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.sender}`}>
              {m.text}
            </div>
          ))}
          {/* Invisible div to scroll down to */}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <form onSubmit={handleSend} className="chat-input-area">
          <button type="button" onClick={handleSkip} className="btn-next">
            Next
          </button>
          <input 
            className="chat-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            autoComplete="off"
          />
          <button type="submit" className="btn-send">
            Send
          </button>
        </form>

      </div>
    </div>
  );
}