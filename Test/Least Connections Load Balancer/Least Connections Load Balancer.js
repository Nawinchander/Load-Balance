class Server {
  constructor(name) {
    this.name = name;
    this.activeConnections = 0;
  }

  handleRequest() {
    this.activeConnections++;

    // Simulate request processing time (random)
    const processingTime = Math.floor(Math.random() * 1000);

    setTimeout(() => {
      this.activeConnections--;
    }, processingTime);
  }
}

class LeastConnectionLB {
  constructor(servers) {
    this.servers = servers;
  }

  getServer() {
    return this.servers.reduce((min, server) =>
      server.activeConnections < min.activeConnections ? server : min
    );
  }

  handleRequest() {
    const server = this.getServer();
    server.handleRequest();
    return server.name;
  }
}

// Setup
const servers = [
  new Server("S1"),
  new Server("S2"),
  new Server("S3")
];

const lb = new LeastConnectionLB(servers);

// Simulate traffic
const distribution = { S1: 0, S2: 0, S3: 0 };

for (let i = 0; i < 100; i++) {
  setTimeout(() => {
    const server = lb.handleRequest();
    distribution[server]++;
  }, Math.random() * 500);
}

// Print result after some time
setTimeout(() => {
  console.log("Final distribution:", distribution);
}, 2000);

