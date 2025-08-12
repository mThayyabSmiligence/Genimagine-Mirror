import { io } from "socket.io-client";

// connect to your backend Socket.IO server
const socket = io("http://localhost:5000", {
  withCredentials: true, // so cookies/auth can work
  transports: ["websocket"], // faster connection
});

export default socket;
