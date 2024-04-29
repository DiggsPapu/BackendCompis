const fs = require('fs');
const YalexAnalyzer = require("../class/YalexAnalyzer");
const YaparTokenizer = require("../utils/YaparScanner");
const YaPar = require('../class/YaPar');
const { drawGraphItems } = require('./draw.functions');
const { graphviz } = require('node-graphviz');

async function postFiles(data, res){
    // Analyze a yalex
    let yalexAnalyzer = new YalexAnalyzer(data["body"]["yalex"]);
    // Make a yapar file to tokenize it then
    fs.writeFile("yaparFile.yalp", data["body"]["yapar"], (err) => {
      if (err) {
        console.error('Error writing file:', err);
      } else {
        console.log('File created successfully.');
      }
    });
    // Tokenize the yapar
    let [tokens, ignoreTokens, productions] = await YaparTokenizer.tokenizeYapar("./yaparFile.yalp");
    let keys = Array.from(yalexAnalyzer.rulesSet.keys());
    console.log(tokens)
    console.log(ignoreTokens)
    console.log(productions)
    console.log(keys)
    // Check if the yapar tokens exist in the yalex file tokens
    console.log(tokens.filter(token => !keys.includes(token)));
    if (tokens.filter(token => !keys.includes(token)).length>0){
        throw Error(`Some token is not defined`);
    };
    let yapar = new YaPar(tokens, ignoreTokens, productions);
    console.log(drawGraphItems(yapar.items, yapar.transitions))
    graphviz.dot(drawGraphItems(yapar.items, yapar.transitions), 'svg').then((svg) => {
      // Modify the SVG content (change width and height)
      const modifiedSVG = svg.replace(
          /<svg width="([\d.]+)pt" height="([\d.]+)pt"/,
          '<svg width="100%" height="100%"' // Replace with your desired width and height
      );

      // Write the modified SVG content to a file
      fs.writeFileSync('./images/itemsAutomathon.svg', modifiedSVG);

      // Read the modified SVG file
      fs.readFile('./images/itemsAutomathon.svg', 'utf8', (err, data) => {
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
    
};

module.exports = {
    postFiles
}