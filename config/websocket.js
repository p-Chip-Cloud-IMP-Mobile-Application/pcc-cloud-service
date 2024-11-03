const WebSocket = require("ws");
const http = require("http"); // Import http to create an HTTP server

module.exports = (app) => {
  // Create an HTTP server to be shared with Express and WebSocket
  const server = http.createServer(app);

  // Initialize WebSocket Server on the HTTP server
  const wss = new WebSocket.Server({ server });

  // WebSocket Connection Handling
  wss.on("connection", (ws) => {
    console.log("New WebSocket connection");

    // Handle incoming messages from the client
    ws.on("message", (message) => {
      console.log(`Received: ${message}`);
      // You can send back a response
      ws.send(`Server response: ${message}`);
    });

    // Handle client disconnect
    ws.on("close", () => {
      console.log("WebSocket connection closed");
    });
  });

  // Return the HTTP server so it can be used in `app.js`
  return server;
};
