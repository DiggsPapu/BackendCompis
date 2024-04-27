const Item = require("./Item");

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
        for (let i = 0; i < value.length; i++){
            console.log(value[i]);
        }
        this.countItems = 0;
        console.log("_____________________________")
        value = this.goTo([value], "lparen");
        for (let i = 0; i < value.length; i++){
            console.log(value[i]);
        }
    }
    addInitialState(){
        let items = [];
        items.push(new Item("E\'", 0, [Array.from(this.productions.keys())[0]], false));
        this.items.push(items);
    }
    itemInArray(C, item){
        for (let k = 0; k < C.length; k++){
            let comparedItem = C[k];
            if (comparedItem.name !== item.name){
                for (let j = 0; j < comparedItem.items.length; j++){

                }
            }
        }
        return false;
    }
    constructCanonical(){
        let C = [this.closure(this.items[0])];
        let grammarSymbols = this.tokens.filter((token)=>!this.ignoreTokens.has(token));
        while (true){
            for (let k = 0; k < C.length; k++){
                let item = C[k];
                for (let j = 0; j < grammarSymbols.length; j++){
                    let symbol = grammarSymbols[j];

                    // if (C.filter((item)=>item.items()))
                }
            }
        }
    }
    goTo(I, X){
        let newItem = [];
        for (let k = 0; k < I.length; k++){
            let itemsList = I[k];
            for (let j = 0; j < itemsList.length; j++){
                // console.log("hola")
                // If the next value is equal to X that is YNTerminal
                if (itemsList[j].production[itemsList[j].pos]===X){
                    // console.log(itemsList[j])
                    // console.log(itemsList[j].production)
                    // console.log(itemsList[j].production[itemsList[j].pos+1])
                    let newTerminal =  new Item(itemsList[j].name, itemsList[j].pos+1, itemsList[j].production, false);
                    let newItem1 = [newTerminal];
                    // console.log(newItem.items);
                    
                    newItem.push(newTerminal);
                    newItem = this.closure(newItem1);
                    // console.log("Return:")
                    // console.log(item2)
                    // newItem = [...newItem,...item2];
                    // console.log(newItem)
                }
                // console.log("Valor: ");
                // console.log(newItem)
            }
        }
        // console.log("final:")
        // console.log(newItem);
        return newItem;
    }
    closure(I){
        // console.log("enter closure")
        let J = I;
        let jItems = 0;
        let counter = 0;
        // console.log(J.items.length)
        while (jItems !== J.length){
            // Get the length of J, while there are no more items added to J in 1 round
            jItems = J.length;
            for (let k = 0; k < J.length; k++){
                let item = J[k];
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
                        if (J.filter((ynterminal)=>
                            ynterminal.pos === 0  && ynterminal.production.join(" ") === productions[j].join(" ")
                        ).length===0){
                            J.push(new Item(nyTerminal, 0, productions[j], false))
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