// Controller for the Automatas
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
    // try {
        console.log(req.params);
        const regex_ = new Regex(req.params.input);
        const thompson_ = new ThompsonToken(regex_.postfixTokenized);
        const tokenTree_ = regex_.constructTokenTree();
        const ast_ = new SyntaxTree(tokenTree_[0], tokenTree_[1], regex_, tokenTree_[2]);
        const nfaToDfa_ = NFAToDFA(thompson_.nfa);
        const dfaMinimized_ = minimizeDFA(nfaToDfa_);
        const directDfa_ = ast_.generateDirectDFATokens()
        const directDFAMin_ = minimizeDFA(directDfa_);
        res.status(200).send({
            'NFA':drawGraph(thompson_.nfa), 'NFA_DFA':drawGraphDFA(nfaToDfa_), 
            'NFA_DFA_Min':drawGraphDFA(dfaMinimized_), 'AST':drawTreeTokens(ast_), 
            'DirectDFA':drawGraphDFA(directDfa_), 'DirectDFA_Min':drawGraphDFA(directDFAMin_)
        });
    // }
    // catch{
    //     res.status(500).send({message:'Error in the regex'});
    // };
};
module.exports = {
    operateRegex
};
