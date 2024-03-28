// Controller for the Automatas
const fs = require('fs');
const path = require('path');
const { graphviz } = require('node-graphviz');
const { NFAToDFA, minimizeDFA } = require("../class/DFA");
const {
    drawGraphDFA,
    drawGraph,
    drawTreeTokens,
  } = require("./draw.functions.js");
const Regex = require('../class/Regex');
const ThompsonToken = require('../class/ThompsonToken');
const SyntaxTree = require('../class/SyntaxTree');

function operateRegex(req, res){
    try {
        const regex_ = new Regex(req.params.input);
        regex_.postfixTokenizedToPostfix();
        const thompson_ = new ThompsonToken(regex_.postfixTokenized);
        const tokenTree_ = regex_.constructTokenTree();
        const ast_ = new SyntaxTree(tokenTree_[0], tokenTree_[1], regex_, tokenTree_[2]);
        const nfaToDfa_ = NFAToDFA(thompson_.nfa);
        const dfaMinimized_ = minimizeDFA(nfaToDfa_);
        const directDfa_ = ast_.generateDirectDFATokens()
        const directDFAMin_ = minimizeDFA(directDfa_);
        graphviz.dot(drawGraph(thompson_.nfa), 'svg').then((svg) => {fs.writeFileSync('./images/nfa.svg', svg);});
        graphviz.dot(drawGraphDFA(nfaToDfa_), 'svg').then((svg) => {fs.writeFileSync('./images/nfa_dfa.svg', svg);});
        graphviz.dot(drawGraphDFA(dfaMinimized_), 'svg').then((svg) => {fs.writeFileSync('./images/nfa_dfa_min.svg', svg);});
        graphviz.dot(drawTreeTokens(ast_), 'svg').then((svg) => {fs.writeFileSync('./images/ast.svg', svg);});
        graphviz.dot(drawGraphDFA(directDfa_), 'svg').then((svg) => {fs.writeFileSync('./images/direct_dfa.svg', svg);});
        graphviz.dot(drawGraphDFA(directDFAMin_), 'svg').then((svg) => {fs.writeFileSync('./images/direct_dfa_min.svg', svg);});
        // Read the image file
        const nfaImage = fs.readFileSync('./images/nfa.svg');
        const nfa_dfaImage = fs.readFileSync('./images/nfa_dfa.svg');
        const nfa_dfa_minImage = fs.readFileSync('./images/nfa_dfa_min.svg');
        const astImage = fs.readFileSync('./images/ast.svg');
        const direct_dfaImage = fs.readFileSync('./images/direct_dfa.svg');
        const direct_dfa_minImage = fs.readFileSync('./images/direct_dfa.svg');
        fs.readFile('./images/nfa.svg', 'utf8', (err, data) => {
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
        fs.readFile('./images/nfa_dfa.svg', 'utf8', (err, data) => {
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
        // res.status(200).send({
        //     'Postfix':regex_.postfix,
        //     'NFA':nfaImage, 
        //     'NFA_DFA':nfa_dfaImage, 
        //     'NFA_DFA_Min':nfa_dfa_minImage,
        //     'AST':astImage,
        //     'DirectDFA':direct_dfaImage, 
        //     'DirectDFA_Min':direct_dfa_minImage
        // });
        // res.status(200).send({
        //     'NFA':path.join(__dirname, 'images', 'nfa.svg'), 'NFA_DFA':drawGraphDFA(nfaToDfa_), 
        //     'NFA_DFA_Min':drawGraphDFA(dfaMinimized_), 'AST':drawTreeTokens(ast_), 
        //     'DirectDFA':drawGraphDFA(directDfa_), 'DirectDFA_Min':drawGraphDFA(directDFAMin_)
        // });
    }
    catch{
        res.status(500).send({message:'Error in the regex'});
    };
};
module.exports = {
    operateRegex
};
