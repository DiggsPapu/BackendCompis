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
];

export class Tokenizer {
  constructor(input) {
    this.input = input;
    this.cursor = 0;
  }

  hasMoreTokens() {
    return this.cursor < this.input.length;
  }

  match(regex, inputSlice) {
    const matched = regex.exec(inputSlice);
    if (matched === null) {
      return null;
    }

    this.cursor += matched[0].length;
    return matched[0];
  }

  getNextToken() {
    if (!this.hasMoreTokens()) {
      return null;
    }

    const inputSlice = this.input.slice(this.cursor);

    for (let [regex, type] of TokenSpec) {
      const tokenValue = this.match(regex, inputSlice);

      if (tokenValue === null) {
        continue;
      }

      if (type === null) {
        return this.getNextToken();
      }

      return {
        type,
        value: tokenValue,
      };
    }

    throw new SyntaxError(`Unexpected token: "${inputSlice[0]}"`);
  }
}

export const operators = {
  u: {
    prec: 4,
    assoc: "right",
  },
  "^": {
    prec: 4,
    assoc: "right",
  },
  "*": {
    prec: 3,
    assoc: "left",
  },
  "/": {
    prec: 3,
    assoc: "left",
  },
  "+": {
    prec: 2,
    assoc: "left",
  },
  "-": {
    prec: 2,
    assoc: "left",
  },
};

export const functionList = ["sin", "cos", "tan"];

export const assert = (predicate) => {
  if (predicate) return;
  throw new Error("Assertion failed due to invalid token");
};

export const isFunction = (token) => {
  return functionList.includes(token.toLowerCase());
};

export const generateAST = (input) => {
  const opSymbols = Object.keys(operators);
  const stack = [];
  let output = [];

  const peek = () => {
    return stack.at(-1);
  };

  const addToOutput = (token) => {
    output.push(token);
  };

  const handlePop = () => {
    const op = stack.pop();

    if (op === "(") return;

    if (op === "u") {
      return {
        type: "UnaryExpression",
        value: output.pop(),
      };
    }

    if (isFunction(op)) {
      return { type: "Function", name: op, value: output.pop() };
    }

    const right = output.pop();
    const left = output.pop();

    if (opSymbols.includes(op)) {
      return {
        type: "BinaryExpression",
        operator: op,
        left,
        right,
      };
    }
  };

  const handleToken = (token) => {
    switch (true) {
      case !isNaN(parseFloat(token)):
        addToOutput({ type: "Number", value: parseFloat(token) });
        break;
      case isFunction(token):
        stack.push(token);
        break;
      case opSymbols.includes(token):
        const o1 = token;
        let o2 = peek();

        while (
          o2 !== undefined &&
          o2 !== "(" &&
          (operators[o2].prec > operators[o1].prec ||
            (operators[o2].prec === operators[o1].prec &&
              operators[o1].assoc === "left"))
        ) {
          addToOutput(handlePop());
          o2 = peek();
        }
        stack.push(o1);
        break;
      case token === "(":
        stack.push(token);
        break;
      case token === ")":
        let topOfStack = peek();
        while (topOfStack !== "(") {
          assert(stack.length !== 0);
          addToOutput(handlePop());
          topOfStack = peek();
        }
        assert(peek() === "(");
        handlePop();
        topOfStack = peek();
        if (topOfStack && isFunction(topOfStack)) {
          addToOutput(handlePop());
        }
        break;
      default:
        throw new Error(`Invalid token: ${token}`);
    }
  };

  const tokenizer = new Tokenizer(input);
  let token;
  let prevToken = null;
  while ((token = tokenizer.getNextToken())) {
    if (
      token.value === "-" &&
      (prevToken === null ||
        prevToken.value === "(" ||
        opSymbols.includes(prevToken.value))
    ) {
      handleToken("u");
    } else {
      handleToken(token.value);
    }
    prevToken = token;
  }

  while (stack.length !== 0) {
    assert(peek() !== "(");
    addToOutput(handlePop());
  }

  return output[0];
};
