const YalexAnalyzer = require("../class/YalexAnalyzer");

let yaparDefinition = `
(* HEADER STARTS HERE *)
{
    let tokens = [];
    let inProductionSection = false;
    let ignoreTokens = [];
    let inProductionDefinition = false;
    let productions = new Map();
    let currentProduction = "";
}
let commentary = "/*"(number|mayus|minus|delim|symbols)+"*/"

let number = ['0'-'9']

let mayus = ['A'-'Z']

let minus = ['a'-'z']

let delim = ['\n''\r''\t'' ']

let symbols = ['!'-'@']

let nyterminal = (mayus|minus)(mayus|minus|number|'_')+

let tokenDefinition = '%'"token"((' ')+nyterminal)+

let ignoreToken = "IGNORE"' '+nyterminal

let startProductionSection = "%%"

let productionName = nyterminal' '*':'

let individualProduction = (nyterminal)(delim+(nyterminal))*


rule tokens =
commentary
| tokenDefinition {tokens.push(newToken.replace("%token", "").trim());}
| ignoreToken {ignoreTokens.push(newToken.replace("IGNORE", "").trim());}
| startProductionSection 
{
    if(inProductionSection===false){
        inProductionSection=true
    }
    else{
        throw new Error("Already in production section, so the yapar is invalid because it has multiple production sections.");
    };
}
| productionName 
{
    if(!inProductionDefinition){
        inProductionDefinition = true;
        currentProduction = newToken.replace(":", "").trim();
        productions.set(currentProduction, []);
    }
    else{
        throw new Error("Unexpected a production definition, so the yapar is invalid because the production doesn't have anything.");
    }
}
| individualProduction 
{
    productions.get(currentProduction).push(newToken);
}
| ';'
{
    insideProductionDefinition = false;
}
| '|'
| delim
{

}
(* TRAILER *)
{
    console.log(tokens);
    console.log(ignoreTokens);
    console.log(productions);
}
`

function postYapar(){
    // Obtain the yalex that gets the definition of the yapar
    let yalex = new YalexAnalyzer(yaparDefinition);
    
    // yalex.nfa, yalex.rulesVal, yalex.tokensSet
    // console.log(yalex.nfa);
    // console.log(yalex.rulesVal);
    // console.log(yalex.tokensSet);
}

module.exports = {
    postYapar
}