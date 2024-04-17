
/**
 * Clase para modelar estados del AFN/AFD
 *
 * tiene:
 *
 * - label
 * - un mapa (diccionario) con transiciones
 *
 */

class State {
  constructor(label, transitions) {
    this.label = label;
    this.transitions = transitions;
  }
}



;

/**
 * Clase con el NFA a construir, incluye:
 *
 * - un alfabeto,
 * - una coleccion de estados
 * - un estado inicial,
 * - un(os) estado(s) de aceptacion,
 * - las transiciones
 *
 */

// esta es la clase del afn
class NFA {
  constructor(initialState, finalState, states, alphabet, transitions) {
    // estos solo son revisiones para ver si los parametros ingresados con correctos, luego construye el objeto

    if (!Array.isArray(alphabet)) {
      let arr = [];
      arr.push(alphabet.toString());
      alphabet = arr;
    }

    if (!(transitions instanceof Map)) {
      console.error("transitions must be a map");
    }
    this.initialState = initialState;
    this.finalState = finalState;
    this.states = states;
    this.alphabet = alphabet;
    this.transitions = transitions;
  }
  // E closure para un conjunto de estados T
  eClosureT(T, nfa){
    // Creamos un stack
    let stack = [...T];
    // Hacemos el conjunto de closure
    let E_closure = [...T];
    // Siempre y cuando el stack no este vacio estaremos en el while
    while (stack.length > 0) {
      //  sacamos un elemento del stack
      let t = stack.pop();
      // Si la transicion tiene epsilon elementos
      if (t.transitions.has("ε")) {
        // En caso de que sea una transicion a un solo elemento
        if (typeof(t.transitions.get("ε"))==="string"){
          // Se asigna el unico elemento
          let u = t.transitions.get("ε");
          // Se asegura que el eclosure no incluya el elemento y que si exista el estado
          if (!(E_closure.includes(u)) && nfa.states.find((s) => s.label === u) !== undefined && E_closure.filter((s) => s.label === u).length===0) {
            // Asignamos un valor del estado
            let value = nfa.states.find((s) => s.label === u);
            // Creamos un nuevo estado en memoria para no usar apuntadores
            let newState = new State(value.label, value.transitions);
            // Pusheamos en stack
            stack.push(newState);
            // Pusheamos en eclosure
            E_closure.push(newState);
          };
        }
        // Lo mismo pero se hace un for para recorrer una lista con multiples estados a epsilon
        else{
          for (let i = 0; i < t.transitions.get("ε").length; i++) {
            let u = t.transitions.get("ε")[i];
            if (!(this.checkState(u,E_closure)) && nfa.states.find((s) => s.label === u) !== undefined) {
              let value = nfa.states.find((s) => s.label === u);
              let newState = new State(value.label, value.transitions);
              stack.push(newState);
              E_closure.push(new State(value.label, value.transitions));
            };
          };
        };
      };
    };
    return E_closure;
  };
  checkState = (newState, stack) => {
    for (let stackIndex = 0; stackIndex < stack.length; stackIndex++){
      if (stack[stackIndex].label===newState){
        return true;
      };
    };
    return false;
  };
  move(T, symbol, nfa){
    // crear nuevo set de estados que retornara con un symbolo
    let U = [];
    for (let i=0; i < T.length; i++) {
      let transitions = T[i].transitions.get(symbol);
      if (transitions!==undefined && typeof(transitions)==="string"){
        U.push(nfa.states.find((s) => s.label === transitions));
      }
      else if (transitions!==undefined){
        for (let label in transitions) {
          // console.log(label)
          U.push(nfa.states.find((s) => s.label === label));
        };
      }
    };
    return U;
  };

