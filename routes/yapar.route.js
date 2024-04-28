var analyzeYapar = require('../controllers/yapar.controller.js');
var express = require('express');
var api = express.Router()
api.post('/analyzeYapar/postFiles', analyzeYapar.postFiles);
module.exports = api;