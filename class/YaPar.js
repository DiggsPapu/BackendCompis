const Item = require("./Item");
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
        this.countItems = 0;
        console.log("_____________________________")
        value = this.goTo([value], "lparen");
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
    goTo(I, X){
        let newItem = new Item(`I${this.items.length}`, []);
        for (let k = 0; k < I.length; k++){
            let itemsList = I[k].items;
            for (let j = 0; j < itemsList.length; j++){
                console.log("hola")
                // If the next value is equal to X that is YNTerminal
                if (itemsList[j].production[itemsList[j].pos]===X){
                    // console.log(itemsList[j])
                    // console.log(itemsList[j].production)
                    console.log(itemsList[j].production[itemsList[j].pos+1])
                    let newTerminal =  new NYTerminal(itemsList[j].production[itemsList[j].pos+1], itemsList[j].pos+1, itemsList[j].production, false);
                    let newItem1 = new Item(X, [newTerminal]);
                    // console.log(newItem);
                    // console.log(newItem.items);
                    
                    newItem.items.push(newTerminal);
                    let item2 = this.closure(newItem1);
                    console.log("Return:")
                    // console.log(item2)
                    newItem.items = [...newItem.items,...item2.items];
                    console.log(newItem)
                }
                console.log("Valor: ");
                console.log(newItem)
            }
        }
        console.log("final:")
        console.log(newItem);
        return newItem;
    }
    closure(I){
        // console.log("enter closure")
        let J = I;
        let jItems = 0;
        let counter = 0;
        // console.log(J.items.length)
        while (jItems !== J.items.length){
            // Get the length of J, while there are no more items added to J in 1 round
            jItems = J.items.length;
            for (let k = 0; k < J.items.length; k++){
                let item = J.items[k];
                let nyTerminal = item.production[item.pos];
                // In case is a not terminal
                if (!this.tokens.includes(nyTerminal)){
                    let productions = this.productions.get(nyTerminal);
                    // console.log(this.productions)
                    for (let j = 0; j < productions.length; j++){
                        // console.log("NYTErminal: "+nyTerminal+"\nproductions: "+productions[j]);
                        // console.log("YTProduction1:"+ynterminal.production.join(" ")+"Production2:"+ productions[j].join(" "))
                    //     console.log(J.items.filter((ynterminal)=>
                    //     ynterminal.pos === 0  && ynterminal.production.join(" ") === productions[j].join(" ")
                    // ).length>0)
                        if (J.items.filter((ynterminal)=>
                            ynterminal.pos === 0  && ynterminal.production.join(" ") === productions[j].join(" ")
                        ).length===0){
                            J.items.push(new NYTerminal(nyTerminal, 0, productions[j], false))
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