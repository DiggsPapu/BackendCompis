class Tokenizer {
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
};
module.exports = Tokenizer