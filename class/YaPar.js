const Item = require("./Item");

class YaPar{
    constructor(tokens, ignoreTokens, productions){
        // Terminals
        this.tokens = tokens.filter((token)=>!ignoreTokens.includes(token));
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
        this.follow(this.noTerminals[0]);
        console.log(this.followSet);
        this.constructParsingTableSLR();
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
    findIndexInArrayOfArrayOfItems(C, setItems){
        for (let i = 0; i < C.length; i++){
            let possibleSet = C[i];
            if (possibleSet.length === setItems.length){
                let equal = 1;
                possibleSet.map((item)=>{
                    if (setItems.filter((item2)=>item2.name===item.name && item2.pos === item.pos && item2.production.join(" ")===item.production.join(" ")).length===1){
                        equal*=1;
                    }
                    else{
                        equal*=0;
                    }
                })
                if (equal){
                    return i;
                }
            }
        }
        return -1;
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
                    // Get the index of the setItem
                    let index = this.findIndexInArrayOfArrayOfItems(C, newSetItems);
                    if (newSetItems.length >0 && index===-1){
                        C.push(newSetItems);
                        // Add transition to the index
                        this.transitions.get(k).set(symbol, C.length-1);
                    }
                    // The setItem exist so must add a transition to it
                    else if (index!==-1){
                        this.transitions.get(k).set(symbol, index);
                    }
                }
            }
        }
        this.items = C;
        for (let k = 0; k < this.items.length; k++){
            // console.log(`I${k}: `);
            for (let j = 0; j < this.items[k].length; j++){
                // console.log(this.items[k][j]);
                // console.log(this.items[k][j].name==="E\'")
                // console.log(this.items[k][j].pos===1)
                // console.log(this.items[k][j].production)
                if (this.items[k][j].name==="E'" && this.items[k][j].pos === 1 && this.items[k][j].production[0]===Array.from(this.productions.keys())[0]){
                    this.finalState = k;
                }
            }
            // console.log("transitions:")
            // console.log(this.transitions.get(k));
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
                    // console.log(nyTerminal)
                    // console.log(productions)
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
                        // console.log(typeof(X));
                        // console.log(!X.includes(symbol))
                        // Not recursive
                        if ((typeof(X)==="string"&&symbol!==X)||(typeof(X)!=="string" && !X.includes(symbol))){
                            
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
            let possibleF = this.first([X[k]]);
            possibleF.map((symbol)=>{
                if (!firstS.includes(symbol) && symbol!==''){
                    firstS.push(symbol);
                };
            })
            if (k === X.length-1 && possibleF.includes('')){
                firstS.push('')  
            } else if (!possibleF.includes('')){
                break;
            }
        };
        return firstS;
    }
    // X = nonTerminal
    follow(X){
        let rule3 = [];
        for (let k = 0; k < this.noTerminals.length; k++){
            let analyzedNon = this.noTerminals[k];
            if (!Array.from(this.followSet.keys()).includes(analyzedNon)){
                this.followSet.set(analyzedNon, []);
            }
        }
        // It is a no terminal
        if (this.noTerminals.includes(X)){
            // Rule 1: place $ in Follow(S) where S is the start symbol of the grammar
            if (this.noTerminals[0]===X){
                this.followSet.get(X).push("$");
            }
            // Iterate over all the productions
            for (let k = 0; k < this.noTerminals.length; k++){
                let analyzedNon = this.noTerminals[k];
                for (let j = 0; j < this.productions.get(analyzedNon).length; j++){
                    let analyzedP = this.productions.get(analyzedNon)[j];
                    for (let i = 0; i < analyzedP.length; i++){
                        let symbol = analyzedP[i];
                        if (this.noTerminals.includes(symbol)){
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
                            // to get the tuples to execute rule 3
                            if (i===analyzedP.length-1){
                                let m = i;
                                while(-1<m){
                                    let symbol2 = analyzedP[m];
                                    let something = this.firstString([symbol2]);
                                    // this means it will end because it gets the follow for that one
                                    if (this.noTerminals.includes(symbol2) && !something.includes('')){
                                        rule3.push([analyzedNon, symbol2]);
                                        break;
                                    }
                                    // if it is follow because it is epsilon it will actually count to follow
                                    else if (this.noTerminals.includes(symbol2)){
                                        rule3.push([analyzedNon, symbol2]);
                                    }
                                    // if it is a nonterminal it stops
                                    else if (this.tokens.includes(symbol2)){
                                        break;
                                    };
                                    m--;
                                }
                            }
                        }
                    }
                }
            }
        }
        // rule 3: update if they have the same
        for (let j = 0; j < rule3.length; j++){
            let pairs = rule3[j];
            this.followSet.get(pairs[0]).map((symbol)=>{
                if (!this.followSet.get(pairs[1]).includes(symbol)){
                    this.followSet.get(pairs[1]).push(symbol);
                }
            })
        }
    }
    constructParsingTableLL(){
        let parsingTable = Array.from({ length: this.noTerminals.length }, () => Array.from({ length: this.tokens.length+1 }, () => null));
        for (let k = 0; k < this.noTerminals.length; k++){
            let analyzedNon = this.noTerminals[k];
            for (let j = 0; j < this.productions.get(analyzedNon).length; j++){
                let production = this.productions.get(analyzedNon)[j];
                let terminals = this.firstString(production);
                for (let l = 0; l < terminals.length; l++){
                    let terminal = terminals[l];
                    // If it is a terminal or is epsilon
                    // Rule 1: for each terminal a in first(alpha), add A->alpha to M[A,a]
                    if (this.tokens.includes(terminal)){
                        parsingTable[k][this.tokens.indexOf(terminal)] = production;
                    }
                }
                // Rule 2: if ε is in first(alpha, then for each terminal b) 
                if (terminals.includes('')){
                    this.followSet.get(analyzedNon).map((terminal)=>{
                        if (this.tokens.includes(terminal)){
                            parsingTable[k][this.tokens.indexOf(terminal)] = production;
                        } 
                        // Will be the last 
                        else if (terminal==='$'){
                            parsingTable[k][this.tokens.length] = production;
                        };
                    });
                };   
            }
        }
        return parsingTable;
    }
    constructParsingTableSLR(){
        // Already created the C collection of items
        let actionTable = Array.from({ length: this.items.length }, () => Array.from({ length: this.tokens.length+1 }, () => null));
        let goToTable = Array.from({ length: this.items.length }, () => Array.from({ length: this.noTerminals.length }, () => null));
        let errors = ``;
        // state i constructed from Ii 
        for (let i = 0; i < this.items.length; i++){
            let Ii = this.items[i];
            // CONSTRUCT ACTION TABLE
            // b
            let something = Ii.filter((item=>item.pos===item.production.length && item.name !== "E\'"));
            if (something.length>0){
                for (let k = 0; k < something.length; k++){
                    this.followSet.get(something[k].name).map(
                        (terminal)=>{
                            if(terminal!=="$"){
                                // Possible RR error
                                if (actionTable[i][this.tokens.indexOf(terminal)]===null){
                                    actionTable[i][this.tokens.indexOf(terminal)]= something[k];
                                }
                                else{
                                    errors+=`Error: Reduction-Reduction conflict in Action Table [I${i}][${terminal}] = reduce ${actionTable[i][this.tokens.indexOf(terminal)].name} -> ${actionTable[i][this.tokens.indexOf(terminal)].production.join(" ")} or reduce ${something[k].name} -> ${something[k].production.join(" ")} \n`;
                                }
                            }
                            else{
                                actionTable[i][this.tokens.length]= something[k];
                            }
                        }
                    );
                }
            }
            // c    
            if (Ii.filter((item=>item.pos===item.production.length && item.name === "E\'")).length>0){
                actionTable[i][this.tokens.length] = 'accept';
            }
            for (let k = 0; k < this.tokens.length; k++){
                let terminal = this.tokens[k];
                // a
                let j = this.findIndexInArrayOfArrayOfItems(this.items,this.goTo(Ii, terminal));
                let values = Ii.filter(((item)=>item.pos<=item.production.length-1 && item.production[item.pos]===terminal));
                if (values.length>0 && j!==-1 && actionTable[i][k]===null){
                    actionTable[i][k] = `s${j}`;
                }
                // Conflict shift-reduction
                else if (values.length>0 && j!==-1 && actionTable[i][k]!==null){
                    errors+=`Error: Shift-Reduction conflict in Action Table [I${i}][${terminal}] = shift ${j} or  reduce ${actionTable[i][k].name} -> ${actionTable[i][k].production.join(" ")} \n`;
                }
            }
            // CONSTRUCT GO TO TABLE
            for (let k = 0; k < this.noTerminals.length; k++){
                let j = this.findIndexInArrayOfArrayOfItems(this.items,this.goTo(Ii, this.noTerminals[k]));
                if (j !== -1){
                    goToTable[i][k] = j;
                }
            }
        }
        this.actionTable = actionTable;
        this.goToTable = goToTable;
        if (errors!==``){
            console.error(errors);
            throw new Error(errors);
        }
    }
    parsingAlgorithm(w){
        let response = `<table width:"100%" border="1" cellborder:"0" cellspacing="0"><tr><th>STACK<th/><th>SYMBOLS<th/><th>INPUT<th/><th>ACTION<th/><tr/>`;
        w.push("$");
        let a = w[0];
        let stack = [0];
        let symbols = [];
        let pos = 0;
        let hasErrors = false;
        while (true){
            let s = stack[stack.length-1];
            let value = null;
            if (w[pos]!=="$"){
                value = this.actionTable[s][this.tokens.indexOf(w[pos])];
            }
            else{
                value = this.actionTable[s][this.tokens.length];
            }            
            // It is shift
            if (typeof(value)==="string" && value!=="accept"){
                response+=`<tr><td>${stack.join(",")}]<td/><td>[${symbols.join(",")}]<td/><td>[${w.slice(pos, w.length-1)}]<td/><td>${value}<td/><tr/>`;
                // console.log(this.actionTable[s][this.tokens.indexOf(w[pos])])
                stack.push(parseInt(this.actionTable[s][this.tokens.indexOf(w[pos])].slice(1)));
                symbols.push(value);
                pos++;
            }
            // It is an item, is reduce
            else if (value!==null&& value!=="accept" && value!==undefined){
                value.production.map(()=>{
                    stack.pop();
                });
                stack.push(this.goToTable[stack[stack.length-1]][this.noTerminals.indexOf(value.name)]);
                console.log(`${value.name}->${value.production.join(" ")}`);
                response+=`<tr><td>[${stack.join(",")}]<td/><td>[${symbols.join(",")}]<td/><td>[${w.slice(pos, w.length-1)}]<td/><td>${value.name}->${value.production.join(" ")}<td/><tr/>`
                // pos++;
            }
            // Acceptance
            else if (value==="accept"){
                response+=`<tr><td>[${stack.join(",")}]<td/><td>[${symbols.join(",")}]<td/><td>[${w.slice(pos, w.length-1)}]<td/><td>accept<td/><tr/>`
                break;
            }
            // Recovery
            else{
                response += `<tr><td>Error with token ${w[pos]}, unexpected token in position ${pos.toString()}<td/><tr/>`;
                hasErrors = true;
                if (w.length === pos){
                    break;
                }
                // continue parsing
                pos++;
            }
        }
        console.log(response);
        if (hasErrors){
            return {response:response, accept: false};
        }
        return {response:response, accept: true};        
    }
}
module.exports = YaPar;