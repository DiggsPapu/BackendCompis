var operateRegex = require('../controllers/automaton.controller.js');
var express = require('express');
var api = express.Router()
api.post('/operateRegex', operateRegex.operateRegex);
api.post('/simulateRegex', operateRegex.simulateChain);
module.exports = api;