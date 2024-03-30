var Regex = require("./Regex");
var SyntaxTree = require("./SyntaxTree");
var Token = require("./Token");
var { YalexTokens, asciiUniverses} = require("./YalexTokens");
class YalexAnalyzer{
    constructor(data){
        this.ascii = new asciiUniverses();
        this.regex = null;
        this.tokenTree = null;
        this.ast = null;
        this.loadAfdCheckers();
        this.readFile(data);
        // console.log(this.tokensSet);
        // console.log(this.rulesSet);
        this.createBigTree();
    };
    loadAfdCheckers(){
      // AFD FOR THE COMMENTARIES
      let regex = new Regex("\\(\\* *("+YalexTokens.TILDES+"|"+YalexTokens.CHARACTER+"|"+YalexTokens.NUMBER+"| |\n|\t|\\.|\\+|\\||\\*|,|\\.|-)*( )*\\*\\)");    
      let tokenTree = regex.constructTokenTree();
      let ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.commentaryDFA = ast.generateDirectDFATokens();
      // AFD FOR THE DELIMETERS
      regex = new Regex("(( )|\n|\r|\t)+");
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.delimDFA = ast.generateDirectDFATokens();
      // AFD FOR THE HEADER
      regex = new Regex(this.ascii.HEADER);
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.headerDFA = ast.generateDirectDFATokens();
      // AFD'S FOR THE DEFINITION
      // Let +
      regex = new Regex("let +");
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.letDFA = ast.generateDirectDFATokens();
      //  definition_name afd
      regex = new Regex(" *("+YalexTokens.CHARACTER+")("+YalexTokens.CHARACTER+"|"+YalexTokens.NUMBER+"|_)* *=");
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.definitionNameDFA = ast.generateDirectDFATokens();
      // definition definition afd
      regex = new Regex(this.ascii.DEFINITION_DEFINITION);
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.definitionDefinitionDFA = ast.generateDirectDFATokens();
      // AFD FOR THE RULES
      regex = new Regex("( )*rule tokens( )*=")
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.startRuleDFA = ast.generateDirectDFATokens();
      // rule name
      regex = new Regex(this.ascii.DEFINITION_DEFINITION);
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.ruleNameDFA = ast.generateDirectDFATokens();
      // rule body
      regex = new Regex(`{(${this.ascii.MAYUS.join("|")}|${this.ascii.MINUS.join("|")}|${this.ascii.BRACKETS.join("|")}|${this.ascii.NUMBER.join("|")}|\"|\'|${this.ascii.OPERATORS.join("|")}|${this.ascii.TILDES.join("|")}|${this.ascii.ESCAPE_CHARACTERS.join("|")}|${this.ascii.PUNCTUATION.join("|")}|${this.ascii.MATH.join("|")}|\n|\t|\r| )+}`)
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.ruleBodyDFA = ast.generateDirectDFATokens();
      // console.log(this.ruleBodyDFA)
    };
    // Use an async function to wait for the data
    readFile(data) {
      let isCommentary = false;
      let isDelim = false;
      let isHeader = false;
      let isLet = false;
      let startRuleSection = false;
      let indexComentary = 0;
      let indexDelim = 0;
      let indexHeader = 0;
      let indexLet = 0;
      let indexStartRule = 0;
      this.tokensSet = new Map();
      this.tokensSet.set("COMMENTARY", []);
      this.tokensSet.set("DELIMITERS", []);
      this.tokensSet.set("HEADER", []);
      this.tokensSet.set("TRAILER", []);
      this.rulesSet = new Map();
      let S = null;
      // Handle EOF
      data+="\n";
      let i = 0;
      for (i; i<data.length; i++){
        [isCommentary, indexComentary, S] = this.commentaryDFA.yalexSimulate(data, i);
        [isDelim, indexDelim, S] = this.delimDFA.yalexSimulate(data, i);
        // console.log("start header:")
        [isHeader, indexHeader, S] = this.headerDFA.yalexSimulate(data, i);
        [isLet, indexLet, S] = this.letDFA.yalexSimulate(data, i);
        [startRuleSection, indexStartRule, S] = this.startRuleDFA.yalexSimulate(data, i);
        // It is a space or some kinda symbol
        if (isDelim){
          // console.log("isDelim");
          i = indexDelim;
          if (!(this.tokensSet.get("DELIMITERS").includes(data[i]))) {
            this.tokensSet.get("DELIMITERS").push(data[i]);
          };
        }
        // It is a commentary, it is ignored
        else if (isCommentary){
          // console.log("isComment");
          i = indexComentary;
          let definition = "";
          while (!(data[indexComentary]==="(" && data[indexComentary+1]==="*")){
            definition=data[indexComentary]+definition
            indexComentary--;
          }
          definition=data[indexComentary]+definition;
          this.tokensSet.get("COMMENTARY").push(definition);
        }
        else if (isHeader){
          this.tokensSet.get("HEADER").push(data.slice(i, indexHeader+1));
          i = indexHeader+1;
        }
        else if (isLet){
          i = indexLet;
          // console.log(`indexLet:${indexLet}->${data[indexLet]}`);
          // console.log(data[indexLet+1])
          // If is definition, erase the spaces and the = symbols
          let tokenName = "";
          let isDefinitionName = false;
          let indexDefinitionName = indexLet;
          [isDefinitionName, indexDefinitionName, S] = this.definitionNameDFA.yalexSimulate(data, indexLet);
          // console.log(`indexLet:${indexDefinitionName}->${data[indexDefinitionName]}`);
          // console.log(data[indexDefinitionName])
          // console.log(isDefinitionName)
          // console.log(S)
          i = indexDefinitionName;
          if (isDefinitionName){
            while (data[indexDefinitionName]==="="||data[indexDefinitionName]===" "||data[indexDefinitionName]==="["){
              indexDefinitionName--;
            }
            while (data[indexDefinitionName]!==" "){
              tokenName = data[indexDefinitionName]+tokenName;
              indexDefinitionName--;
            }
            // A new set is created
            if (!this.tokensSet.has(tokenName)){
              this.tokensSet.set(tokenName, []);
            }
            else {
              throw Error(`The token ${tokenName} has already been defined`);
            }
            let isDefinitionDefinition = false;
            let indexDefinitionDefinition = 0;
            // For passing =
            i++;
            // console.log(`Start definition ${data[i]}${data[i+1]}${data[i+2]}${data[i+3]}${data[i+4]}`);
            // console.log(this.definitionDefinitionDFA);      
            [isDefinitionDefinition, indexDefinitionDefinition, S] = this.definitionDefinitionDFA.yalexSimulate(data, i);
            // console.log(this.definitionDefinitionDFA);
            i = indexDefinitionDefinition;
            if (isDefinitionDefinition){
              let definition = ""
              // console.log(data[indexDefinitionDefinition])
              while (data[indexDefinitionDefinition-1]!=="="){
                definition=data[indexDefinitionDefinition]+definition
                indexDefinitionDefinition--;
                // console.log(data[indexDefinitionDefinition])
              }
              definition=data[indexDefinitionDefinition]+definition;
              definition = definition.trim();
              if (!(this.tokensSet.get(tokenName).includes(definition))) {
                this.tokensSet.get(tokenName).push(definition);
              };
            }
            else {
              throw Error(`Sintax error in position ${i}, character ${data[i]}, expected a definition for the let definition_name`);
            }
            // console.log(data[i]);
          }
          else {
            throw Error(`Sintax error in position ${i}, character ${data[i]} something is not right in the let definition`);
          }              
        }
        // From this point to what is left it will proceed processing
        // the rest of the file because we can't return to let section over here
        else if (startRuleSection){
          // console.log("START RULE SECTION 1ST")
          let isRuleName = false;
          let indexRuleName = 0;
          let isRuleBody = false;
          let indexRuleBody = 0;
          let insideRuleDefinition = false;
          let ruleName = null;
          let canStartNewRuleSection = false;
          isHeader = false;
          // The +1 its bc is in = position
          for (i=indexStartRule+1; i < data.length; i++){
            [isCommentary, indexComentary, S] = this.commentaryDFA.yalexSimulate(data, i);
            [isDelim, indexDelim, S] = this.delimDFA.yalexSimulate(data, i);
            [isRuleName, indexRuleName, S] = this.ruleNameDFA.yalexSimulate(data, i);
            // console.log("tryRuleBody");
            [isRuleBody, indexRuleBody, S] = this.ruleBodyDFA.yalexSimulate(data, i);
            [isHeader, indexHeader, S] = this.headerDFA.yalexSimulate(data, i);
            // It is a space or some kinda symbol
            if (isDelim){
              // console.log("isDelim");
              i = indexDelim;
              if (!(this.tokensSet.get("DELIMITERS").includes(data[i]))) {
                this.tokensSet.get("DELIMITERS").push(data[i]);
              };
            }
            // It is a commentary, it is ignored
            else if (isCommentary){
              // console.log("isComment");
              i = indexComentary;
              let definition = "";
              while (!(data[indexComentary]==="(" && data[indexComentary+1]==="*")){
                definition=data[indexComentary]+definition
                indexComentary--;
              }
              definition=data[indexComentary]+definition;
              this.tokensSet.get("COMMENTARY").push(definition);
            }
            // Another rule section starts so this is the only way to change the rule name back to null and set false
            else if (data[i]==="|" && canStartNewRuleSection) {
              // console.log("START ANOTHER RULE SECTION!!!!")
              // console.log(data.slice(i, data.length - 1));
              insideRuleDefinition = false;
              ruleName = null;
              canStartNewRuleSection = false;
            }
            // It is a rule name and should not be inside a rule definition
            else if (isRuleName && !insideRuleDefinition) {
              ruleName = data.slice(i, indexRuleName);
              // console.log("RULENAME");
              // console.log(insideRuleDefinition);
              i = indexRuleName;
              insideRuleDefinition = true;
              // ruleName = null;
              
              // indexRuleName--;
              // while (data[indexRuleName]!==" ") {
              //   ruleName = data[indexRuleName] + ruleName;
              //   indexRuleName--;
              // }
              // A new set is created
              if (!this.rulesSet.has(ruleName)){
                this.rulesSet.set(ruleName.trim(), "");
              }
              // Here i must create a error if already has a ruleName
              else{
                throw Error(`Invalid yalex in position ${i}, character ${data[i]}, the rule ${ruleName} already has a return value`);
              }
              canStartNewRuleSection = true;
            }
            // Is a rule body, must be inside a rule definition and rule name must not be null
            else if (isRuleBody && insideRuleDefinition && ruleName !== null) {
              let startIndex = i+1;
              // console.log("RULEBODY");
              i = indexRuleBody;
              let return_ = data.slice(startIndex, indexRuleBody-1);
              // Must have just one return so it must be empty
              if (this.rulesSet.get(ruleName)===""){
                this.rulesSet.set(ruleName,return_.trim());
              }
              // Any other type doesn't belong and it is treated as an error
              else{
                throw Error(`Invalid yalex in position ${i}, character ${data[i]}`);
              };
              // Here I gotta create an error handling
            }
            else if (isHeader && canStartNewRuleSection){
              this.tokensSet.get("TRAILER").push(data.slice(i, indexHeader+1));
              i = indexHeader+1;
            }
            else{
              throw Error(`Invalid yalex in position ${i}, character ${data[i]}`);
            }
          }
        }
        // Any other type doesn't belong and it is treated as an error
        else{
          throw Error(`Invalid yalex in position ${i}, character ${data[i]}`);
        }
      }
      // console.log(this.tokensSet)
      console.log(this.rulesSet);
      let keys = Array.from(this.tokensSet.keys());
      // console.log(keys)
      // REPLACE ALL ESCAPED VALUES
      for (let i = 4; i < keys.length; i++) {
        for (let j = 0; j < this.tokensSet.get(keys[i])[0].length; j++){
          if (this.tokensSet.get(keys[i])[0][j-1] === "\\" && 
          (this.tokensSet.get(keys[i])[0][j] === "n"||this.tokensSet.get(keys[i])[0][j] === "t"||this.tokensSet.get(keys[i])[0][i] === "r"||this.tokensSet.get(keys[i])[0][j] === "b"||this.tokensSet.get(keys[i])[0][j] === "f")){
            this.tokensSet.get(keys[i])[0] = this.tokensSet.get(keys[i])[0].replace("\\n", "\n");
            this.tokensSet.get(keys[i])[0] = this.tokensSet.get(keys[i])[0].replace("\\t", "\t");
            this.tokensSet.get(keys[i])[0] = this.tokensSet.get(keys[i])[0].replace("\\r", "\r");
            this.tokensSet.get(keys[i])[0] = this.tokensSet.get(keys[i])[0].replace("\\b", "\b");
            this.tokensSet.get(keys[i])[0] = this.tokensSet.get(keys[i])[0].replace("\\f", "\f");
            this.tokensSet.get(keys[i])[0] = this.tokensSet.get(keys[i])[0].replace("\\s", "\s");
          };
        };
      };
      console.log(this.tokensSet);
  };
  createBigTree(){
    this.eliminateRecursion();
    this.tokenize();
    this.generalRegexTokenized = this.regex.insertDotsInRegexTokenizedWithWords(this.generalRegexTokenized);
    this.generalRegexPostfix = this.regex.infixToPostfixTokenized(this.generalRegexTokenized);
    // console.log(this.generalRegexPostfix)
    this.regex.postfixTokenized = this.generalRegexPostfix;
    this.tokenTree = this.regex.constructTokenTree();
    this.regex.regexWithDots = this.generalRegexTokenized;
    this.ast = new SyntaxTree(this.tokenTree[0], this.tokenTree[1], this.regex, this.tokenTree[2]);
    // console.log(this.ast)
    this.directDFA = this.ast.generateDirectDFATokens();
    // console.log(this.directDFA);

  };
  // This will only tokenize and convert based on what pattern it is for example [0-4] to (0|1|2|3|4) but it will always be in ascii code to avoid conflicts
  tokenize(){
    let afds = [];
    // AFD FOR THE LEXER
    // " AFD for strings or inside brackets
    this.regex = new Regex(this.ascii.DOUBLE_QUOTES);
    this.tokenTree = this.regex.constructTokenTree();
    this.ast = new SyntaxTree(this.tokenTree[0], this.tokenTree[1], this.regex, this.tokenTree[2]);
    afds.push(this.ast.generateDirectDFATokens());
    // ' AFD
    this.regex = new Regex(this.ascii.SIMPLE_QUOTES);
    this.tokenTree = this.regex.constructTokenTree();
    this.ast = new SyntaxTree(this.tokenTree[0], this.tokenTree[1], this.regex, this.tokenTree[2]);
    afds.push(this.ast.generateDirectDFATokens());
    // console.log(this.generalRegex);
    this.generalRegexTokenized = [];
    let complementIndex = 0;
    this.complementSet = [];
    this.isComplement = false;
    let insideBrackets1 = 0;
    for (let i = 0; i < this.generalRegex.length; i++){
      let isWordChar = false;
      let index = 0;
      let S = null;
      let isWord = false;
      let indexTemp = 0;
      let afdIndex = 0;
      let c = this.generalRegex[i];
      for (let n = 0; n<afds.length; n++){
        // console.log(`Token to be analyzed: ${c}`)
        let currentDfa = afds[n];
        [isWord, indexTemp, S] = currentDfa.yalexSimulate(this.generalRegex, i);
        if (isWord && indexTemp>index){
          isWordChar = isWord;
          index = indexTemp; 
          afdIndex = n;
        };
      };
       // Replace with parentesis
       if (c === "["){ 
        insideBrackets1++;
        this.generalRegexTokenized.push(new Token("(", this.getPrecedence("(")));
        if (this.generalRegex[i+1]=== "^"){
          this.isComplement = true;
          complementIndex = this.generalRegexTokenized.length;
          i++;
        }
      }
      else if (c === "]"){ 
        insideBrackets1--;
        // Complement operation ends
        if (this.isComplement){
          // Array that will be eliminated
          this.generalRegexTokenized.splice(complementIndex, this.generalRegexTokenized.length - complementIndex);
          // get the complement
          let newComplement = []
          // console.log(this.complementSet);
          for (let k = 0; k < 255; k++){
            if (!this.complementSet.includes(k)) {
              newComplement.push(new Token(k, -2));
              newComplement.push(new Token("|", this.getPrecedence("|")));
            };
          };
          this.generalRegexTokenized = [...this.generalRegexTokenized, ...newComplement];
        }
        this.isComplement = false;
        if (this.generalRegexTokenized[this.generalRegexTokenized.length-1].precedence === 0){this.generalRegexTokenized.pop()};
        this.generalRegexTokenized.push(new Token(")", this.getPrecedence(")")));
      }
      // is double quotes
      else if (isWordChar && afdIndex === 0){this.handleDoubleQuotes(this.generalRegex, this.generalRegexTokenized, i, index, insideBrackets1); i = index; afdIndex = null;}
      // is simple quotes
      else if (afdIndex === 1 && isWordChar){this.handleSimpleQuotes(this.generalRegex, this.generalRegexTokenized, i, index, insideBrackets1); i = index; afdIndex = null;}
      // Is any regex operator +, *, (, ), ., ? just appends
      else if (this.ascii.CLEAN_OPERATORS.includes(c))this.generalRegexTokenized.push(new Token(c, this.getPrecedence(c)));
      // is any character
      else if (c === "_"){
        this.generalRegexTokenized.push(new Token ("(", this.getPrecedence("(")));
        for(let n = 0; n < 255; n++){
          this.generalRegexTokenized.push(new Token (n, -2));
          this.generalRegexTokenized.push(new Token ("|", this.getPrecedence("|")));
          if (this.isComplement){
            this.complementSet.push(n);
          }
        }
        // Delete the "|"
        this.generalRegexTokenized.pop();
        this.generalRegexTokenized.push(new Token (")", this.getPrecedence(")")));
      }
      // Is a range
      else if (c === "-" && insideBrackets1 === 1){
        // this.generalRegexTokenized.push(new Token("(", this.getPrecedence("(")));
        let nextIndex = this.generalRegex[i+2].charCodeAt(0);
        let previousIndex = this.generalRegexTokenized[this.generalRegexTokenized.length-2].value;
        // console.log(nextIndex)
        // console.log(previousIndex)
        if (previousIndex<nextIndex){
          for (let j = previousIndex+1; j < nextIndex; j++) {
            this.generalRegexTokenized.push(new Token(j, -2));
            this.generalRegexTokenized.push(new Token("|", this.getPrecedence("|")));
            if (this.isComplement){
              this.complementSet.push(j);
            }
          };
        } else throw new Error ("Syntax error, range incorrect, range doesn't make sense");
        // this.generalRegexTokenized.push(new Token(")", this.getPrecedence(")")));
      }
     
      else {throw new Error(`not recognized in the lexer. ${c}${this.generalRegex[i+1]}${this.generalRegex[i+2]}`)};
    };
    if (!this.regex.isValidTokens(this.generalRegexTokenized)){
      throw new Error(`Parsing error, something was not right in the regex`);
    }
    // console.log(this.generalRegexTokenized);  
  };
  getPrecedence(c){
    switch(c){
      case "*": return 2;
      case "+": return 2;
      case "?": return 2;
      case ".": return 1;
      case "|": return 0;
      case "(": return -1;
      case ")": return 3;
      default: throw new Error("Invalid operator");
    }
  }
  handleSimpleQuotes(regex, list, i, index, insideBrackets1){
    if (insideBrackets1 === 1){
      list.push(new Token(regex[i+1].charCodeAt(0), -2));
      list.push(new Token("|", this.getPrecedence("|")));
      if (this.isComplement){
        this.complementSet.push(regex[i+1].charCodeAt(0));
      }
    }
    else if (insideBrackets1 === 0) {
      list.push(new Token(regex[i+1].charCodeAt(0), -2));
    }
  }
  handleDoubleQuotes(regex, list, i, index, insideBrackets1){
    // Se trabaja como un or
    if (insideBrackets1===1){
      for (let j = i+1; j < index; j++){
        let c = regex[j];
        if (!this.ascii.CLEAN_OPERATORS.includes(c)) {
          list.push(new Token(c.charCodeAt(0), -2));
          if (this.isComplement){
            this.complementSet.push(c.charCodeAt(0));
          }
          if (j<index-1) list.push(new Token("|", this.getPrecedence("|")));
        }
        else list.push(new Token(c.charCodeAt(0), this.getPrecedence(c)));
      }
    }
    else if (insideBrackets1 === 0){
      for (let j = i+1; j < index; j++){
        let c = regex[j];
        list.push(new Token(c.charCodeAt(0), -2))
        // Do the concat because it is a string
        if (j!==index-1)list.push(new Token(".", 1));
      }
    }
  };
  // This method eliminates the recursion that could happen when derivating the regex, it creates an string clean.
  eliminateRecursion(){
    // Get the general regex
    let keys = Array.from(this.rulesSet.keys());
    this.generalRegex = "("
    for (let i = 0; i < keys.length; i++){
      let regex = this.tokensSet.get(keys[i]);
      if (regex !== undefined){
        this.generalRegex += "("+this.tokensSet.get(keys[i])+")"
      }
      else{
        this.generalRegex += "("+keys[i]+")"
      }
      if (i !== keys.length-1){
        this.generalRegex += "|";
      }
    };
    this.generalRegex.slice(0, this.generalRegex.length-2);
    this.generalRegex += ")";
    // console.log(this.generalRegex)
    // Get the afds of the symbols that cause recursion
    keys = Array.from(this.tokensSet.keys());
    let afds = []
    this.regex = new Regex(keys[2]);
    this.tokenTree = this.regex.constructTokenTree();
    this.ast = new SyntaxTree(this.tokenTree[0], this.tokenTree[1], this.regex, this.tokenTree[2]);
    // The first 2 will be ommited bc they are Commentaries and Delimiters
    for (let i = 4; i<keys.length; i++){
      this.regex = new Regex(keys[i]);
      this.tokenTree = this.regex.constructTokenTree();
      this.ast = new SyntaxTree(this.tokenTree[0], this.tokenTree[1], this.regex, this.tokenTree[2]);
      afds.push(this.ast.generateDirectDFATokens());
    }
    // REPLACE ALL ESCAPED VALUES because in the key names there could be some like [' ''\n''\t']
    for (let i = 0; i < this.generalRegex.length; i++) {
      if (this.generalRegex[i-1] === "\\" && 
      (this.generalRegex[i] === "n"||this.generalRegex[i] === "t"||this.generalRegex[i] === "r"||this.generalRegex[i] === "b"||this.generalRegex[i] === "f")){
        this.generalRegex = this.generalRegex.replace("\\n", "\n");
        this.generalRegex = this.generalRegex.replace("\\t", "\t");
        this.generalRegex = this.generalRegex.replace("\\r", "\r");
        this.generalRegex = this.generalRegex.replace("\\b", "\b");
        this.generalRegex = this.generalRegex.replace("\\f", "\f");
        this.generalRegex = this.generalRegex.replace("\\s", "\s");
      };
    };
    // AFD FOR THE LEXER
    // " AFD for strings or inside brackets
    this.regex = new Regex(this.ascii.DOUBLE_QUOTES);
    this.tokenTree = this.regex.constructTokenTree();
    this.ast = new SyntaxTree(this.tokenTree[0], this.tokenTree[1], this.regex, this.tokenTree[2]);
    afds.push(this.ast.generateDirectDFATokens());
    // ' AFD
    this.regex = new Regex(this.ascii.SIMPLE_QUOTES);
    this.tokenTree = this.regex.constructTokenTree();
    this.ast = new SyntaxTree(this.tokenTree[0], this.tokenTree[1], this.regex, this.tokenTree[2]);
    afds.push(this.ast.generateDirectDFATokens());
    // eliminate recursion
    let insideBrackets1 = 0;
    for (let i = 0; i < this.generalRegex.length; i++){
      let isWordChar = false;
      let index = 0;
      let S = null;
      let isWord = false;
      let indexTemp = 0;
      let afdIndex = 0;
      let c = this.generalRegex[i];
      for (let n = 0; n<afds.length; n++){
        let currentDfa = afds[n];
        [isWord, indexTemp, S] = currentDfa.yalexSimulate(this.generalRegex, i);
        if (isWord && indexTemp>index){
          isWordChar = isWord;
          index = indexTemp; 
          afdIndex = n;
        };
      };
      // is recursive
      if (isWordChar && afdIndex<afds.length-2 && insideBrackets1 === 0){
        let array = this.generalRegex.split('');
        array[i] = "("+this.tokensSet.get(keys[afdIndex+4])+")";
        array.splice(i+1, index-i);
        this.generalRegex = array.join('');
        // console.log(`recursive detected ${this.generalRegex}`)
        // Esto sirve para analizar el nuevo string para detectar si hay otra recursion a solucionar
        i--;
        isWordChar = false;
      }
      else if (c === "[") insideBrackets1++;
      else if (c === "]") insideBrackets1--;
      // is double quotes
      else if (afdIndex===afds.length-2){
        i = index;
        isWordChar = false;
      }
       // is simple quotes
       else if (afdIndex===afds.length-1){
        i = index;
        isWordChar = false;
      } 
      // Is any regex operator +, *, (, ), ., ? just skips
      else if (this.ascii.CLEAN_OPERATORS.includes(c));
      else if (this.ascii.MATH.includes(c));
      else if (this.ascii.PUNCTUATION.includes(c));
      // is any character
      else if (c === "_");
      else {throw new Error (`Invalid pattern ${c}, maybe was not declared that definition`)};
      // Must be balanced the brackets
      if (insideBrackets1>1||insideBrackets1<0){
        throw  new Error ("Logic error, unbalanced brackets or brackets anidados");
      }
    };
    // console.log(this.generalRegex);
    
  }
  handlingSimpleQuotes(regex, i){
    // console.log(i)
    if ( regex[i+1]==="+" || regex[i+1] === "*" || regex[i+1] === "." || regex[i+1] === "(" || regex[i+1] === ")"){
      regex = regex.replace(this.generalRegex.slice(i, i+3), "(\\"+regex[i+1]+")");
    }
    else if (regex[i+1]==="\\" ){
      regex = regex.replace(regex.slice(i, i+4), "(\\"+regex[i+2]+")");
    }
    else{
      regex = regex.replace(regex.slice(i, i+3), "("+regex[i+1]+")");
    }
    return regex;
  }
  handlingDoubleQuotes(regex, i){
    let originalI = i;
    i++;
    let c = regex[i];
    let antiTokens = []
    // Handling to throw error because can't be just alone
    if (c === "\""){
      throw new Error(`Error: empty declaration like "" `);
    }
    while (c!=="\"" && i<regex.length){
      if (c!=="\\"){
        antiTokens.push(c);
        i++;
        c=regex[i];
      } else {
        c = c+regex[i+1];
        antiTokens.push(c);
        i+=2;
        c=regex[i];
      }
    }
    if (i>regex.length){
      throw  new Error(`Error: unclosed double quotes at the end of expression "${originalI}"`);
    }
    // console.log(antiTokens)
    let array = regex.split("");
    // console.log(array)
    array[originalI] = "("+antiTokens.join("|")+")";
    // console.log(array)
    array.splice(originalI+1, i-originalI);
    // console.log(array)
    regex = array.join("");
    return regex;
  }
  handlingRanges(regex, i){
    let antiTokens = []
    let initTokenAscii = regex[i-2];
    let finTokenAscii = regex[i+2];
    initTokenAscii = initTokenAscii.charCodeAt(0);
    finTokenAscii = finTokenAscii.charCodeAt(0);
    if (initTokenAscii<finTokenAscii){
      for (let m = initTokenAscii; m <= finTokenAscii; m++){
        antiTokens.push(String.fromCharCode(m));
      };
    }
    // The else must handle errors because cant exist some 9-2 range or 2-2
    else{
      throw new Error(`Error: invalid range [${regex[i-1]}-${regex[i+2]}]`);
    }
    //  console.log(antiTokens)
     let array = regex.split("");
    //  console.log(array)
     array[i-3] = "("+antiTokens.join("|")+")";
    //  console.log(array)
     array.splice(i-2, 6);
    //  console.log(array)
     regex = array.join("");
    //  console.log(regex)
     i+=3;
     return regex;
  }
};
module.exports = YalexAnalyzer