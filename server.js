// Ibratabian17's jdu

const express = require("express");
const app = express();
console.log(`[MAIN] Starting daemon`);
process.title = "OpenParty | Custom Just Dance Unlimited Server";

const settings = require('./settings.json');
const core = require('./core/core');
const port = settings.server.forcePort ? settings.server.port : process.env.PORT || settings.server.port;
const isPublic = settings.server.isPublic ? "0.0.0.0" : "127.0.0.1";

// Initialize Express.js
const server = app.listen(port, isPublic, () => {
  core.init(app, express, server);
  console.log(`[MAIN] listening on ${isPublic}:${port}`);
  console.log(`[MAIN] Open panel to see more log`);
  console.log(`[MAIN] Running on ${process.env.NODE_ENV} session`);
});
