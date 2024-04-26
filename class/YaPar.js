const Item = require("./Item");
const NyTerminal = require("./NYTerminal");
const NYTerminal = require("./NYTerminal");

class YaPar{
    constructor(tokens, ignoreTokens, productions){
        this.tokens = tokens;
        this.ignoreTokens = ignoreTokens;
        this.productions = productions;
        this.items = [];
        this.addInitialState();
    }
    addInitialState(){
        let items = [];
        items.push(new NYTerminal("E\'", 0, [Array.from(this.productions.keys())[0]], false));
        this.items.push(new Item("I0", items));
        console.log(this.items);
        console.log(this.items[0]);
    }
    // closure(I:Item){
    //     let J = I;
    //     let jItems = 0;
    //     while (true){
    //         // Get the length of J, while there are no more items added to J in 1 round
    //         jItems = J.length;
    //         for (let k = 0; k < J.items.length; k++){
    //             let item:NyTerminal = J.items[k];
    //             let nyTerminal = item.production[item.pos];
    //             // In case is a not terminal
    //             this.productions.get(nyTerminal);

    //         }
    //     }
    //     return J;
    // }
    
}
module.exports = YaPar;