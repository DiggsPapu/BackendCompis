const fs = require('fs');
var Regex = require("./Regex");
var SyntaxTree = require("./SyntaxTree");
var Token = require("./Token");
var { YalexTokens, asciiUniverses} = require("./YalexTokens");
class GenScanner {
    constructor(yalexNFA, regexesData) {
        this.ascii = new asciiUniverses();
        this.newFile = ``;
        // this.nfa = JSON.stringify(yalexNFA);
        // this.regexes = JSON.stringify(regexesData);
        // this.newFile+=this.nfa;
        // this.newFile+=this.regexes;
        // Phase one, pass the definition of nfa and state to this
        this.imports();
        this.getTokenizer()
        // Phase two enter the two automathon, the first one will help to tokenize the txt, and the second one will help 4 the token detection
        
        // Phase three enter the regex data
    }

    async imports() {
        try {
            const stateData = await this.readFileAsync('./class/State.js');
            this.newFile += "\n" + stateData;
            const nfaData = await this.readFileAsync('./class/NFA.js');
            this.newFile += "\n" + nfaData;
            this.newFile = this.newFile.replace(/(const|let|var) +.+ += *require\(.+?\)/g, '');
            this.newFile = this.newFile.replace(/module\.exports\s*=\s*.*/g, '');
            // console.log(this.newFile);
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
        console.log(delimDFA.states.length);
        console.log(anythingElse);
        
        anythingElse.changeStates(delimDFA.states.length);
        console.log(anythingElse);
        delimDFA.addDFA(anythingElse);
        console.log(delimDFA)
    }

}

module.exports = GenScanner;
