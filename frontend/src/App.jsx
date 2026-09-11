import { useEffect, useState } from 'react';
import { socket } from './socket';

export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    // 1. Listeners
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    
    // THE MISSING LISTENER
    socket.on("waiting", (msg) => {
        setMessages((prev) => [...prev, `System: ${msg}`]);
    });
    
    socket.on("match_success", (msg) => {
        setMessages((prev) => [...prev, `System: ${msg}`]);
    });
    
    socket.on("chat_message", (msg) => {
        setMessages((prev) => [...prev, `Stranger: ${msg}`]);
    });
    
    socket.on("partner_disconnected", (msg) => {
        setMessages((prev) => [...prev, `System: ${msg}`]);
    });

    // 2. Cleanup listeners (Do NOT call socket.disconnect() here anymore)
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
    setMessages((prev) => [...prev, `You: ${text}`]);
    setText("");
  };

  const handleSkip = () => {
    setMessages([]); 
    socket.emit("skip");
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>P2P CHAT</h1>
      <p style={{ color: isConnected ? 'green' : 'red', fontWeight: 'bold' }}>
        Status: {isConnected ? "Connected" : "Disconnected"}
      </p>
      
      <div style={{ border: '2px solid #333', height: '400px', overflowY: 'auto', marginBottom: '10px', padding: '15px', borderRadius: '8px' }}>
        {messages.map((m, i) => (
          <p key={i} style={{ margin: '5px 0' }}>{m}</p>
        ))}
      </div>
      
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
        <button 
          type="button" 
          onClick={handleSkip} 
          style={{ padding: '10px 20px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Next
        </button>
        <input 
          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Send
        </button>
      </form>
    </div>
  );
}