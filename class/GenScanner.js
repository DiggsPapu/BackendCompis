const fs = require('fs');
var Regex = require("./Regex");
var SyntaxTree = require("./SyntaxTree");
var Token = require("./Token");
var { YalexTokens, asciiUniverses} = require("./YalexTokens");
class GenScanner {
    constructor(yalexNFA, regexesData) {
        this.ascii = new asciiUniverses();
        this.scanner = ``;
        yalexNFA.serializeAutomathon();
        console.log(yalexNFA.deSerializeAutomathon(yalexNFA.serialized));
        console.log(yalexNFA);
        // this.nfa = JSON.stringify(yalexNFA);
        // this.regexes = JSON.stringify(regexesData);
        // this.scanner+=this.nfa;
        // this.scanner+=this.regexes;
        // Phase one, pass the definition of nfa and state to this
        this.developScanner();
        // Phase two enter the two automathon, the first one will help to tokenize the txt, and the second one will help 4 the token detection
        
        // Phase three enter the regex data
    }

    async developScanner() {
        try {
            // Get the imports
            this.scanner+="const fs = require('fs');\n"
            const stateData = await this.readFileAsync('./class/State.js');
            this.scanner += "\n" + stateData;
            const nfaData = await this.readFileAsync('./class/NFA.js');
            this.scanner += "\n" + nfaData;
            this.scanner = this.scanner.replace(/(const|let|var) +.+ += *require\(.+?\)/g, '');
            this.scanner = this.scanner.replace(/module\.exports\s*=\s*.*/g, '');
            // Get the tokenizer
            this.getTokenizer();
            // Serialized automathons, tokenizer and the lexical analyzer
            // delimDFA.serializeAutomathon();
            // yalexNFA.serializeAutomathon();
            // console.log(this.scanner);
            let data = ```
            function readText(filepath){
                // Read the data
                let data = readFileAsync(filePath);

            }
            function readFileAsync(filePath) {
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
            ```
            
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
        // console.log(`(${this.ascii.MAYUS.join("|")}|${this.ascii.MINUS.join("|")}|${this.ascii.BRACKETS.join("|")}|${this.ascii.NUMBER.join("|")}|\"|\'|${this.ascii.OPERATORS.join("|")}|${this.ascii.TILDES.join("|")}|${this.ascii.ESCAPE_CHARACTERS.join("|")}|${this.ascii.PUNCTUATION.join("|")}|${this.ascii.MATH.join("|")}|{|})+`);
        regex = new Regex(`(${this.ascii.MAYUS.join("|")}|${this.ascii.MINUS.join("|")}|${this.ascii.BRACKETS.join("|")}|${this.ascii.NUMBER.join("|")}|\"|\'|${this.ascii.OPERATORS.join("|")}|${this.ascii.TILDES.join("|")}|${this.ascii.ESCAPE_CHARACTERS.join("|")}|${this.ascii.PUNCTUATION.join("|")}|${this.ascii.MATH.join("|")}|{|})+`);
        tokenTree = regex.constructTokenTree();
        ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
        let anythingElse = ast.generateDirectDFATokens();
        // console.log(delimDFA.states.length);
        // console.log(anythingElse);
        
        anythingElse.changeStates(delimDFA.states.length);
        // console.log(anythingElse);
        delimDFA.addDFA(anythingElse);
        // console.log(delimDFA);
        // Serialize the automathon to get into json
        delimDFA.serializeAutomathon();
    }

}

module.exports = GenScanner;
