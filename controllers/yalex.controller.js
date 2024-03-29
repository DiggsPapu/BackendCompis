var YalexAnalyzer = require('../class/YalexAnalyzer.js');
let yalex = null;
function analyzeYalex(req, res){
    yalex = new YalexAnalyzer(req.body.content);
    
};