  // Inicializar la simulacion
  simulate = (input) => {
    // Inicializar el estado 0
    let S = this.eClosureT([this.initialState], this);
    let indexInput = 0;
    let c = input.charCodeAt(indexInput).toString();
    
    while (indexInput<input.length) {
      S = this.eClosureT(this.move(S, c, this),this);
      indexInput++;
      c = input.charCodeAt(indexInput).toString();
    };
    for (let indexState = 0; indexState < S.length; indexState++) {
      if (typeof(this.finalState)!==Array && S[indexState].label === this.finalState.label){
        return [true, S];
      } 
      else if (this.checkState(S[indexState].label, this.finalState)){
        return [true, S];
      };
    };
    return [false, S];
  };

  // YalexSimulation
  yalexSimulate = (input, indexInput) => {
    let finalState = [];
    let lastFinalStateInput = 0;
    let tempVal = false;
    // Inicializar el estado 0
    let S = this.eClosureT([this.initialState], this);
    // console.log(S)
    let c = input.charCodeAt(indexInput).toString();
    // console.log(c);
    while (indexInput<input.length) {
      S = this.eClosureT(this.move(S, c, this),this);
      // console.log(S)
      for (let indexState = 0; indexState < S.length; indexState++) {
        if (typeof(this.finalState)!==Array && S[indexState].label === this.finalState.label){
          finalState = S;
          lastFinalStateInput = indexInput;
          tempVal = true;
        } 
        else if (this.checkState(S[indexState].label, this.finalState)){
          finalState = S;
          lastFinalStateInput = indexInput;
          tempVal = true;
        };
      };
      indexInput++;
      c = input.charCodeAt(indexInput).toString();
      // console.log(c);
    };
    for (let indexState = 0; indexState < S.length; indexState++) {
      if (typeof(this.finalState)!==Array && S[indexState].label === this.finalState.label){
        return [true, indexInput, S];
      } 
      else if (this.checkState(S[indexState].label, this.finalState)){
        return [true, indexInput, S];
      };
    };
    return [tempVal, lastFinalStateInput, finalState];
  };
  // YalexSimulation
  yalexSimulate = (input, indexInput) => {
    // console.log(input);
    // Inicializar el estado 0
    let S = this.eClosureT([this.initialState], this);
    // console.log(S)
    let c = input[indexInput];
    // console.log(c);
    while (indexInput<input.length) {
      S = this.eClosureT(this.move(S, c, this),this);
      // console.log(S)
      for (let indexState = 0; indexState < S.length; indexState++) {
        if (typeof(this.finalState)!==Array && S[indexState].label === this.finalState.label){
          // console.log("1salgo")
          return [true, indexInput, S];
        } 
        else if (this.checkState(S[indexState].label, this.finalState)){
          // console.log("2salgo")
          return [true, indexInput, S];
        };
      };
      indexInput++;
      c = input[indexInput];
      // console.log(c);
    };
    for (let indexState = 0; indexState < S.length; indexState++) {
      if (typeof(this.finalState)!==Array && S[indexState].label === this.finalState.label){
        return [true, indexInput, S];
      } 
      else if (this.checkState(S[indexState].label, this.finalState)){
        return [true, indexInput, S];
      };
    };
    return [false, indexInput, S];
  };
  
