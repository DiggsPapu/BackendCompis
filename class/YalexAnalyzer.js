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
      this.parts = {"COMMENTARIES":{}, "DELIMITERS":{}, "HEADER":{}, "DEFINITION":{},"RULE_NAME":{}, "RULE_BODY":{}, "DEFINITION_NAME":{},"START_RULE":{}, "DEFINITION_DEFINITION":{}};
      // AFD FOR THE COMMENTARIES
      let regex = new Regex(this.ascii.COMMENTARIES);
      let tokenTree = regex.constructTokenTree();
      let ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.commentaryDFA = ast.generateDirectDFATokens();
      this.generalDFA =this.commentaryDFA;
      this.parts.COMMENTARIES["finalStates"] = this.generalDFA.finalState.map((state)=>state.label);
      // AFD FOR THE DELIMETERS
      regex = new Regex("(( )|\n|\r|\t|\\n|\\t|\\r)+");
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.delimDFA = ast.generateDirectDFATokens();
      this.delimDFA.changeStates(this.generalDFA.states.length);
      this.parts.DELIMITERS["finalStates"] = this.delimDFA.finalState.map((state)=>state.label);
      this.generalDFA.addDFA(this.delimDFA);
      
      // AFD FOR THE HEADER
      regex = new Regex(this.ascii.HEADER)
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.headerDFA = ast.generateDirectDFATokens();
      this.headerDFA.changeStates(this.generalDFA.states.length);
      this.parts.HEADER["finalStates"] = this.headerDFA.finalState.map((state)=>state.label);
      this.generalDFA.addDFA(this.headerDFA);
      // AFD'S FOR THE DEFINITION
      // Let +
      regex = new Regex("let +");
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.letDFA = ast.generateDirectDFATokens();
      this.letDFA.changeStates(this.generalDFA.states.length)
      this.parts.DEFINITION["finalStates"] = this.letDFA.finalState.map((state)=>state.label);
      this.generalDFA.addDFA(this.letDFA);
      //  definition_name afd
      regex = new Regex(this.ascii.DEFINITION_NAME);
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.definitionNameDFA = ast.generateDirectDFATokens();
      this.definitionNameDFA.changeStates(this.generalDFA.states.length)
      this.parts.DEFINITION_NAME["finalStates"] = this.definitionNameDFA.finalState.map((state)=>state.label);
      this.generalDFA.addDFA(this.definitionNameDFA);
      // definition definition afd
      regex = new Regex(this.ascii.DEFINITION_DEFINITION);
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.definitionDefinitionDFA = ast.generateDirectDFATokens();
      this.definitionDefinitionDFA.changeStates(this.generalDFA.states.length);
      this.parts.DEFINITION_DEFINITION["finalStates"] = this.definitionDefinitionDFA.finalState.map((state)=>state.label);
      this.generalDFA.addDFA(this.definitionDefinitionDFA);
      // AFD FOR THE RULES
      regex = new Regex("( )*rule tokens( )*=")
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.startRuleDFA = ast.generateDirectDFATokens();
      this.startRuleDFA.changeStates(this.generalDFA.states.length)
      this.parts.START_RULE["finalStates"] = this.startRuleDFA.finalState.map((state)=>state.label);
      this.generalDFA.addDFA(this.startRuleDFA);
      // rule name
      regex = new Regex(this.ascii.DEFINITION_DEFINITION);
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.ruleNameDFA = ast.generateDirectDFATokens();
      this.ruleNameDFA.changeStates(this.generalDFA.states.length);
      this.parts.RULE_NAME["finalStates"] = this.ruleNameDFA.finalState.map((state)=>state.label);
      this.generalDFA.addDFA(this.ruleNameDFA);
      // rule body
      regex = new Regex(`{(${this.ascii.MAYUS.join("|")}|${this.ascii.MINUS.join("|")}|${this.ascii.BRACKETS.join("|")}|${this.ascii.NUMBER.join("|")}|\"|\'|${this.ascii.OPERATORS.join("|")}|${this.ascii.TILDES.join("|")}|${this.ascii.ESCAPE_CHARACTERS.join("|")}|${this.ascii.PUNCTUATION.join("|")}|${this.ascii.MATH.join("|")}|\n|\t|\r| |({(${this.ascii.MAYUS.join("|")}|${this.ascii.MINUS.join("|")}|${this.ascii.BRACKETS.join("|")}|${this.ascii.NUMBER.join("|")}|\"|\'|${this.ascii.OPERATORS.join("|")}|${this.ascii.TILDES.join("|")}|${this.ascii.ESCAPE_CHARACTERS.join("|")}|${this.ascii.PUNCTUATION.join("|")}|${this.ascii.MATH.join("|")}|${this.ascii.SIMPLE_QUOTES}|\n|\t|\r| )+}))+}`)
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.ruleBodyDFA = ast.generateDirectDFATokens();
      this.ruleBodyDFA.changeStates(this.generalDFA.states.length);
      this.parts.RULE_BODY["finalStates"] = this.ruleBodyDFA.finalState.map((state)=>state.label);
      this.generalDFA.addDFA(this.ruleBodyDFA);
    };
    // Use an async function to wait for the data
    readFile(data) {
      let accepted = false;
      let index = 0;
      this.tokensSet = new Map();
      this.tokensSet.set("COMMENTARY", []);
      this.tokensSet.set("DELIMITERS", []);
      this.tokensSet.set("HEADER", []);
      this.tokensSet.set("TRAILER", []);
      this.rulesSet = new Map();
      let S = 0;
      // Handle EOF
      data+="\n";
      let i = 0;
      let isLet = false;
      let isDefinitionBody = false;
      let tokenName = "";
      for (i; i<data.length; i++){
        // console.log("empieza")
        let values = this.generalDFA.yalexSimulate(data, i);
        accepted = values[0];
        index = values[1];
        S = values[2];
        console.log(this.generalDFA.yalexSimulate(data, i))
        // console.log(this.ascii.DEFINITION_DEFINITION);
        // console.log(this.generalDFA.finalState);
        // console.log(this.parts.DEFINITION_DEFINITION["finalStates"]);
        // console.log(this.parts.DELIMITERS["finalStates"]);
        if (accepted){
          if (this.parts.DELIMITERS["finalStates"].includes(S[0].label)){
            i = index;
            if (!(this.tokensSet.get("DELIMITERS").includes(data[i]))) {
              this.tokensSet.get("DELIMITERS").push(data[i]);
            };
          }
          else if (this.parts.COMMENTARIES["finalStates"].includes(S[0].label)){
            this.tokensSet.get("COMMENTARY").push(data.slice(i, index+1));
            i = index;
          }
          else if (this.parts.HEADER["finalStates"].includes(S[0].label)){
            this.tokensSet.get("HEADER").push(data.slice(i+1, index));
            i = index+1;
          }
          else if (this.parts.DEFINITION["finalStates"].includes(S[0].label) && !isLet && !isDefinitionBody){
            // Let part started
            isLet = true;
            i = index;
          }
          // Must be in isLet = True
          else if (this.parts.DEFINITION_NAME["finalStates"].includes(S[0].label) && isLet && !isDefinitionBody){
            // Let part started
            i = index;
            tokenName = "";
            while (data[index]==="="||data[index]===" "){
              index--;
            }
            while (data[index]!==" "){
              tokenName = data[index]+tokenName;
              index--;
            }
            // A new set is created
            if (!this.tokensSet.has(tokenName)){
              this.tokensSet.set(tokenName, []);
            }
            else {
              throw Error(`The token ${tokenName} has already been defined`);
            }
            isLet = false;
            isDefinitionBody = true;
          }
          // Must be in isDefinitionBody = True
          else if (this.parts.DEFINITION_DEFINITION["finalStates"].includes(S[0].label) && isDefinitionBody && !isLet){
            this.tokensSet.get(tokenName).push(data.slice(i, index).trim());
            i = index;
            isDefinitionBody = false;
          }
          console.log(this.tokensSet);
        }
        else {
          throw Error(`Sintax error in position ${i}, character ${data[i]} something is not right in the let definition`);
        }
      }
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
    this.rulesVal = new Map();
    for (let k = 0; k < Array.from(this.rulesSet.keys()).length; k++ ){
      let key = Array.from(this.rulesSet.keys())[k];
      let newRegex = this.eliminateRecursion(key);
      let regexTokenized = this.tokenize(newRegex);
      // console.log(newRegex)
      // console.log(regexTokenized);
      let regexWithDots = this.regex.insertDotsInRegexTokenizedWithWords(regexTokenized);
      let postfixRegex = this.regex.infixToPostfixTokenized(regexWithDots);
      this.regex.postfixTokenized = postfixRegex;
      let tokenTree= this.regex.constructTokenTree();
      this.regex.regexWithDots = regexWithDots;
      let ast = new SyntaxTree(tokenTree[0], tokenTree[1], this.regex, tokenTree[2]);
      // console.log(this.ast)
      let directDFA = ast.generateDirectDFATokens();
      this.rulesVal.set(key,[newRegex, regexTokenized, regexWithDots, postfixRegex, tokenTree, regexWithDots, ast, directDFA, this.rulesSet.get(key)]);
    }
    // Base dfa
    let baseDFA = this.rulesVal.get(Array.from(this.rulesSet.keys())[0])[7];
    let finalS = [];
    for (let i = 0; i < baseDFA.finalState.length; i++){
      finalS.push(baseDFA.finalState[i].label);
    };
    this.rulesVal.get(Array.from(this.rulesSet.keys())[0]).push(finalS);
    // Ignore 1 bc is the base dfa
    for (let k = 1; k < Array.from(this.rulesSet.keys()).length; k++ ){
      // key
      let key = Array.from(this.rulesSet.keys())[k];
      // dfa
      let currentDFA = this.rulesVal.get(key)[7];
      // final states in the big dfa
      finalS = [];
      // Less init state
      let counter = baseDFA.states.length;
      currentDFA.changeStates(counter);
      baseDFA.addDFA(currentDFA);
      for (let i = 0; i < currentDFA.finalState.length; i++){
        finalS.push(currentDFA.finalState[i].label);
      };
      // Add which final states will count for this in the nfa
      this.rulesVal.get(key).push(finalS);
    }
    this.nfa = baseDFA;
    this.generalRegex = "("
    for (let k = 0; k < Array.from(this.rulesSet.keys()).length; k++ ){
      this.generalRegex+="("+this.rulesVal.get(Array.from(this.rulesSet.keys())[k])[0]+")|"
    }
    this.generalRegex = this.generalRegex.slice(0, this.generalRegex.length-1);
    this.generalRegex += ")";
    this.generalRegexTokenized = this.tokenize(this.generalRegex);
    this.generalRegexTokenized = this.regex.insertDotsInRegexTokenizedWithWords(this.generalRegexTokenized);
    this.generalRegexPostfix = this.regex.infixToPostfixTokenized(this.generalRegexTokenized);
    this.regex.postfixTokenized = this.generalRegexPostfix;
    this.tokenTree = this.regex.constructTokenTree();
    this.regex.regexWithDots = this.generalRegexTokenized;
    this.ast = new SyntaxTree(this.tokenTree[0], this.tokenTree[1], this.regex, this.tokenTree[2]);
    this.directDFA = this.ast.generateDirectDFATokens();
  };
  tokenize(regex){
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
    let regexTokenized = [];
    let complementIndex = 0;
    this.complementSet = [];
    this.isComplement = false;
    let insideBrackets1 = 0;
    for (let i = 0; i < regex.length; i++){
      let isWordChar = false;
      let index = 0;
      let S = null;
      let isWord = false;
      let indexTemp = 0;
      let afdIndex = 0;
      let c = regex[i];
      for (let n = 0; n<afds.length; n++){
        // console.log(`Token to be analyzed: ${c}`)
        let currentDfa = afds[n];
        [isWord, indexTemp, S] = currentDfa.yalexSimulate(regex, i);
        if (isWord && indexTemp>index){
          isWordChar = isWord;
          index = indexTemp; 
          afdIndex = n;
        };
      };
       // Replace with parentesis
       if (c === "["){ 
        insideBrackets1++;
        regexTokenized.push(new Token("(", this.getPrecedence("(")));
        if (regex[i+1]=== "^"){
          this.isComplement = true;
          complementIndex = regexTokenized.length;
          i++;
        }
      }
      else if (c === "]"){ 
        insideBrackets1--;
        // Complement operation ends
        if (this.isComplement){
          // Array that will be eliminated
          regexTokenized.splice(complementIndex, regexTokenized.length - complementIndex);
          // get the complement
          let newComplement = []
          // console.log(this.complementSet);
          for (let k = 0; k < 255; k++){
            if (!this.complementSet.includes(k)) {
              newComplement.push(new Token(k, -2));
              newComplement.push(new Token("|", this.getPrecedence("|")));
            };
          };
          regexTokenized = [...regexTokenized, ...newComplement];
        }
        this.isComplement = false;
        if (regexTokenized[regexTokenized.length-1].precedence === 0){regexTokenized.pop()};
        regexTokenized.push(new Token(")", this.getPrecedence(")")));
      }
      // is double quotes
      else if (isWordChar && afdIndex === 0){this.handleDoubleQuotes(regex, regexTokenized, i, index, insideBrackets1); i = index; afdIndex = null;}
      // is simple quotes
      else if (afdIndex === 1 && isWordChar){this.handleSimpleQuotes(regex, regexTokenized, i, index, insideBrackets1); i = index; afdIndex = null;}
      // Is any regex operator +, *, (, ), ., ? just appends
      else if (this.ascii.CLEAN_OPERATORS.includes(c))regexTokenized.push(new Token(c, this.getPrecedence(c)));
      // is any character
      else if (c === "_"){
        regexTokenized.push(new Token ("(", this.getPrecedence("(")));
        for(let n = 0; n < 255; n++){
          regexTokenized.push(new Token (n, -2));
          regexTokenized.push(new Token ("|", this.getPrecedence("|")));
          if (this.isComplement){
            this.complementSet.push(n);
          }
        }
        // Delete the "|"
        regexTokenized.pop();
        regexTokenized.push(new Token (")", this.getPrecedence(")")));
      }
      // Is a range
      else if (c === "-" && insideBrackets1 === 1){
        // this.generalRegexTokenized.push(new Token("(", this.getPrecedence("(")));
        let nextIndex = regex[i+2].charCodeAt(0);
        let previousIndex = regexTokenized[regexTokenized.length-2].value;
        // console.log(nextIndex)
        // console.log(previousIndex)
        if (previousIndex<nextIndex){
          for (let j = previousIndex+1; j < nextIndex; j++) {
            regexTokenized.push(new Token(j, -2));
            regexTokenized.push(new Token("|", this.getPrecedence("|")));
            if (this.isComplement){
              this.complementSet.push(j);
            }
          };
        } else throw new Error ("Syntax error, range incorrect, range doesn't make sense");
        // this.generalRegexTokenized.push(new Token(")", this.getPrecedence(")")));
      }
     
      else {throw new Error(`not recognized in the lexer. ${c}${regex[i+1]}${regex[i+2]}`)};
    };
    if (!this.regex.isValidTokens(regex)){
      throw new Error(`Parsing error, something was not right in the regex`);
    }
    return regexTokenized
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
  eliminateRecursion(regex){
    // console.log(regex)
    // Get the afds of the symbols that cause recursion
    let keys = Array.from(this.tokensSet.keys());
    let afds = []
    this.regex = new Regex(keys[2]);
    this.tokenTree = this.regex.constructTokenTree();
    this.ast = new SyntaxTree(this.tokenTree[0], this.tokenTree[1], this.regex, this.tokenTree[2]);
    for (let i = 4; i<keys.length; i++){
      this.regex = new Regex(keys[i]);
      this.tokenTree = this.regex.constructTokenTree();
      this.ast = new SyntaxTree(this.tokenTree[0], this.tokenTree[1], this.regex, this.tokenTree[2]);
      afds.push(this.ast.generateDirectDFATokens());
    }
    // REPLACE ALL ESCAPED VALUES because in the key names there could be some like [' ''\n''\t']
    for (let i = 0; i < regex.length; i++) {
      if (regex[i-1] === "\\" && 
      (regex[i] === "n"||regex[i] === "t"||regex[i] === "r"||regex[i] === "b"||regex[i] === "f")){
        regex = regex.replace("\\n", "\n");
        regex = regex.replace("\\t", "\t");
        regex = regex.replace("\\r", "\r");
        regex = regex.replace("\\b", "\b");
        regex = regex.replace("\\f", "\f");
        regex = regex.replace("\\s", "\s");
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
    for (let i = 0; i < regex.length; i++){
      let isWordChar = false;
      let index = 0;
      let S = null;
      let isWord = false;
      let indexTemp = 0;
      let afdIndex = 0;
      let c = regex[i];
      for (let n = 0; n<afds.length; n++){
        let currentDfa = afds[n];
        [isWord, indexTemp, S] = currentDfa.yalexSimulate(regex, i);
        if (isWord && indexTemp>index){
          isWordChar = isWord;
          index = indexTemp; 
          afdIndex = n;
        };
      };
      // is recursive
      if (isWordChar && afdIndex<afds.length-2 && insideBrackets1 === 0){
        let array = regex.split('');
        array[i] = "("+this.tokensSet.get(keys[afdIndex+4])+")";
        array.splice(i+1, index-i);
        regex = array.join('');
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
      else {console.log(this.tokensSet);console.log(this.rulesSet);throw new Error (`Invalid pattern ${regex}, maybe was not declared that definition`)};
      // Must be balanced the brackets
      if (insideBrackets1>1||insideBrackets1<0){
        throw  new Error ("Logic error, unbalanced brackets or brackets anidados");
      }
    };
    return regex
  };
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