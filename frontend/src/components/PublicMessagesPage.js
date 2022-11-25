import React, { useEffect, useState } from "react";
import Axios from "axios";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import MessageBox from "./MessageBox";

const PublicMessagesPage = () => {
  const [user, setUser] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  async function handleSendMessage(e) {
    e.preventDefault();
    // 2
    if (!user) {
      alert("Please add your username");
      return;
    }
    // 3
    if (!message) {
      alert("Please add a message");
      return;
    }
    try {
      // 4
      await Axios.post("/new-message", {
        user: user,
        message: message,
      });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    // 2
    Axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;
    // 3
    const echo = new Echo({
      broadcaster: "pusher",
      key: process.env.REACT_APP_MIX_ABLY_PUBLIC_KEY,
      wsHost: "realtime-pusher.ably.io",
      wsPort: 443,
      disableStats: true,
      encrypted: true,
    });
    // 4
    echo
      .channel("public.room")
      .subscribed(() => {
        console.log("You are subscribed");
      })
      // 5
      .listen(".message.new", (data) => {
        // 6
        setMessages((oldMessages) => [...oldMessages, data]);
        setMessage("");
      });
  }, []);
  return (
    <div className="container">
      <div>
        <div>
          <h1>Messanger</h1>
          <p>Post your random thoughts for the world to see</p>
        </div>
        <div>
          {messages.map((message) => (
            <MessageBox key={message.id} message={message} />
          ))}
        </div>
        <div>
          <form onSubmit={(e) => handleSendMessage(e)}>
            <input
              type="text"
              placeholder="Set your username"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
            />
            <div>
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <button onClick={(e) => handleSendMessage(e)}>Send</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicMessagesPage;
