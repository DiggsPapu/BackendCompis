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
    this.SYMBOLS = ["!","\"", "#","$", "%", "&", "\'", "@", "\\|"]
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
        // console.log(String.fromCharCode(i));
        continue;
      }
      else{
        this.UNIVERSE.push(String.fromCharCode(i));
      }
      if (i>=65 && i<=90) this.MAYUS.push(String.fromCharCode(i));
      if (i>=97 && i<=122) this.MINUS.push(String.fromCharCode(i));
      if (i>=48 && i<=57) this.NUMBER.push(String.fromCharCode(i));
    }
    this.UNIVERSE.push("\\\\");
    this.UNIVERSE.push("\\_")
    // console.log(this.UNIVERSE);
    this.RANGES = [...this.MAYUS, ...this.MINUS, ...this.NUMBER];
    this.DOUBLE_QUOTES = `\"(${[...this.RANGES,...this.MATH, ...this.PUNCTUATION,...this.ESCAPE_CHARACTERS,...["\n", "\t", "\r", "\b", "( )"]].join("|")})+\"`;
    // console.log(this.DOUBLE_QUOTES);
    this.SIMPLE_QUOTES = ["'(", this.SYMBOLS.join("|"), "|",this.RANGES.join("|"), "|", this.MATH.join("|"), "|", this.ESCAPE_CHARACTERS.join("|"),"|", this.PUNCTUATION.join("|"), "|", ["\n", "\t", "\r", "\b"].join("|"),"| |\")'"].join("");
    // console.log(this.SIMPLE_QUOTES);
    this.DEFINITION_DEFINITION = ["( )*(",this.PUNCTUATION, this.SYMBOLS.join("|"),"|",this.RANGES.join("|"),"|", this.MATH.join("|"), "|", this.DOUBLE_QUOTES, "|", this.SIMPLE_QUOTES, "|", this.OPERATORS.join("|"), "|", this.BRACKETS.join("|"),"|_)+"].join("")+"("+this.TERMINAL.join("|")+")+"
    // console.log(this.DEFINITION_DEFINITION)
    this.HEADER = `{(${this.MAYUS.join("|")}|${this.MINUS.join("|")}|${this.BRACKETS.join("|")}|${this.NUMBER.join("|")}|\"|\'|${this.OPERATORS.join("|")}|${this.TILDES.join("|")}|${this.ESCAPE_CHARACTERS.join("|")}|${this.PUNCTUATION.join("|")}|${this.MATH.join("|")}|\n|\t|\r| |({(${this.MAYUS.join("|")}|${this.MINUS.join("|")}|${this.BRACKETS.join("|")}|${this.NUMBER.join("|")}|\"|\'|${this.OPERATORS.join("|")}|${this.TILDES.join("|")}|${this.ESCAPE_CHARACTERS.join("|")}|${this.PUNCTUATION.join("|")}|${this.MATH.join("|")}|\n|\t|\r| |\\n|\\t|\\r)+}))+}`
    this.COMMENTARIES = `\\(\\* *(${[...this.RANGES, ...this.PUNCTUATION, ...this.BRACKETS, this.DOUBLE_QUOTES, this.SIMPLE_QUOTES, ...this.TILDES,...["\\+", "-", "/", "^", "\\*", "\\.", "=", ">", "<", "%", "#", "\\|"], ...this.TERMINAL].join("|")})+ *\\*\\)`;
    this.DEFINITION_NAME = ` *(${[...this.MAYUS, ...this.MINUS, "_"].join("|")})(${[...this.RANGES, "_"].join("|")})* *=`
    // ` *${[...this.MAYUS, ...this.MINUS, "_"].join("|")}(${[...this.RANGES, "_"].join("|")})* *=`
  }
}

module.exports = {asciiUniverses}