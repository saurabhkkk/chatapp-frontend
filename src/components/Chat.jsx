import React, { useState, useEffect } from "react";
import { socket } from "../socket";
import decryptMessage from "../utils/crypto";

function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const roomId = "general";

  useEffect(() => {
    if (!socket.connected) {
      socket.auth = { token: localStorage.getItem("token") };
      socket.connect();
      console.log("Connecting to server...");
    }

    const handleConnect = () => {
      console.log("Connected with socket id", socket.id);
      setIsConnected(true);

      if (user) {
        socket.emit("joinRoom", { username: user.username, roomId });
        console.log(`Emitted joinRoom with roomId ${roomId}`);
      }
    };

    const handleDisconnect = () => {
      console.log("Disconnected from server.");
      setIsConnected(false);
    };

    // Listen for incoming messages
    socket.on("message", (data) => {
      console.log("Received message from server:", data);
      const decryptedMessage = decryptMessage(data.message);
      setMessages((prevMessages) => [
        ...prevMessages,
        { username: data.username, message: decryptedMessage },
      ]);
    });

    // Listen for incoming images
    socket.on("image", (data) => {
      console.log("Received image from server:", data);
      setMessages((prevMessages) => [
        ...prevMessages,
        { username: data.username, image: data.image },
      ]);
    });

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("message"); // Clean up message listener
      socket.off("image"); // Clean up image listener
    };
  }, [user]);

  const sendMessage = () => {
    if (inputMessage.trim() !== "") {
      socket.emit("message", { roomId, message: inputMessage });
      setInputMessage("");
    }
  };

  const sendImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result;
        socket.emit("image", { roomId, image: base64Image });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div key={index} className="mb-2">
            <span className="font-bold">{message.username}: </span>
            {message.message && <span>{message.message}</span>}
            {message.image && (
              <img
                src={message.image}
                alt="User upload"
                className="max-w-full h-auto"
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex p-4">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 px-3 py-2 mr-2 border border-gray-300 rounded"
        />
        <button
          onClick={sendMessage}
          className="px-3 py-2 bg-blue-600 text-white rounded"
        >
          Send
        </button>
        <input type="file" onChange={sendImage} className="ml-2" />
      </div>
    </div>
  );
}

export default Chat;
