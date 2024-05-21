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
let regex_ = null;
let thompson_ = null;
let tokenTree_ = null;
let ast_ = null;
let nfaToDfa_ = null;
let dfaMinimized_ = null;
let directDfa_ = null;
let directDFAMin_ = null;

function operateRegex(req, res){
    try {
        regex_ = new Regex(req.body.input);
        regex_.postfixTokenizedToPostfix();
        thompson_ = new ThompsonToken(regex_.postfixTokenized);
        tokenTree_ = regex_.constructTokenTree();
        ast_ = new SyntaxTree(tokenTree_[0], tokenTree_[1], regex_, tokenTree_[2]);
        nfaToDfa_ = NFAToDFA(thompson_.nfa);
        dfaMinimized_ = minimizeDFA(nfaToDfa_);
        directDfa_ = ast_.generateDirectDFATokens()
        directDFAMin_ = minimizeDFA(directDfa_);
        // Send the dot file to show it in an graphviz component
        res.status(200).send({
            'Postfix':regex_.postfix,
            'NFA':drawGraph(thompson_.nfa), 'NFA_DFA':drawGraphDFA(nfaToDfa_), 
            'NFA_DFA_Min':drawGraphDFA(dfaMinimized_), 'AST':drawTreeTokens(ast_), 
            'DirectDFA':drawGraphDFA(directDfa_), 'DirectDFA_Min':drawGraphDFA(directDFAMin_)
        });
    }
    catch{
        res.status(500).send({message:'Error in the regex'});
    };
};
function takeTime(nfa, input){
    let bool = false;
    let startTime = performance.now();
    bool = nfa.simulate(input);
    startTime=performance.now().toFixed(30) - startTime;
    return [bool, startTime];
}
function simulateChain(req, res){
    try {
        if (regex_ !== null){
            res.status(200).send({
                'NFA':takeTime(thompson_.nfa, req.body.input),
                'NFA_DFA':takeTime(nfaToDfa_, req.body.input), 
                'NFA_DFA_Min':takeTime(dfaMinimized_, req.body.input), 
                'DirectDFA':takeTime(directDfa_, req.body.input), 
                'DirectDFA_Min':takeTime(directDFAMin_, req.body.input)
            }); 
        }
        else {
            res.status(500).send({message:`Haven't initialize a regex to evaluate`})
        }   
    } catch (error) {
        res.status(500).send({message:error});
    }   
}
module.exports = {
    operateRegex,
    simulateChain
};
