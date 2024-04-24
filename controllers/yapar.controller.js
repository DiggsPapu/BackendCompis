const YalexAnalyzer = require("../class/YalexAnalyzer");

let yaparDefinition = `let number = ['0'-'9']

let mayus = ['A'-'Z']

let minus = ['a'-'z']

let delim = ['\n''\r''\t']

let symbols = ['!'-'@']

let letter = (minus|mayus)

let simpleQuotes = '''[' '-'Ú']'''

let doubleQuotes = '"'(letter|number)+'"'

let brackets = (simpleQuotes+|doubleQuotes)
(* Sirve para el token name y para los no terminales *)

let noTerminal = letter(letter|'_'|number)+

let terminal = (letter|simpleQuotes|doubleQuotes|brackets|symbols)+

let tokenDefinition = "token"(' ')+terminal(' 'terminal)*delim

let ignoreToken = "IGNORE"' '+terminal

let startProductionSection = "%%"

let productionName = noTerminal' '*':'

let individualProduction = (' '*(noTerminal|terminal))+

let productionBody = individualProduction' '*('|'individualProduction' '+)*';'

let commentary = "/*"(number|letter|delim|symbols)+"*/"

rule tokens =

commentary
| tokenDefinition
| ignoreToken
| startProductionSection
| productionName
| productionBody
| ['\n''\r''\t'' ']
`
function getYapar(){
    let yalex = new YalexAnalyzer(yaparDefinition);
    // yalex.nfa, yalex.rulesVal, yalex.tokensSet
    // console.log(yalex.nfa);
    // console.log(yalex.rulesVal);
    // console.log(yalex.tokensSet);
}
module.exports = {
    getYapar
}