const fs = require('fs');
const path = require('path');
const multer = require('multer'); 
var YalexAnalyzer = require('../class/YalexAnalyzer.js');
var GenScanner = require('../class/GenScanner.js');
const { graphviz } = require('node-graphviz');
const { drawTreeTokens, drawGraphDFA } = require("./draw.functions.js");

let yalex = null;
let scanner = null;

function analyzeYalex(req, res) {
    try {
        yalex = new YalexAnalyzer(req.body.content);
        graphviz.dot(drawTreeTokens(yalex.ast), 'svg').then((svg) => {
            // Modify the SVG content (change width and height)
            const modifiedSVG = svg.replace(
                /<svg width="([\d.]+)pt" height="([\d.]+)pt"/,
                '<svg width="100%" height="100%"' // Replace with your desired width and height
            );

            // Write the modified SVG content to a file
            fs.writeFileSync('./images/yalexAST.svg', modifiedSVG);

            // Read the modified SVG file
            fs.readFile('./images/yalexAST.svg', 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                // Set the content type to SVG
                res.set('Content-Type', 'image/svg+xml');
                // Send the modified SVG file in the response
                res.send(data);
            });
        });   
    } catch (error) {
        res.status(500).send({message:error});
    }
};

function getDFA(req, res){
    try {
        if (yalex !== null){
            graphviz.dot(drawGraphDFA(yalex.directDFA), 'svg').then((svg) => {
                const modifiedSVG = svg.replace(
                    /<svg width="([\d.]+)pt" height="([\d.]+)pt"/,
                    '<svg width="100%" height="100%"' // Replace with your desired width and height
                );
                fs.writeFileSync('./images/yalexDFA.svg', modifiedSVG);
            });
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
    } catch (error) {
        res.status(500).send({message:error});
    }
}
function getScanner(req, res){
    try {
        if (yalex !== null){
            scanner = new GenScanner(yalex.nfa, yalex.rulesVal, yalex.tokensSet);
            res.download("/root/BackendCompis/Scanner.js", (err) => {
              if (err) {
                console.error('Error downloading file:', err);
                res.status(500).send('Error downloading file.');
              }
            });
        }
        else{
            res.status(500).send(`Haven't created the yalex`);
        }
    } catch (error) {
        res.status(500).send({message:error});
    }
}
module.exports = {
    analyzeYalex,
    getDFA,
    getScanner
}
