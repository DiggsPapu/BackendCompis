class asciiUniverses {
  constructor() {
    this.getUniverse();
  }
  getUniverse(){
    this.MAYUS= []
    this.MINUS=[]
    this.NUMBER = []
    this.UNIVERSE = []
    this.TERMINAL = ["\n","\t","\r"," ", "\b"]
    this.TILDES = ["á","é","í","ó","ú","Á","É","Í","Ó","Ú"]
    this.MATH = ["\\+", "-", "\\*", "/", "^", "\\(", "\\)", "\\.", "=", ">", "<", "%", "#"]
    this.BRACKETS = ["[","]"]
    this.PARENTHESIS = ["\\(","\\)"]
    this.SYMBOLS = ["!","\"", "#","$", "%", "&", "\'", "@", "\\|", "\\\\","^", "`", "{", "}", "¡|¢|£|¤|¥|¦|§|¨|©|ª|«|¬|­|®|¯|°|±|²|³|´|µ|¶|·|¸|¹|º|»|¼|½|¾|¿|À|Á|Â|Ã|Ä|Å|Æ|Ç|È|É|Ê|Ë|Ì|Í|Î|Ï|Ð|Ñ|Ò|Ó|Ô|Õ|Ö|×|Ø|Ù|Ú|Û|Ü|Ý|Þ|ß|à|á|â|ã|ä|å|æ|ç|è|é|ê|ë|ì|í|î|ï|ð|ñ|ò|ó|ô|õ|ö|÷|ø|ù|ú|û|ü|ý|þ|ÿ"]
    this.OPERATORS = ["\\+", "\\*", "\\(","\\)", "\\.", "\\|", "\\?", "#"]
    this.OPERATORS2 = ["\\+", "\\*", "\\(","\\)", "\\.", "\\?"]
    this.CLEAN_OPERATORS = ["+", "*", "(",")", ".", "|", "?"]
    this.ESCAPE_CHARACTERS = ["\\n", "\\t", "\\r", "\\b", "\\f", "\\s"]
    this.PUNCTUATION = [";","\\.",":", ",", "!", "\\?", "_" ]
    for (let i = 0; i<=255; i++){
      if (String.fromCharCode(i)==="?"||String.fromCharCode(i)==="."||String.fromCharCode(i)==="+"||
      String.fromCharCode(i)==="("||String.fromCharCode(i)===")"||String.fromCharCode(i)==="*"||
      String.fromCharCode(i)==="["||String.fromCharCode(i)==="|"||String.fromCharCode(i)==="]"||
      String.fromCharCode(i)==="|"||String.fromCharCode(i)==="^"){
        this.UNIVERSE.push("\\"+String.fromCharCode(i));  
      }
      else if (String.fromCharCode(i) === "_"||String.fromCharCode(i)==="\\"){
        continue;
      }
      else{
        this.UNIVERSE.push(String.fromCharCode(i));
      }
      if (i>=65 && i<=90) this.MAYUS.push(String.fromCharCode(i));
      if (i>=97 && i<=122) this.MINUS.push(String.fromCharCode(i));
      if (i>=48 && i<=57) this.NUMBER.push(String.fromCharCode(i));
      // if (i>=123) this.SYMBOLS.push(String.fromCharCode(i));
    }
    this.UNIVERSE.push("\\\\");
    this.UNIVERSE.push("\\_")
    // console.log(this.UNIVERSE);
    this.RANGES = [...this.MAYUS, ...this.MINUS, ...this.NUMBER];
    this.DOUBLE_QUOTES = `\"(${[...this.RANGES,...this.MATH, ...this.PUNCTUATION,...this.ESCAPE_CHARACTERS,...["\n", "\t", "\r", "\b", "( )"]].join("|")})+\"`;
    // console.log(this.DOUBLE_QUOTES);
    this.SIMPLE_QUOTES = ["'(", this.SYMBOLS.join("|"), "|",this.RANGES.join("|"), "|", this.MATH.join("|"), "|", this.ESCAPE_CHARACTERS.join("|"),"|", this.PUNCTUATION.join("|"), "|", ["\n", "\t", "\r", "\b", "( )"].join("|"),"| |\")'"].join("");
    
    this.DEFINITION_DEFINITION = ["( )*("+this.RANGES.join("|"),"|", this.MATH.join("|"), "|", this.DOUBLE_QUOTES, "|", this.SIMPLE_QUOTES, "|", this.OPERATORS.join("|"), "|", this.BRACKETS.join("|"),"|_)+"].join("")+"("+this.TERMINAL.join("|")+")+"
    // console.log(this.DEFINITION_DEFINITION)
    this.HEADER = `{(${this.MAYUS.join("|")}|${this.MINUS.join("|")}|${this.BRACKETS.join("|")}|${this.NUMBER.join("|")}|\"|\'|${this.OPERATORS.join("|")}|${this.TILDES.join("|")}|${this.ESCAPE_CHARACTERS.join("|")}|${this.PUNCTUATION.join("|")}|${this.MATH.join("|")}|\n|\t|\r| |({(${this.MAYUS.join("|")}|${this.MINUS.join("|")}|${this.BRACKETS.join("|")}|${this.NUMBER.join("|")}|\"|\'|${this.OPERATORS.join("|")}|${this.TILDES.join("|")}|${this.ESCAPE_CHARACTERS.join("|")}|${this.PUNCTUATION.join("|")}|${this.MATH.join("|")}|\n|\t|\r| |\\n|\\t|\\r)+}))+}`
    this.COMMENTARIES = `\\(\\* *(${[...this.RANGES, ...this.PUNCTUATION, ...this.BRACKETS, this.DOUBLE_QUOTES, this.SIMPLE_QUOTES, ...this.TILDES,...["\\+", "-", "/", "^", "\\*", "\\.", "=", ">", "<", "%", "#", "\\|"], ...this.TERMINAL].join("|")})+ *\\*\\)`;
    
    this.DEFINITION_NAME = ` *(${[...this.MAYUS, ...this.MINUS, "_"].join("|")})(${[...this.RANGES, "_"].join("|")})* *=`
    this.RULE_NAME = `(${[...this.MAYUS, ...this.MINUS, "_"].join("|")})+(${[...this.RANGES, "_"].join("|")})*`
  }
}

module.exports = {asciiUniverses}