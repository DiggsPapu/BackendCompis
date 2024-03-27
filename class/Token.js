class Token {
    constructor(value, precedence) {
        this.value = value;
        this.precedence = precedence;
    }
  }

module.exports = Token