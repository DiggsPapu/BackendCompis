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
        this.followSet = new Map();
        this.firstSet = new Map();
        this.addInitialState();
        this.constructCanonical();
        console.log(this.firstString(["expression0"]));
        console.log(this.firstString(["term"]));
        console.log(this.firstString(["factor"]));
        console.log(this.firstString(["expression"]));
        console.log(this.firstString(["term1"]));
        console.log(this.follow1("expression0"))
        console.log(this.followSet);
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
        // Rule 1, X is a terminal the First(X)={X}
        if (X.length === 1 && (this.tokens.includes(X[0])||X[0]==='')){
            return [X[0]]
        }
        if (X.length === 1 && this.noTerminals.includes(X[0])){
            let productions = this.productions.get(X[0]);
            productions.forEach((production)=>{
                // Rule 3: if X->ε, then add ε to First(X)
                if (production.length===1 && production[0]===''){
                    listF.push('');
                } else{
                    // Rule 2: if X->Y1Y2...Yn is a production then place a in First(X) if for some i, a is in First(Yi) and ε is in First(Yj) where j < i
                    let k = 0;
                    let previousPEpsilon = true;
                    while(k < production.length && previousPEpsilon){
                        let symbol = production[k];
                        // Not recursive
                        if (symbol!==X){
                            let possibleFirst = this.first([symbol]);
                            if (!possibleFirst.includes('')){
                                previousPEpsilon = false;
                            }
                            possibleFirst.map((terminal)=>{
                                if (!listF.includes(terminal)){
                                    listF.push(terminal);
                                }
                            });
                        }
                        k++;
                    }
                }
            })
        };
        return listF;
    };
    firstString(X){
        let firstS = []
        for (let k = 0; k < X.length; k++){
            if (k === 0){
                this.first([X[k]]).map((symbol)=>{
                    if (!firstS.includes(symbol)){
                        firstS.push(symbol);
                    };
                })
            } else{
                this.first([X[k]]).map((symbol)=>{
                    if (!firstS.includes(symbol) && symbol !== ''){
                        firstS.push(symbol);
                    };
                })
            }
        };
        return firstS;
    }
    follow2(X){
        // It is a non terminal
        if (this.noTerminals.includes(X)){
            // Rule 1: place $
            if (this.noTerminals[0] === X){
                if (!Array.from(this.followSet.keys()).includes(X)){
                    this.followSet.set(X, ["$"]);
                }
                else{
                    if (!this.followSet.get(X).includes("$")){
                        this.followSet.get(X).push("$")
                    }
                }
            }
            // Rule 2: everything in first is in follow(B) except epsilon
            for (let k = 0; k < this.noTerminals.length; k++){
                let anNo = this.noTerminals[k];
                let productions = this.productions.get(anNo);
                for (let i = 0; i < productions.length; i++){
                    let production = productions[i];
                    for (let j = 0; j < production.length; j++){
                        let symbol = production[j];
                        // Check the next symbol
                        if (this.noTerminals.includes(symbol)){
                            if (Array.from(this.followSet.keys()).includes(symbol) && j < production.length-1){
                                let possibleFollow = this.firstString(production[j+1]);
                                possibleFollow.map((value)=>{
                                    if (value !== ''){
                                        this.followSet.get(symbol).push(value);
                                    }
                                })
                            }
                            else if (!Array.from(this.followSet.keys()).includes(symbol) && j < production.length-1){
                                let possibleFollow = this.firstString(production[j+1]);
                                this.followSet.set(symbol, []);
                                possibleFollow.map((value)=>{
                                    if (value !== ''){
                                        this.followSet.get(symbol).push(value);
                                    }
                                })
                            }
                        }
                    }
                }
            }
        }
    }
    // X = nonTerminal
    follow1(X){
        // It is a no terminal
        if (this.noTerminals.includes(X)){
            // Rule 1: place $ in Follow(S) where S is the start symbol of the grammar
            if (this.noTerminals[0]===X){
                this.followSet.set(X, ["$"]);
            }
            // Iterate over all the productions
            for (let k = 0; k < this.noTerminals.length; k++){
                let analyzedNon = this.noTerminals[k];
                for (let j = 0; j < this.productions.get(analyzedNon).length; j++){
                    let analyzedP = this.productions.get(analyzedNon)[j];
                    for (let i = 0; i < analyzedP.length; i++){
                        let symbol = analyzedP[i];
                        if (this.noTerminals.includes(symbol)){
                            if (!Array.from(this.followSet.keys()).includes(symbol)){
                                this.followSet.set(symbol, []);
                            }
                            if (i<analyzedP.length-1){
                                // Get the next symbol and get the first
                                let possibleFollow = this.firstString([analyzedP[i+1]]);
                                possibleFollow.map((production)=>{
                                    if (!this.followSet.get(symbol).includes(production) && production !== ''){
                                        this.followSet.get(symbol).push(production);
                                    };
                                    if (this.tokens.includes(analyzedP[i+1])){
                                        i++;
                                    };
                                })
                            }
                            if (i>analyzedP.length-1){
                                // Get the next symbol and get the first
                                this.followSet.get(analyzedNon).map((production)=>{
                                    this.followSet.get(symbol).push(production);
                                })
                            }
                        }
                    }
                }
            }
        }
    }    
}
module.exports = YaPar;