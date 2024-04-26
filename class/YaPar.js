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
        // console.log(this.items[0])
        let value = this.closure(this.items[0]);
        // console.log(value)
        for (let i = 0; i < value.items.length; i++){
            console.log(value.items[i]);
        }
    }
    addInitialState(){
        let items = [];
        items.push(new NYTerminal("E\'", 0, [Array.from(this.productions.keys())[0]], false));
        this.items.push(new Item("I0", items));
        // console.log(this.items);
        // console.log(this.items[0]);
        // console.log(this.items[0].items[0]);
    }
    closure(I){
        console.log("enter closure")
        let J = I;
        let jItems = 0;
        let counter = 0;
        console.log(J.items.length)
        while (jItems !== J.items.length && counter<10){
            // Get the length of J, while there are no more items added to J in 1 round
            jItems = J.items.length;
            for (let k = 0; k < J.items.length; k++){
                let item = J.items[k];
                let nyTerminal = item.production[item.pos];
                // In case is a not terminal
                if (!this.tokens.includes(nyTerminal)){
                    let productions = this.productions.get(nyTerminal);
                    for (let j = 0; j < productions.length; j++){
                        // console.log("NYTErminal: "+nyTerminal+"\nproductions: "+productions[j]);
                        // console.log("YTProduction1:"+ynterminal.production.join(" ")+"Production2:"+ productions[j].join(" "))
                    //     console.log(J.items.filter((ynterminal)=>
                    //     ynterminal.pos === 0  && ynterminal.production.join(" ") === productions[j].join(" ")
                    // ).length>0)
                        if (J.items.filter((ynterminal)=>
                            ynterminal.pos === 0  && ynterminal.production.join(" ") === productions[j].join(" ")
                        ).length===0){
                            J.items.push(new NyTerminal(nyTerminal, 0, productions[j], false))
                        }
                    }
                }
                else if (this.ignoreTokens.includes(nyTerminal)){
                    throw Error(`The grammar is incorrect, it has an ignore token: ${nyTerminal}`)
                }
            }
        }
        counter++;
        return J;
    }
    
}
module.exports = YaPar;