  addInitNode(){
    if (this.initialState.label !== "init"){
      let transitions = new Map();
      transitions.set("ε", [this.initialState.label]);
      let q0 = new State("init", transitions);
      this.initialState = q0;
      this.transitions.set("init", transitions);
      this.states.push(q0);
    };
  };
  changeStates(val){
    for (let k = 0; k < this.states.length; k++){
      let state = this.states[k];
      this.transitions.delete(state.label);
      state.label = "q"+(parseInt(state.label.substring(1))+val).toString();
      let arrayTransitions = Array.from(state.transitions.keys());
      for (let j = 0; j<arrayTransitions.length; j++){
        let newTransition = "q"+(parseInt(state.transitions.get(arrayTransitions[j]).substring(1))+val).toString();
        state.transitions.delete(arrayTransitions[j]);
        state.transitions.set(arrayTransitions[j], newTransition);
      };
    };
    for (let i = 0; i < this.states.length; i++){
      this.transitions.set(this.states[i].label, this.states[i].transitions);
    };
  }
  addDFA(dfa){
    this.addInitNode()
    // append the new states
    this.states = [...this.states, ...dfa.states];
    // append the new values
    let arrayTransitions = Array.from(dfa.transitions.keys());
    // append the new transitions
    for (let j = 0; j<arrayTransitions.length; j++){
      this.transitions.set(arrayTransitions[j], dfa.transitions.get(arrayTransitions[j]));
    };
    // extend the alphabet
    this.alphabet = [...this.alphabet, ...dfa.alphabet];
    // extend the final states
    this.finalState = [...this.finalState, ...dfa.finalState];
    // connect the init node to the initial state in dfa
    let transitions = this.initialState.transitions.get("ε");
    transitions.push(dfa.initialState.label);
    // update the transition of the init in the transitions map
    this.transitions.delete("init");
    this.transitions.set("init", this.initialState.transitions);
  };
  serializeAutomathon(){
    // It can serialize a dfa or a nfa
    this.serialized = {};
    this.serialized.alphabet = this.alphabet;
    let serializedStates = {};
    let serializedTransitions = {};
    let finalStates = {}
    for (let k = 0; k < this.states.length; k++){
      let keyTransitions = Array.from(this.states[k].transitions.keys());
      let serializedTransitions = {}
      for (let i = 0; i < keyTransitions.length; i++){
        serializedTransitions[keyTransitions[i]] = this.states[k].transitions.get(keyTransitions[i]);
      };
      serializedStates[this.states[k].label.toString()] = serializedTransitions;
      // If is initial state
      if (this.initialState.label === this.states[k].label){
        this.serialized['initialState'] = {"name":this.states[k].label, "transitions": serializedStates[this.states[k].label]};
      }
      // If is final state
      if (this.finalState.filter((state)=> state.label === this.states[k].label).length>0){
        finalStates[this.states[k].label.toString()] = serializedStates[this.states[k].label];
      }
    };
    this.serialized.states = serializedStates;
    this.serialized.finalStates = finalStates;
    this.serialized = JSON.stringify(this.serialized);
  };
  deSerializeAutomathon(serializeAutomathon){
    let parsedSerializeAutomathon = JSON.parse(serializeAutomathon);
    let alphabet = parsedSerializeAutomathon["alphabet"];
    let states = [];
    let finalStates = [];
    let initialState = null;
    let keysFinalStates = Object.keys(parsedSerializeAutomathon["finalStates"]);
    let newTransitions = new Map();
    for (let stateName in parsedSerializeAutomathon.states){
      let transitions = new Map();
      // Get the transitions
      for (let key in parsedSerializeAutomathon["states"][stateName]){
        transitions.set(key, parsedSerializeAutomathon["states"][stateName][key]);
      }
      let newState = new State(stateName, transitions);
      states.push(newState);
      // Get initial state
      if (stateName === parsedSerializeAutomathon["initialState"]["name"]){
        initialState = newState;
      }
      // Check if is final state
      if (keysFinalStates.includes(stateName)){
        finalStates.push(newState);
      }
      newTransitions.set(stateName, transitions);
    }
    return new NFA(initialState, finalStates, states, alphabet, newTransitions);
  }
};


