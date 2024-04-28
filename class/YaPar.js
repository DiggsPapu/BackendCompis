const Item = require("./Item");

class YaPar{
    constructor(tokens, ignoreTokens, productions){
        this.tokens = tokens;
        this.ignoreTokens = ignoreTokens;
        this.productions = productions;
        this.items = [];
        this.transitions = new Map();
        this.addInitialState();
        this.constructCanonical();
    }
    addInitialState(){
        let items = [];
        items.push(new Item("E\'", 0, [Array.from(this.productions.keys())[0]]));
        this.items.push(items);
    }
    setItemsInArray(C, setItems) {
        return C.some(items => {
            return items.every(item => {
                return setItems.some(item1 => {
                    return JSON.stringify(item1) === JSON.stringify(item);
                });
            });
        });
    }
    findIndexInArrayOfArrayOfItems(C, setItems) {
        for (let i = 0; i < C.length; i++) {
            if (C[i].every(item => {
                return setItems.some(item1 => {
                    return JSON.stringify(item1) === JSON.stringify(item);
                });
            })) {
                return i; // Return the index if setItems are found
            }
        }
        return -1; // Return -1 if setItems are not found in any array
    }
    
    constructCanonical(){
        let C = [this.closure(this.items[0])];
        let grammarSymbols = ["E\'", ...Array.from(this.productions.keys()), ...this.tokens.filter((token)=>!this.ignoreTokens.includes(token))];
        console.log(grammarSymbols);
        let lengthC = 0;
        while (lengthC!==C.length){
            lengthC = C.length
            for (let k = 0; k < C.length; k++){
                let setItem = C[k];
                // Create the transitions for the setItem (State)
                this.transitions.set(k, new Map());
                // console.log(setItem);
                for (let j = 0; j < grammarSymbols.length; j++){
                    let symbol = grammarSymbols[j];
                    // console.log(symbol);
                    let newSetItems = this.goTo(setItem, symbol);
                    // console.log(newSetItems)
                    // console.log("Found: "+this.setItemsInArray(C, newSetItems)+"    index:"+this.findIndexInArrayOfArrayOfItems(C, newSetItems));
                    if (newSetItems.length >0 && !this.setItemsInArray(C, newSetItems)){
                        C.push(newSetItems);
                        // Add transition to the index
                        this.transitions.get(k).set(symbol, C.length-1)
                    }
                    // The setItem exist so must add a transition to it
                    else{
                        // Get the index of the setItem
                        let index = this.findIndexInArrayOfArrayOfItems(C, newSetItems);
                        if (index!==-1){
                            this.transitions.get(k).set(symbol, index);
                        }
                    }
                }
            }
        }
        this.items = C;
        for (let k = 0; k < this.items.length; k++){
            console.log(`I${k}: `);
            for (let j = 0; j < this.items[k].length; j++){
                console.log(this.items[k][j]);
            }
            console.log("transitions:")
            console.log(this.transitions.get(k));
        }
    }
    goTo(I, X){
        let newItem = [];
        for (let k = 0; k < I.length; k++){
            // console.log("hola")
            let item = I[k];
            // console.log(item)
            if (item.production[item.pos]===X){
                // console.log(itemsList[j])
                // console.log(itemsList[j].production)
                // console.log(itemsList[j].production[itemsList[j].pos+1])
                let newTerminal =  new Item(item.name, item.pos+1, item.production);
                let newItem1 = [newTerminal];
                // console.log(newItem.items);
                
                newItem.push(newTerminal);
                let newItems = this.closure(newItem1);
                // Append the values checking they are unique and haven't been appended before
                for (let j = 0; j < newItems.length; j++){
                    if (newItem.filter((item)=>
                    item.pos === newItems[j].pos && item.production.join(" ") === newItems[j].production.join(" ")
                    ).length===0){
                        newItem.push(newItems[j]);
                    }
                }
                

                // console.log("Return:")
                // console.log(item2)
                // newItem = [...newItem,...item2];
                // console.log(newItem)
            }
        }
        // console.log("final:")
        // console.log(newItem);
        return newItem;
    }
    closure(I){
        // console.log("enter closure");
        let J = I;
        let jItems = 0;
        // console.log(J.items.length)
        while (jItems !== J.length){
            // Get the length of J, while there are no more items added to J in 1 round
            jItems = J.length;
            for (let k = 0; k < J.length; k++){
                let item = J[k];
                let nyTerminal = item.production[item.pos];
                // In case is a not terminal
                if (!this.tokens.includes(nyTerminal) && nyTerminal !== undefined){
                    // console.log(nyTerminal)
                    let productions = this.productions.get(nyTerminal);
                    // console.log(this.productions)
                    for (let j = 0; j < productions.length; j++){
                        // console.log("NYTErminal: "+nyTerminal+"\nproductions: "+productions[j]);
                        // console.log("YTProduction1:"+ynterminal.production.join(" ")+"Production2:"+ productions[j].join(" "))
                    //     console.log(J.items.filter((ynterminal)=>
                    //     ynterminal.pos === 0  && ynterminal.production.join(" ") === productions[j].join(" ")
                    // ).length>0)
                    // If the item is not already in the set
                        if (J.filter((ynterminal)=>
                            ynterminal.pos === 0  && ynterminal.production.join(" ") === productions[j].join(" ")
                        ).length===0){
                            J.push(new Item(nyTerminal, 0, productions[j]))
                        }
                    }
                }
                // If it has an ignore token it throws an error
                else if (this.ignoreTokens.includes(nyTerminal)){
                    throw Error(`The grammar is incorrect, it has an ignore token: ${nyTerminal}`)
                }
            }
        }
        return J;
    }
    
}
module.exports = YaPar;