var analyzeYalex = require('../controllers/yalex.controller.js');
var express = require('express');
var api = express.Router()
api.post('/analyzeYalex/Ast', analyzeYalex.analyzeYalex);
api.get('/analyzeYalex/DFA', analyzeYalex.getDFA);
module.exports = api;