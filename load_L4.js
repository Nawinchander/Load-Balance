////l4 - load balancing

// L4 TCP Load Balancer
const net = require("net");

const servers = [
  { host: "127.0.0.1", port: 5001 },
  { host: "127.0.0.1", port: 5002 }
];

let current = 0;

const lb = net.createServer(clientSocket => {

  // round robin selection
  const target = servers[current];
  current = (current + 1) % servers.length;

  const targetSocket = net.connect(target.port, target.host);

  console.log(`Forwarding to ${target.port}`);

  // pipe raw TCP traffic both ways
  clientSocket.pipe(targetSocket);
  targetSocket.pipe(clientSocket);

  targetSocket.on("error", () => {
    clientSocket.end();
  });

});

lb.listen(4000, () => {
  console.log("L4 Load Balancer running on port 4000");
});