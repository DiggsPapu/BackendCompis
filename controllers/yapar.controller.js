const fs = require('fs');
const YalexAnalyzer = require("../class/YalexAnalyzer");
const YaparTokenizer = require("../utils/YaparScanner");

async function postFiles(data){
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
    // Check if the yapar tokens exist in the yalex file tokens
    if (keys.filter(token => tokens.includes(token)).length !== tokens.length){
        throw Error(`Some token is not defined`);
    }
    
};

module.exports = {
    postFiles
}