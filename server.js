const express = require("express");
var base64 = require('base-64');
var utf8 = require('utf8');
const sha1 = require("sha1");
const crypto = require("crypto");

const app = express();

let payload;
let time = null;
const header = {
  "alg": "HS256",
  "typ": "JWT"
};

app.use( express.json()); 

const tokens = {

};

const loginHandler = (req, res) => {
  // const header = {
  //   "alg": "HS256",
  //   "typ": "JWT"
  // };

  payload = {
    "name": req.body.name,
    "admin": req.body.admin
  };

  if(tokens[JSON.stringify(payload)]) {
    res.send(tokens[JSON.stringify(payload)].JWT);
  }

  console.log("no presetn in tokens!!");

  var text = JSON.stringify(header);
  var bytes = utf8.encode(text);
  var encoded = base64.encode(bytes);

  const headerB64 = encoded;

  time = new Date().getTime();

  console.log("time: ", time);

  var text = JSON.stringify(payload);
  var bytes = utf8.encode(text);
  var encoded = base64.encode(bytes);

  const payloadB64 = encoded;

  const sigB64 = crypto.createHmac('sha256', time.toString()).update(`${headerB64}.${payloadB64}`).digest("base64");

  tokens[sigB64].time = time;

  setTimeout(() => {
    delete tokens[sigB64].time;
  }, 10);

  res.send(`${headerB64}.${payloadB64}.${sigB64}`);
}

app.post('/login', loginHandler); 



function hasLoggedIn(req, res, next) {
  console.log("checking if logged in...");
  if(time != null)
    next();
  else
    res.send("please login");
}

app.use(hasLoggedIn);

app.get('/', (req, res) => {
  res.send("hello world!");
});

app.post('/verify', (req, res) => {
  // console.log(req.headers);
  console.log(req.headers.authorization);
  const [b64Header, b64Payload, b64Sig] = req.headers.authorization.split(".");

  res.send(tokens[JSON.stringify(b64Payload)] && JSON.stringify(tokens[JSON.stringify(b64Payload)]["b64Signature"]) === b64Sig);
  
});

app.listen(3000, () => {
  console.log(`Example app listening at http://localhost:3000`)
})