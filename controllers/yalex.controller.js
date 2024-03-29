const fs = require('fs');
var YalexAnalyzer = require('../class/YalexAnalyzer.js');
const { graphviz } = require('node-graphviz');
const { drawTreeTokens, drawGraphDFA } = require("./draw.functions.js");

let yalex = null;
function analyzeYalex(req, res){
    yalex = new YalexAnalyzer(req.body.content);
    graphviz.dot(drawTreeTokens(yalex.ast), 'svg').then((svg) => {fs.writeFileSync('./images/yalexAST.svg', svg);});
    // Send the tree as svg
    fs.readFile('./images/yalexAST.svg', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Set the content type to SVG
        res.set('Content-Type', 'image/svg+xml');
        // Send the SVG file in the response
        res.send(data);
    });
};
function getDFA(req, res){
    if (yalex !== null){
        graphviz.dot(drawGraphDFA(yalex.directDFA), 'svg').then((svg) => {fs.writeFileSync('./images/yalexDFA.svg', svg);});
        // Send the dfa as svg
        fs.readFile('images/yalexDFA.svg', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
                return;
            };
            // Set the content type to SVG
            res.set('Content-Type', 'image/svg+xml');
            // Send the SVG file in the response
            res.send(data);
        });
    }
}
module.exports = {
    analyzeYalex,
    getDFA
}
