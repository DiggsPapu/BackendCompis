var analyzeYapar = require('../controllers/yapar.controller.js');
var express = require('express');
var api = express.Router()
api.post('/analyzeYapar/postFiles', analyzeYapar.postFiles);
api.post('/analyzeYapar/evaluateChain', analyzeYapar.evaluateChain)
module.exports = api;