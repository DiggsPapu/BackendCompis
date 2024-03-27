// Controller for the Automatas
const fs = require('fs');
const regex = require('../class/Regex');
const thompson = require('../class/ThompsonToken');
const syntaxTree = require('../class/SyntaxTree');
const { NFAToDFA, minimizeDFA } = require("./DFA");
const {
    drawGraphDFA,
    drawGraph,
    drawTreeTokens,
  } = require("./drawFunctions");

function operateRegex(input, res){
    try {
        const regex_ = regex.Regex(input);
        const thompson_ = thompson.ThompsonToken(regex_.postfixTokenized);
        const tokenTree_ = regex_.constructTokenTree();
        const ast_ = syntaxTree.SyntaxTree(tokenTree_[0], tokenTree_[1], regex_, tokenTree_[2]);
        const nfaToDfa_ = NFAToDFA(thompson_.nfa);
        const dfaMinimized_ = minimizeDFA(nfaToDfa_);
        const directDfa_ = ast_.generateDirectDFATokens()
        const directDFAMin_ = minimizeDFA(directDfa_);
        const graphDots = [
            drawGraph(thompson_.nfa), drawGraphDFA(nfaToDfa_), 
            drawGraphDFA(directDFAMin_), drawGraphDFA(dfaMinimized_),
            drawGraphDFA(dfaMinimized_), drawTreeTokens(ast_),
            drawGraphDFA(directDfa_), drawGraphDFA(directDFAMin_)
        ]
        res.status(200).send({
            'NFA':drawGraph(thompson_.nfa), 'NFA_DFA':drawGraphDFA(nfaToDfa_), 
            'NFA_DFA_Min':drawGraphDFA(dfaMinimized_), 'AST':drawTreeTokens(ast_), 
            'DirectDFA':drawGraphDFA(directDfa_), 'DirectDFA_Min':drawGraphDFA(directDFAMin_)
        });
    }
    catch{
        res.status(500).send({message:'Error in the regex'});
    };
};
module.exports = {
    operateRegex
};
