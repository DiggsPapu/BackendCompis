
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
    let initialIndex = indexInput;
    let finalState = [];
    let lastFinalStateInput = indexInput;
    let tempVal = false;
    // Inicializar el estado 0
    let S = this.eClosureT([this.initialState], this);
    let c = input.charCodeAt(indexInput).toString();
    while (indexInput<input.length) {
      S = this.eClosureT(this.move(S, c, this),this);
      // console.log(input[indexInput])
      // console.log(S.length)
      if (S.length === 0){
        // console.log(input.charCodeAt(indexInput).toString())
        // console.log("\n".charCodeAt(0));
        // console.log(input.slice(initialIndex, indexInput));
        // console.log("Unexpected token: "+input[indexInput])
        
        return [tempVal, lastFinalStateInput, finalState];
      }
      // console.log(input[indexInput])
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
let newToken = null;
async function tokenize(filepath){
    // Deserialize the yalex Automathon
    let yalexNFA = {"alphabet":[48,49,50,51,52,53,54,55,56,57,46,69,43,45],"initialState":{"name":"q0","transitions":{"48":"q1","49":"q1","50":"q1","51":"q1","52":"q1","53":"q1","54":"q1","55":"q1","56":"q1","57":"q1"}},"states":{"q0":{"48":"q1","49":"q1","50":"q1","51":"q1","52":"q1","53":"q1","54":"q1","55":"q1","56":"q1","57":"q1"},"q1":{"46":"q2","48":"q1","49":"q1","50":"q1","51":"q1","52":"q1","53":"q1","54":"q1","55":"q1","56":"q1","57":"q1","69":"q3"},"q2":{"48":"q6","49":"q6","50":"q6","51":"q6","52":"q6","53":"q6","54":"q6","55":"q6","56":"q6","57":"q6"},"q3":{"43":"q5","45":"q5","48":"q4","49":"q4","50":"q4","51":"q4","52":"q4","53":"q4","54":"q4","55":"q4","56":"q4","57":"q4"},"q4":{"48":"q4","49":"q4","50":"q4","51":"q4","52":"q4","53":"q4","54":"q4","55":"q4","56":"q4","57":"q4"},"q5":{"48":"q4","49":"q4","50":"q4","51":"q4","52":"q4","53":"q4","54":"q4","55":"q4","56":"q4","57":"q4"},"q6":{"48":"q6","49":"q6","50":"q6","51":"q6","52":"q6","53":"q6","54":"q6","55":"q6","56":"q6","57":"q6","69":"q3"}},"finalStates":{"q1":{"46":"q2","48":"q1","49":"q1","50":"q1","51":"q1","52":"q1","53":"q1","54":"q1","55":"q1","56":"q1","57":"q1","69":"q3"},"q4":{"48":"q4","49":"q4","50":"q4","51":"q4","52":"q4","53":"q4","54":"q4","55":"q4","56":"q4","57":"q4"},"q6":{"48":"q6","49":"q6","50":"q6","51":"q6","52":"q6","53":"q6","54":"q6","55":"q6","56":"q6","57":"q6","69":"q3"}}};
    // Read the data
    await readText(filepath)
    .then(data => {
      // The regex Data
      let regD = {"number":{"rule":"return NUMBER","finalStates":["q1","q4","q6"]}};
      let finalStatesMap = new Map();
      let keys = Object.keys(regD);
      for (let k = 0; k < keys.length; k++){
        let key = keys[k];
        for (let j = 0; j < regD[key]["finalStates"].length; j++){
          finalStatesMap.set(regD[key]["finalStates"][j], key);
        }
      }
      let finalStatesKeys = Array.from( finalStatesMap.keys() );
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
        [accepted, indexTemp, S] = yalexNFA.yalexSimulate(data, k);
        // If it is accepted eval it
        try{
          if (accepted && finalStatesKeys.filter(element => S.map(state=>state.label).includes(element)).length>0){
            let fState = finalStatesKeys.filter(element => S.map(state=>state.label).includes(element))[0];
            newToken = data.slice(k, indexTemp+1);
            console.log("Token accepted in rule->"+finalStatesMap.get(fState)+": '"+data.slice(k, indexTemp+1)+"'");
            let rule = regD[finalStatesMap.get(fState)]["rule"];
            console.log("Evaluating rule:"+rule)
            k = indexTemp;
            // Get which final State is obtained, we assume the first state in the final states obtained
            evalRule(rule);
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
tokenize("./texts/texto.txt");
