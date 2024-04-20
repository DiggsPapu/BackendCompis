const fs = require('fs');
var Regex = require("./Regex");
var SyntaxTree = require("./SyntaxTree");
var Token = require("./Token");
var { YalexTokens, asciiUniverses} = require("./YalexTokens");
class GenScanner {
    constructor(yalexNFA, regexesData, tokensSet) {
        this.ascii = new asciiUniverses();
        this.scanner = ``;
        // Phase one, pass the definition of nfa and state to this
        this.developScanner(yalexNFA, regexesData, tokensSet);
    }

    async developScanner(yalexNFA, regexesData, tokensSet) {
        try {
          // console.log(regexesData);
          // Append header and trailer
          for (let j = 0; j < tokensSet.get("HEADER").length; j++){
            this.scanner += tokensSet.get("HEADER")[j];
          }
          for (let j = 0; j < tokensSet.get("TRAILER").length; j++){
            this.scanner += tokensSet.get("TRAILER")[j];
          }
          // Rules execution put in stringify
            let keys = Array.from(regexesData.keys());
            let regD = {};
            for (let j = 0; j < keys.length; j++){
              regD[keys[j]] = {"rule":regexesData.get(keys[j])[8], "finalStates":regexesData.get(keys[j])[9]};
            }
            console.log(regD)
            regD = JSON.stringify(regD);
            
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
    // Deserialize the yalex Automathon
    let yalexNFA = ${yalexNFA.serialized};
    // Read the data
    readText(filepath)
    .then(data => {
      // The regex Data
      let regD = ${regD};
      let finalStatesMap = new Map();
      let keys = Object.keys(regD);
      for (let k = 0; k < keys.length; k++){
        let key = keys[k];
        for (let j = 0; j < regD[key]["finalStates"].length; j++){
          finalStatesMap.set(regD[key]["finalStates"][j], key);
        }
      }
      let finalStatesKeys = Array.from( finalStatesMap.keys() );
      // Tokenizer with yalex automathon
      let S = null;
      let accepted = false;
      let indexTemp = 0;
      let token = null;
      yalexNFA = deSerializeAutomathon(yalexNFA);
      for (let k = 0; k < data.length; k++){
        token = null;
        accepted = false;
        S = null;
        [accepted, indexTemp, S] = yalexNFA.yalexSimulate(data, k);
        // If it is accepted eval it
        try{
          if (accepted && finalStatesKeys.filter(element => S.map(state=>state.label).includes(element)).length>0){
            let fState = finalStatesKeys.filter(element => S.map(state=>state.label).includes(element))[0];
            console.log("Token accepted in rule->"+finalStatesMap.get(fState)+": '"+data.slice(k, indexTemp+1)+"'");
            console.log("Evaluating rule:")
            // Get which final State is obtained, we assume the first state in the final states obtained
            evalRule(regD[finalStatesMap.get(fState)]["rule"]);
            k = indexTemp;
          }
          // else show a lexical error
          else{
            throw new Error("Lexical error, unexpected token: \'"+data[k]+"\' regex");
          }
        }
        catch(e){
          console.error(e);
        };
      }
    })
    .catch(err => {
        console.error('Error reading file:', err); // Handle errors
    });        
}
function evalRule(rule){
  console.log(eval(rule));
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
  // Change the path to get the text
tokenize("./texts/texto.txt");
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
        regex = new Regex(`(${this.ascii.MAYUS.join("|")}|${this.ascii.MINUS.join("|")}|${this.ascii.BRACKETS.join("|")}|${this.ascii.NUMBER.join("|")}|${this.ascii.OPERATORS.join("|")}|${this.ascii.TILDES.join("|")}|${this.ascii.ESCAPE_CHARACTERS.join("|")}|${this.ascii.PUNCTUATION.join("|")}|${this.ascii.MATH.join("|")}|${this.ascii.DOUBLE_QUOTES}|{|})+(( )|\n|\r|\t)`);
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
