const http = require("http");

let servers = [
  { url: "http://localhost:5001", alive: true },
  { url: "http://localhost:5002", alive: true }
];

let index = 0;

function healthCheck() {
  servers.forEach(s => {
    const req = http.request(s.url, { timeout: 1000 }, res => {
      s.alive = res.statusCode < 500;
    });

    req.on("error", () => s.alive = false);
    req.end();
  });

  console.log("Health:", servers);
}

setInterval(healthCheck, 4000);

function getServer() {
  const alive = servers.filter(s => s.alive);
  if (!alive.length) return null;

  const server = alive[index % alive.length];
  index++;
  return server.url;
}

http.createServer((req, res) => {
  const target = getServer();

  if (!target) {
    res.writeHead(503);
    return res.end("No servers available");
  }

  const p = http.request(target + req.url, pr => {
    res.writeHead(pr.statusCode, pr.headers);
    pr.pipe(res);
  });

  req.pipe(p);
}).listen(3000, () => console.log("Health-check LB running"));