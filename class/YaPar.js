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
        console.log(this.first(["expression0"]));
        console.log(this.first(["term"]));
        console.log(this.first(["factor"]));
        console.log(this.first(["expression"]));
        console.log(this.first(["term1"]));
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
    // X = nonTerminal
    follow1(X){
        // First one append "$"
        if (this.noTerminals[0]===X){
            this.followSet.set(X, []);
            this.followSet.get(X).push("$");
        }    
        // Get the productions
        let productions = this.productions.get(X);
        productions.forEach((production)=>{
            let k = 0;
            while (k < production.length){
                let value = production[k];
                if (this.noTerminals.includes(value)){
                    // It's new
                    if (!Array.from(this.followSet.keys()).includes(value)){
                        this.followSet.set(value, []);
                        this.follow1(value);
                    }
                    if (k < production.length+1){
                        let first = this.first(production.slice(k+1));
                        first.map((val)=>{
                            if (!this.followSet.get(value).includes(val) && val!==''){
                                this.followSet.get(value).push(val);
                            }
                        });
                    }
                    if ((k+1<production.length && this.first(production.slice(k+1)).includes(''))||k+1>=production.length){
                        console.log(X);
                        this.followSet.get(X).map((el)=>{
                            if (el!==''){
                                this.followSet.get(value).push(el);
                            }
                        })
                    }
                }
                k++;
            };
        });    
    }
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