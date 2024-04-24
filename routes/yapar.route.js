var analyzeYapar = require('../controllers/yapar.controller.js');
var express = require('express');
var api = express.Router()
api.post('/analyzeYapar/getYapar', analyzeYapar.getYapar);
module.exports = api;