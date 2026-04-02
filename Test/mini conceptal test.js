class LoadBalancer {
  constructor(servers) {
    this.servers = servers;
    this.index = 0;
  }

  getNextServer() {
    const server = this.servers[this.index];
    this.index = (this.index + 1) % this.servers.length;
    return server;
  }
}

// Simulate requests
const lb = new LoadBalancer(["S1", "S2", "S3"]);

const distribution = {};

for (let i = 0; i < 1000; i++) {
  const server = lb.getNextServer();
  distribution[server] = (distribution[server] || 0) + 1;
}

console.log(distribution);


