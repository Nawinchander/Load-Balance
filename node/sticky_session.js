const http = require("http");

const servers = [
  "http://localhost:5001",
  "http://localhost:5002"
];

const sessionMap = new Map();
let index = 0;

function chooseServer(sessionId) {
  if (sessionMap.has(sessionId)) return sessionMap.get(sessionId);

  const server = servers[index];
  index = (index + 1) % servers.length;
  sessionMap.set(sessionId, server);

  return server;
}

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

  // get session cookie
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/SESSION=(\w+)/);

  let sessionId;

  if (match) {
    sessionId = match[1];
  } else {
    sessionId = Math.random().toString(36).slice(2);
    res.setHeader("Set-Cookie", `SESSION=${sessionId}`);
  }

  const target = chooseServer(sessionId);
  console.log("User routed to", target);

  proxy(target, req, res);

}).listen(3000, () => console.log("Sticky LB running"));