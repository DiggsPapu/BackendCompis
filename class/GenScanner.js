const fs = require('fs');
var Regex = require("./Regex");
var SyntaxTree = require("./SyntaxTree");
var Token = require("./Token");
var { YalexTokens, asciiUniverses} = require("./YalexTokens");
class GenScanner {
    constructor(yalexNFA, regexesData) {
        this.ascii = new asciiUniverses();
        this.scanner = ``;
        // this.nfa = JSON.stringify(yalexNFA);
        // this.regexes = JSON.stringify(regexesData);
        // this.scanner+=this.nfa;
        // this.scanner+=this.regexes;
        // Phase one, pass the definition of nfa and state to this
        this.developScanner(yalexNFA);
        // Phase two enter the two automathon, the first one will help to tokenize the txt, and the second one will help 4 the token detection
        
        // Phase three enter the regex data
    }

    async developScanner(yalexNFA) {
        try {
            // Get the imports
            const stateData = await this.readFileAsync('./class/State.js');
            this.scanner += "\n" + stateData;
            const nfaData = await this.readFileAsync('./class/NFA.js');
            this.scanner += "\n" + nfaData;
            this.scanner = this.scanner.replace(/(const|let|var) +.+ += *require\(.+?\)/g, '');
            this.scanner = this.scanner.replace(/module\.exports\s*=\s*.*/g, '');
            // Serialized automathons, tokenizer and the lexical analyzer
            let tokenizerA = this.getTokenizer();
            yalexNFA.serializeAutomathon();
            // console.log(this.scanner);
            let data = `
const fs = require('fs');
function tokenize(filepath){
    // Deserialize the tokenizer Automathon
    let tokenizerNFA = ${tokenizerA[0]};
    // Deserialize the yalex Automathon
    let yalexNFA = ${yalexNFA.serialized};
    // Final States Tokenizer
    let finalStatesT = ${tokenizerA[1]};
    console.log(finalStatesT);
    // Read the data
    readText(filepath)
    .then(data => {
        tokenizerNFA = deSerializeAutomathon(tokenizerNFA);
        console.log(tokenizerNFA);
    })
    .catch(err => {
        console.error('Error reading file:', err); // Handle errors
    });   
           
}
function deSerializeAutomathon(parsedSerializeAutomathon){
  let alphabet = parsedSerializeAutomathon["alphabet"];
  let states = [];
  let finalStates = [];
  let initialState = null;
  let keysFinalStates = Object.keys(parsedSerializeAutomathon["finalStates"]);
  let newTransitions = new Map();
  for (let stateName in parsedSerializeAutomathon.states){
    let transitions = new Map();
    // Get the transitions
    for (let key in parsedSerializeAutomathon["states"][stateName]){
      transitions.set(key, parsedSerializeAutomathon["states"][stateName][key]);
    }
    let newState = new State(stateName, transitions);
    states.push(newState);
    // Get initial state
    if (stateName === parsedSerializeAutomathon["initialState"]["name"]){
      initialState = newState;
    }
    // Check if is final state
    if (keysFinalStates.includes(stateName)){
      finalStates.push(newState);
    }
    newTransitions.set(stateName, transitions);
  }
  return new NFA(initialState, finalStates, states, alphabet, newTransitions);
};
function readText(filepath) {
    return new Promise((resolve, reject) => {
      // Read the data
      fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) {
          reject(err); // Pass error to reject handler
          return;
        }
        resolve(data); // Pass data to resolve handler
      });
    });
  };
tokenize("texto.txt");
`;
            this.scanner += data;
            // Generate the scanner
            fs.writeFile("Scanner.js", this.scanner, (err) => {
                if (err) {
                  console.error('Error writing file:', err);
                } else {
                  console.log('File created successfully.');
                }
              });
            
        } catch (error) {
            console.error('Error reading file:', error);
        }
    }

    // Helper function to read a file asynchronously and return a Promise
    readFileAsync(filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
        });
    };

    // Create the afn that will get tokenize
    getTokenizer(){
        // Detects anything that is space, enter or tab
        let regex = new Regex("(( )|\n|\r|\t)+");
        let tokenTree = regex.constructTokenTree();
        let ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
        let delimDFA = ast.generateDirectDFATokens();
        // Detects anything else
        regex = new Regex(`(${this.ascii.MAYUS.join("|")}|${this.ascii.MINUS.join("|")}|${this.ascii.BRACKETS.join("|")}|${this.ascii.NUMBER.join("|")}|\"|\'|${this.ascii.OPERATORS.join("|")}|${this.ascii.TILDES.join("|")}|${this.ascii.ESCAPE_CHARACTERS.join("|")}|${this.ascii.PUNCTUATION.join("|")}|${this.ascii.MATH.join("|")}|{|})+(( )|\n|\r|\t)`);
        tokenTree = regex.constructTokenTree();
        ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
        let anythingElse = ast.generateDirectDFATokens();
        let delimFinalStates = [];
        for (let k = 0; k < delimDFA.finalState.length; k++){
            delimFinalStates.push(delimDFA.finalState[k].label);
        }
        anythingElse.changeStates(delimDFA.states.length);
        let anythingElseFinalStates = []
        for (let k = 0; k < anythingElse.finalState.length; k++){
            anythingElseFinalStates.push(anythingElse.finalState[k].label);
        }
        anythingElse.serializeAutomathon();
        // console.log(anythingElse);
        delimDFA.addDFA(anythingElse);
        // console.log(delimDFA);
        // Serialize the automathon to get into json
        delimDFA.serializeAutomathon();
        let finalStates = {"delim":delimFinalStates, "anythingElse":anythingElseFinalStates};
        return [delimDFA.serialized, JSON.stringify(finalStates)];
    }

}

module.exports = GenScanner;