const fs = require('fs');
function tokenize(filepath){
    // Deserialize the yalex Automathon
    let yalexNFA = {"alphabet":[32,9,10,49,50,51,52,53,54,55,56,57,48,43,42,40,41,45,47,61,94,105,102,119,104,105,108,101,102,111,114,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,49,50,51,52,53,54,55,56,57,48],"initialState":{"name":"init","transitions":{"ε":["q0","q2","q5","q7","q9","q11","q13","q15","q17","q19","q21","q24","q30","q34"]}},"states":{"q0":{"9":"q1","10":"q1","32":"q1"},"q1":{"9":"q1","10":"q1","32":"q1"},"init":{"ε":["q0","q2","q5","q7","q9","q11","q13","q15","q17","q19","q21","q24","q30","q34"]},"q2":{"48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3"},"q3":{"48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3"},"q5":{"43":"q6"},"q6":{},"q7":{"42":"q8"},"q8":{},"q9":{"40":"q10"},"q10":{},"q11":{"41":"q12"},"q12":{},"q13":{"45":"q14"},"q14":{},"q15":{"47":"q16"},"q16":{},"q17":{"61":"q18"},"q18":{},"q19":{"94":"q20"},"q20":{},"q21":{"105":"q22"},"q22":{"102":"q23"},"q23":{},"q24":{"119":"q25"},"q25":{"104":"q26"},"q26":{"105":"q27"},"q27":{"108":"q28"},"q28":{"101":"q29"},"q29":{},"q30":{"102":"q31"},"q31":{"111":"q32"},"q32":{"114":"q33"},"q33":{},"q34":{"65":"q35","66":"q35","67":"q35","68":"q35","69":"q35","70":"q35","71":"q35","72":"q35","73":"q35","74":"q35","75":"q35","76":"q35","77":"q35","78":"q35","79":"q35","80":"q35","81":"q35","82":"q35","83":"q35","84":"q35","85":"q35","86":"q35","87":"q35","88":"q35","89":"q35","90":"q35","97":"q35","98":"q35","99":"q35","100":"q35","101":"q35","102":"q35","103":"q35","104":"q35","105":"q35","106":"q35","107":"q35","108":"q35","109":"q35","110":"q35","111":"q35","112":"q35","113":"q35","114":"q35","115":"q35","116":"q35","117":"q35","118":"q35","119":"q35","120":"q35","121":"q35","122":"q35"},"q35":{"48":"q35","49":"q35","50":"q35","51":"q35","52":"q35","53":"q35","54":"q35","55":"q35","56":"q35","57":"q35","65":"q35","66":"q35","67":"q35","68":"q35","69":"q35","70":"q35","71":"q35","72":"q35","73":"q35","74":"q35","75":"q35","76":"q35","77":"q35","78":"q35","79":"q35","80":"q35","81":"q35","82":"q35","83":"q35","84":"q35","85":"q35","86":"q35","87":"q35","88":"q35","89":"q35","90":"q35","97":"q35","98":"q35","99":"q35","100":"q35","101":"q35","102":"q35","103":"q35","104":"q35","105":"q35","106":"q35","107":"q35","108":"q35","109":"q35","110":"q35","111":"q35","112":"q35","113":"q35","114":"q35","115":"q35","116":"q35","117":"q35","118":"q35","119":"q35","120":"q35","121":"q35","122":"q35"}},"finalStates":{"q1":{"9":"q1","10":"q1","32":"q1"},"q3":{"48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3"},"q6":{},"q8":{},"q10":{},"q12":{},"q14":{},"q16":{},"q18":{},"q20":{},"q23":{},"q29":{},"q33":{},"q35":{"48":"q35","49":"q35","50":"q35","51":"q35","52":"q35","53":"q35","54":"q35","55":"q35","56":"q35","57":"q35","65":"q35","66":"q35","67":"q35","68":"q35","69":"q35","70":"q35","71":"q35","72":"q35","73":"q35","74":"q35","75":"q35","76":"q35","77":"q35","78":"q35","79":"q35","80":"q35","81":"q35","82":"q35","83":"q35","84":"q35","85":"q35","86":"q35","87":"q35","88":"q35","89":"q35","90":"q35","97":"q35","98":"q35","99":"q35","100":"q35","101":"q35","102":"q35","103":"q35","104":"q35","105":"q35","106":"q35","107":"q35","108":"q35","109":"q35","110":"q35","111":"q35","112":"q35","113":"q35","114":"q35","115":"q35","116":"q35","117":"q35","118":"q35","119":"q35","120":"q35","121":"q35","122":"q35"}}};
    // Read the data
    readText(filepath)
    .then(data => {
      // The regex Data
      let regD = {"ws":{"rule":"console.log('WHITESPACE')","finalStates":["q1"]},"integer":{"rule":"console.log(\"ENTEROS\")","finalStates":["q3"]},"'+'":{"rule":"console.log(\"SUMA\")","finalStates":["q6"]},"'*'":{"rule":"console.log(\"POR\")","finalStates":["q8"]},"'('":{"rule":"console.log(\"LPAREN\")","finalStates":["q10"]},"')'":{"rule":"console.log(\"RPAREN\")","finalStates":["q12"]},"'-'":{"rule":"console.log(\"MENOS\")","finalStates":["q14"]},"'/'":{"rule":"console.log(\"DIV\")","finalStates":["q16"]},"'='":{"rule":"console.log(\"IGUAL\")","finalStates":["q18"]},"'^'":{"rule":"console.log(\"POTENCIA\")","finalStates":["q20"]},"\"if\"":{"rule":"console.log(\"IF\")","finalStates":["q23"]},"\"while\"":{"rule":"console.log(\"WHILE\")","finalStates":["q29"]},"\"for\"":{"rule":"console.log(\"FOR\")","finalStates":["q33"]},"identificador":{"rule":"console.log(\"IDENTIFICADOR\")","finalStates":["q35"]}};
      let finalStatesMap = new Map();
      let keys = Object.keys(regD);
      for (let k = 0; k < keys.length; k++){
        let key = keys[k];
        for (let j = 0; j < regD[key]["finalStates"].length; j++){
          finalStatesMap.set(regD[key]["finalStates"][j], key);
        }
      }
      // Tokenizer with yalex automathon
      let S = null;
      let accepted = false;
      let indexTemp = 0;
      let token = null;
      yalexNFA = deSerializeAutomathon(yalexNFA);
      for (let k = 0; k < data.length; k++){
        token = null;
        accepted = false;
        S = null;
        [accepted, indexTemp, S] = yalexNFA.yalexSimulate2(data, k);
        // If it is accepted eval it
        try{
          if (accepted && finalStatesMap.get(S[0].label)!==undefined){
            console.log("Token accepted in rule "+finalStatesMap.get(S[0].label)+": '"+data.slice(k, indexTemp+1)+"'");
            console.log("Evaluating rule:")
            // Get which final State is obtained, we assume the first state in the final states obtained
            evalRule(regD[finalStatesMap.get(S[0].label)]["rule"]);
            k = indexTemp;
          }
          // else show a lexical error
          else{
            throw new Error("Lexical error, unexpected token: '"+data[k]+"' regex");
          }
        }
        catch(e){
          console.error(e);
        };
      }
    })
    .catch(err => {
        console.error('Error reading file:', err); // Handle errors
    });        
}
function evalRule(rule){
  console.log(eval(rule));
}
function deSerializeAutomathon(parsedSerializeAutomathon){
  let alphabet = parsedSerializeAutomathon["alphabet"];
  let states = [];
  let finalStates = [];
  let initialState = null;
  let keysFinalStates = Object.keys(parsedSerializeAutomathon["finalStates"]);
  let newTransitions = new Map();
  for (let stateName in parsedSerializeAutomathon.states){
    let transitions = new Map();
    // Get the transitions
    for (let key in parsedSerializeAutomathon["states"][stateName]){
      transitions.set(key, parsedSerializeAutomathon["states"][stateName][key]);
    }
    let newState = new State(stateName, transitions);
    states.push(newState);
    // Get initial state
    if (stateName === parsedSerializeAutomathon["initialState"]["name"]){
      initialState = newState;
    }
    // Check if is final state
    if (keysFinalStates.includes(stateName)){
      finalStates.push(newState);
    }
    newTransitions.set(stateName, transitions);
  }
  return new NFA(initialState, finalStates, states, alphabet, newTransitions);
};
function readText(filepath) {
    return new Promise((resolve, reject) => {
      // Read the data
      fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) {
          reject(err); // Pass error to reject handler
          return;
        }
        resolve(data); // Pass data to resolve handler
      });
    });
  };
  // Change the path to get the text
tokenize("texto.txt");
