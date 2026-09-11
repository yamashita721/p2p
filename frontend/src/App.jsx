import { useEffect, useState } from 'react';
import { socket } from './socket';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState(""); // Tracks the input box

  useEffect(() => {
    // 1. Listeners first
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    
    socket.on("match_success", (msg) => {
        setMessages((prev) => [...prev, `System: ${msg}`]);
    });
    
    socket.on("chat_message", (msg) => {
        setMessages((prev) => [...prev, `Stranger: ${msg}`]);
    });
    
    socket.on("partner_disconnected", (msg) => {
        setMessages((prev) => [...prev, `System: ${msg}`]);
    });

    // 2. Connect second
    socket.connect();

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("match_success");
      socket.off("chat_message");
      socket.off("partner_disconnected");
      socket.disconnect();
    };
  }, []);

  // 3. The Send Function
  const handleSend = (e) => {
    e.preventDefault();
    if (text.trim() === "") return;
    
    // Fire the message across the WebSocket to the backend
    socket.emit("chat_message", text);
    
    // Add the message to our own screen (since the server only sends it to the partner)
    setMessages((prev) => [...prev, `You: ${text}`]);
    setText(""); // Clear the input box
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