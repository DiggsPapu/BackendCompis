var analyzeYalex = require('../controllers/yalex.controller.js');
var express = require('express');
var api = express.Router()
api.post('/analyzeYalex/Ast', analyzeYalex.analyzeYalex);
api.get('/analyzeYalex/DFA', analyzeYalex.getDFA);
api.get('/analyzeYalex/Scanner', analyzeYalex.getScanner);
module.exports = api;