const fs = require('fs');
const YalexAnalyzer = require("../class/YalexAnalyzer");
const YaparTokenizer = require("../utils/YaparScanner");
var GenScanner = require('../class/GenScanner.js');
const YaPar = require('../class/YaPar');
const { drawGraphItems, createParsingTableLL, createParsingTableSLR } = require('./draw.functions');
const { graphviz } = require('node-graphviz');
const NFA = require('../class/NFA.js');
let yapar = null;
let yalexAnalyzer = null;
let scanner = null; 
async function postFiles(data, res){
  try {
    // Analyze a yalex
    yalexAnalyzer = new YalexAnalyzer(data["body"]["yalex"]);
    // scanner = new GenScanner(yalexAnalyzer.nfa, yalexAnalyzer.rulesVal, yalexAnalyzer.tokensSet);
    // Make a yapar file to tokenize it then
    fs.writeFile("yaparFile.yalp", data["body"]["yapar"], (err) => {});
    // Tokenize the yapar
    let [tokens, ignoreTokens, productions] = await YaparTokenizer.tokenizeYapar("./yaparFile.yalp");
    let keys = Array.from(yalexAnalyzer.rulesSet.keys());
    console.log(tokens)
    console.log(ignoreTokens)
    console.log(productions)
    // console.log(keys)
    // Check if the yapar tokens exist in the yalex file tokens
    console.log(tokens.filter(token => !keys.includes(token)));
    if (tokens.filter(token => !keys.includes(token)).length>0){
        throw Error(`Some token is not defined`);
    };
    yapar = new YaPar(tokens, ignoreTokens, productions);
    // console.log(drawGraphItems(yapar.items, yapar.transitions))
    graphviz.dot(drawGraphItems(yapar.items, yapar.transitions, yapar.finalState), 'svg').then((svg) => {
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
  } catch (error) {
    res.status(500).send({message:error});
  }
};
async function getParsingTableSLR(data, res){
  try {
    graphviz.dot(createParsingTableSLR(yapar.tokens, yapar.noTerminals, yapar.actionTable, yapar.goToTable), 'svg').then((svg) => {
      // Modify the SVG content (change width and height)
      const modifiedSVG = svg.replace(
          /<svg width="([\d.]+)pt" height="([\d.]+)pt"/,
          '<svg width="100%" height="100%"' // Replace with your desired width and height
      );
  
      // Write the modified SVG content to a file
      fs.writeFileSync('./images/parsingTable.svg', modifiedSVG);
      // Read the modified SVG file
      fs.readFile('./images/parsingTable.svg', 'utf8', (err, data) => {
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
    console.log(error);
    res.status(500).send({message:error});
  }
};

async function getParsingTableLL(data, res){
  try {
    graphviz.dot(createParsingTableLL(yapar.tokens, yapar.noTerminals, yapar.parsingTableLL), 'svg').then((svg) => {
      // Modify the SVG content (change width and height)
      const modifiedSVG = svg.replace(
          /<svg width="([\d.]+)pt" height="([\d.]+)pt"/,
          '<svg width="100%" height="100%"' // Replace with your desired width and height
      );
  
      // Write the modified SVG content to a file
      fs.writeFileSync('./images/parsingTable.svg', modifiedSVG);
      // Read the modified SVG file
      fs.readFile('./images/parsingTable.svg', 'utf8', (err, data) => {
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
    console.log(error);
    res.status(500).send({message:error});
  }
};
async function evaluateChain(data, res){
  let input = data["body"]["input"];
  let tokens = [];
  let tokensTok = [];
  let accepted = null;
  let S = null;
  let indexTemp = 0;
  // yapar.
  yalexAnalyzer.nfa.serializeAutomathon();
  // To avoid strings
  let nfa = yalexAnalyzer.nfa.deSerializeAutomathon(yalexAnalyzer.nfa.serialized);
  let keys = Array.from(yalexAnalyzer.rulesVal.keys());
  for (let k = 0; k < input.length; k++){
    accepted = false;
    S = null;
    [accepted, indexTemp, S] = nfa.yalexSimulate(input, k);
    // If it is accepted eval it
    try{
      let values = [];
      let possibleTok = null;
      keys.map((key)=>{
        let longitude = values.length;
        values.push(...yalexAnalyzer.rulesVal.get(key)[9].filter(element => S.map(state=>state.label).includes(element)));
        if (longitude!==values.length && possibleTok===null){possibleTok=key;tokensTok.push(key)};
      });
      if (accepted && values.length>0){
        let newToken = input.slice(k, indexTemp+1);
        tokens.push(newToken);
        k = indexTemp;
      }
      // else show a lexical error
      else{
        tokens.push(undefined);
        tokensTok.push(undefined);
        console.log("Lexical error, unexpected token: \'"+input.slice(k, k+10)+"\' regex");
      }
    }
    catch(e){
      console.error(e);
    };
  };
  let response = yapar.parsingAlgorithm(tokensTok);
  res.status(200).send(response);
}
module.exports = {
    postFiles,
    getParsingTableSLR,
    getParsingTableLL,
    evaluateChain
}