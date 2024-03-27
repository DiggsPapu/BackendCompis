var operateRegex = require('../controllers/automaton.controller.js');
var express = require('express');
var api = express.Router()
api.post('/operateRegex:input', operateRegex.operateRegex);
module.exports = api;