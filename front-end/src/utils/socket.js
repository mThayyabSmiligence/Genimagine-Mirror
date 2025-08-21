// utils/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:3001", {
  withCredentials: true,
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
  const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
  if (userData?.user_id) {
    socket.emit("joinUserRoom", userData.user_id);
    console.log(`Joined room user_${userData.user_id}`);
  }
});

export default socket;
