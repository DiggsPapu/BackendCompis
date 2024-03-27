export const TokenTypes = {
    NUMBER: "NUMBER",
    IDENTIFIER: "IDENTIFIER",
    ADDITION: "+",
    SUBTRACTION: "-",
    MULTIPLICATION: "*",
    DIVISION: "/",
    EXPONENTIATION: "^",
    PARENTHESIS_LEFT: "(",
    PARENTHESIS_RIGHT: ")",
    DEFINITION: /^[a-zA-Z]+[0-9]*[a-zA-Z]/,
  };
  
  export const TokenSpec = [
    [/^\s+/, null],
    [/^(?:\d+(?:\.\d*)?|\.\d+)/, TokenTypes.NUMBER],
    [/^[a-z]+/, TokenTypes.IDENTIFIER],
    [/^\+/, TokenTypes.ADDITION],
    [/^\-/, TokenTypes.SUBTRACTION],
    [/^\*/, TokenTypes.MULTIPLICATION],
    [/^\//, TokenTypes.DIVISION],
    [/^\^/, TokenTypes.EXPONENTIATION],
    [/^\(/, TokenTypes.PARENTHESIS_LEFT],
    [/^\)/, TokenTypes.PARENTHESIS_RIGHT],
    [/^[a-zA-Z]+[0-9]*[a-zA-Z]/, TokenTypes.DEFINITION]
  ];
export class Token {
    constructor(value, precedence) {
        this.value = value;
        this.precedence = precedence;
    }
}