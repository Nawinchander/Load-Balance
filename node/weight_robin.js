const http = require("http");

const servers = [
  { url: "http://localhost:5001", weight: 3 },
  { url: "http://localhost:5002", weight: 1 }
];

// expand list based on weight
const pool = servers.flatMap(s => Array(s.weight).fill(s.url));
let index = 0;

function proxy(target, req, res) {
  const p = http.request(target + req.url, {
    method: req.method,
    headers: req.headers
  }, pr => {
    res.writeHead(pr.statusCode, pr.headers);
    pr.pipe(res);
  });

  req.pipe(p);
}

http.createServer((req, res) => {
  const target = pool[index];
  index = (index + 1) % pool.length;

  console.log("Routing to", target);
  proxy(target, req, res);
}).listen(3000, () => console.log("Weighted LB running"));