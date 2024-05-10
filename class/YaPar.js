const Item = require("./Item");

class YaPar{
    constructor(tokens, ignoreTokens, productions){
        // Terminals
        this.tokens = tokens;
        this.ignoreTokens = ignoreTokens;
        this.productions = productions;
        this.items = [];
        this.finalState = 0;
        this.transitions = new Map();
        this.noTerminals = Array.from(this.productions.keys());
        this.addInitialState();
        this.constructCanonical();
        console.log(this.first(["expression0"]));
        console.log(this.first(["term"]));
        console.log(this.first(["factor"]));
        console.log(this.first(["expression"]));
        console.log(this.first(["term1"]));
        console.log(this.follow())
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
                        this.transitions.get(k).set(symbol, C.length-1);
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
                // console.log(this.items[k][j].name==="E\'")
                // console.log(this.items[k][j].pos===1)
                // console.log(this.items[k][j].production)
                if (this.items[k][j].name==="E'" && this.items[k][j].pos === 1 && this.items[k][j].production[0]===Array.from(this.productions.keys())[0]){
                    this.finalState = k;
                }
            }
            console.log("transitions:")
            console.log(this.transitions.get(k));
        };
        // console.log(this.finalState);
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
                // console.log(itemsList[j].production[itemsList[j].p0os+1])
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
                // In case is a not terminal, not undefined and is not epsilon
                if (!this.tokens.includes(nyTerminal) && nyTerminal !== undefined && nyTerminal != ''){
                    // console.log(nyTerminal)
                    let productions = this.productions.get(nyTerminal);
                    console.log(nyTerminal)
                    console.log(productions)
                    for (let j = 0; j < productions.length; j++){
                        // console.log("NYTErminal: "+nyTerminal+"\nproductions: "+productions[j]);
                        // console.log("YTProduction1:"+ynterminal.production.join(" ")+"Production2:"+ productions[j].join(" "))
                    //     console.log(J.items.filter((ynterminal)=>
                    //     ynterminal.pos === 0  && ynterminal.production.join(" ") === productions[j].join(" ")
                    // ).length>0)
                    // If the item is not already in the set
                        if (J.filter((ynterminal)=>
                            ynterminal.pos === 0  && ynterminal.production.join(" ") === productions[j].join(" ") && nyTerminal == ynterminal.name
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
    };
    first(X){
        let listF = [];
        for (let k = 0; k < X.length; k++){
            let symbol = X[k];
            // It's a terminal and is in the first position: X-> aBC
            if (k === 0 && this.tokens.includes(symbol)){
                return [symbol];
            }
            // It's a terminal && haven't been pushed: X->ABCdER
            else if (this.tokens.includes(symbol) && !listF.includes(symbol)){
                listF.push(symbol)
            }
            // It's epsilon and haven't been pushed
            else if (symbol === '' && !listF.includes('')){
                listF.push('');
            }
            // It's a non terminal
            else if (this.noTerminals.includes(symbol)){
                // Get the productions
                let productions = this.productions.get(symbol);
                for (let j = 0; j < productions.length; j++){
                    // Left Recursion, ignored
                    if (productions[j][0]!== symbol){
                        let returnedList = this.first(productions[j]);
                        returnedList.map((value)=>{
                            if (!listF.includes(value)){listF.push(value);};
                        });
                    };
                };
            };
            return listF;
        };
    };
    follow() {
        let followSet = new Map();
        let keys = Array.from(this.productions.keys());
        for (let k = 0; k < keys.length; k++){
            let key = keys[k];
            // create a new set for the key
            followSet.set(key, []);
            // If it's the initial key append $
            if (k === 0){
                followSet.get(key).push("$");
            };
            let productions = this.productions.get(key);
            for (let j = 0; j < productions.length; j++){
                let production = productions[j];
                // Work from the last index to the first one
                for (let i = production.length-1; i > -1; i--){
                    let possibleFollow = this.first([production[i]]);
                    possibleFollow.map((value)=>{
                        // If it is not already in the set is pushed inside
                        if (!followSet.get(key).includes(value) && value!==''){
                            followSet.get(key).push(value);
                        };
                    })
                    // If it doesn't has epsilon
                    if (!possibleFollow.includes('')){
                        break;
                    }
                }   
            }
        };
        return followSet;
    }
    
}
module.exports = YaPar;