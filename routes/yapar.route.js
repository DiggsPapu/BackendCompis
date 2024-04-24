var analyzeYapar = require('../controllers/yapar.controller.js');
var express = require('express');
var api = express.Router()
api.post('/analyzeYapar/postYapar', analyzeYapar.postYapar);
module.exports = api;