//// Round Robin Load Balancer

class RoundRobinBalancer {
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

// Usage
const balancer = new RoundRobinBalancer([
  "http://server1",
  "http://server2",
  "http://server3",
]);

console.log(balancer.getNextServer()); // server1
console.log(balancer.getNextServer()); // server2
console.log(balancer.getNextServer()); // server3


