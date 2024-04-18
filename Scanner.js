let array = [1,2,3,4,5,6,7,8,9,0];
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
    let finalState = [];
    let lastFinalStateInput = 0;
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
function tokenize(filepath){
    // Deserialize the yalex Automathon
    let yalexNFA = {"alphabet":[73,70,34,32,9,10,70,79,82,34,43,34,45,34,42,34,47,34,40,34,41,34,48,49,50,51,52,53,54,55,56,57,43,45,48,49,50,51,52,53,54,55,56,57,44,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,48,49,50,51,52,53,54,55,56,57,34,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,48,49,50,51,52,53,54,55,56,57,32],"initialState":{"name":"init","transitions":{"ε":["q0","q4","q7","q12","q15","q18","q21","q24","q27","q30","q32","q37","q40"]}},"states":{"q0":{"73":"q1"},"q1":{"70":"q2"},"q2":{"34":"q3"},"q3":{},"init":{"ε":["q0","q4","q7","q12","q15","q18","q21","q24","q27","q30","q32","q37","q40"]},"q4":{"9":"q5","10":"q5","32":"q5"},"q5":{"9":"q5","10":"q5","32":"q5"},"q7":{"70":"q8"},"q8":{"79":"q9"},"q9":{"82":"q10"},"q10":{"34":"q11"},"q11":{},"q12":{"43":"q13"},"q13":{"34":"q14"},"q14":{},"q15":{"45":"q16"},"q16":{"34":"q17"},"q17":{},"q18":{"42":"q19"},"q19":{"34":"q20"},"q20":{},"q21":{"47":"q22"},"q22":{"34":"q23"},"q23":{},"q24":{"40":"q25"},"q25":{"34":"q26"},"q26":{},"q27":{"41":"q28"},"q28":{"34":"q29"},"q29":{},"q30":{"48":"q31","49":"q31","50":"q31","51":"q31","52":"q31","53":"q31","54":"q31","55":"q31","56":"q31","57":"q31"},"q31":{"48":"q31","49":"q31","50":"q31","51":"q31","52":"q31","53":"q31","54":"q31","55":"q31","56":"q31","57":"q31"},"q32":{"43":"q33","45":"q33"},"q33":{"48":"q34","49":"q34","50":"q34","51":"q34","52":"q34","53":"q34","54":"q34","55":"q34","56":"q34","57":"q34"},"q34":{"44":"q35","48":"q34","49":"q34","50":"q34","51":"q34","52":"q34","53":"q34","54":"q34","55":"q34","56":"q34","57":"q34"},"q35":{"48":"q36","49":"q36","50":"q36","51":"q36","52":"q36","53":"q36","54":"q36","55":"q36","56":"q36","57":"q36"},"q36":{"48":"q36","49":"q36","50":"q36","51":"q36","52":"q36","53":"q36","54":"q36","55":"q36","56":"q36","57":"q36"},"q37":{"65":"q38","66":"q38","67":"q38","68":"q38","69":"q38","70":"q38","71":"q38","72":"q38","73":"q38","74":"q38","75":"q38","76":"q38","77":"q38","78":"q38","79":"q38","80":"q38","81":"q38","82":"q38","83":"q38","84":"q38","85":"q38","86":"q38","87":"q38","88":"q38","89":"q38","90":"q38","97":"q38","98":"q38","99":"q38","100":"q38","101":"q38","102":"q38","103":"q38","104":"q38","105":"q38","106":"q38","107":"q38","108":"q38","109":"q38","110":"q38","111":"q38","112":"q38","113":"q38","114":"q38","115":"q38","116":"q38","117":"q38","118":"q38","119":"q38","120":"q38","121":"q38","122":"q38"},"q38":{"48":"q38","49":"q38","50":"q38","51":"q38","52":"q38","53":"q38","54":"q38","55":"q38","56":"q38","57":"q38","65":"q38","66":"q38","67":"q38","68":"q38","69":"q38","70":"q38","71":"q38","72":"q38","73":"q38","74":"q38","75":"q38","76":"q38","77":"q38","78":"q38","79":"q38","80":"q38","81":"q38","82":"q38","83":"q38","84":"q38","85":"q38","86":"q38","87":"q38","88":"q38","89":"q38","90":"q38","97":"q38","98":"q38","99":"q38","100":"q38","101":"q38","102":"q38","103":"q38","104":"q38","105":"q38","106":"q38","107":"q38","108":"q38","109":"q38","110":"q38","111":"q38","112":"q38","113":"q38","114":"q38","115":"q38","116":"q38","117":"q38","118":"q38","119":"q38","120":"q39","121":"q39","122":"q39"},"q39":{"48":"q38","49":"q38","50":"q38","51":"q38","52":"q38","53":"q38","54":"q38","55":"q38","56":"q38","57":"q38","65":"q38","66":"q38","67":"q38","68":"q38","69":"q38","70":"q38","71":"q38","72":"q38","73":"q38","74":"q38","75":"q38","76":"q38","77":"q38","78":"q38","79":"q38","80":"q38","81":"q38","82":"q38","83":"q38","84":"q38","85":"q38","86":"q38","87":"q38","88":"q38","89":"q38","90":"q38","97":"q38","98":"q38","99":"q38","100":"q38","101":"q38","102":"q38","103":"q38","104":"q38","105":"q38","106":"q38","107":"q38","108":"q38","109":"q38","110":"q38","111":"q38","112":"q38","113":"q38","114":"q38","115":"q38","116":"q38","117":"q38","118":"q38","119":"q38","120":"q39","121":"q39","122":"q39"},"q40":{"34":"q41"},"q41":{"32":"q42","48":"q42","49":"q42","50":"q42","51":"q42","52":"q42","53":"q42","54":"q42","55":"q42","56":"q42","57":"q42","65":"q42","66":"q42","67":"q42","68":"q42","69":"q42","70":"q42","71":"q42","72":"q42","73":"q42","74":"q42","75":"q42","76":"q42","77":"q42","78":"q42","79":"q42","80":"q42","81":"q42","82":"q42","83":"q42","84":"q42","85":"q42","86":"q42","87":"q42","88":"q42","89":"q42","90":"q42","97":"q42","98":"q42","99":"q42","100":"q42","101":"q42","102":"q42","103":"q42","104":"q42","105":"q42","106":"q42","107":"q42","108":"q42","109":"q42","110":"q42","111":"q42","112":"q42","113":"q42","114":"q42","115":"q42","116":"q42","117":"q42","118":"q42","119":"q42","120":"q42","121":"q42","122":"q42"},"q42":{"32":"q42","34":"q43","48":"q42","49":"q42","50":"q42","51":"q42","52":"q42","53":"q42","54":"q42","55":"q42","56":"q42","57":"q42","65":"q42","66":"q42","67":"q42","68":"q42","69":"q42","70":"q42","71":"q42","72":"q42","73":"q42","74":"q42","75":"q42","76":"q42","77":"q42","78":"q42","79":"q42","80":"q42","81":"q42","82":"q42","83":"q42","84":"q42","85":"q42","86":"q42","87":"q42","88":"q42","89":"q42","90":"q42","97":"q42","98":"q42","99":"q42","100":"q42","101":"q42","102":"q42","103":"q42","104":"q42","105":"q42","106":"q42","107":"q42","108":"q42","109":"q42","110":"q42","111":"q42","112":"q42","113":"q42","114":"q42","115":"q42","116":"q42","117":"q42","118":"q42","119":"q42","120":"q42","121":"q42","122":"q42"},"q43":{}},"finalStates":{"q3":{},"q5":{"9":"q5","10":"q5","32":"q5"},"q11":{},"q14":{},"q17":{},"q20":{},"q23":{},"q26":{},"q29":{},"q31":{"48":"q31","49":"q31","50":"q31","51":"q31","52":"q31","53":"q31","54":"q31","55":"q31","56":"q31","57":"q31"},"q36":{"48":"q36","49":"q36","50":"q36","51":"q36","52":"q36","53":"q36","54":"q36","55":"q36","56":"q36","57":"q36"},"q39":{"48":"q38","49":"q38","50":"q38","51":"q38","52":"q38","53":"q38","54":"q38","55":"q38","56":"q38","57":"q38","65":"q38","66":"q38","67":"q38","68":"q38","69":"q38","70":"q38","71":"q38","72":"q38","73":"q38","74":"q38","75":"q38","76":"q38","77":"q38","78":"q38","79":"q38","80":"q38","81":"q38","82":"q38","83":"q38","84":"q38","85":"q38","86":"q38","87":"q38","88":"q38","89":"q38","90":"q38","97":"q38","98":"q38","99":"q38","100":"q38","101":"q38","102":"q38","103":"q38","104":"q38","105":"q38","106":"q38","107":"q38","108":"q38","109":"q38","110":"q38","111":"q38","112":"q38","113":"q38","114":"q38","115":"q38","116":"q38","117":"q38","118":"q38","119":"q38","120":"q39","121":"q39","122":"q39"},"q43":{}}};
    // Read the data
    readText(filepath)
    .then(data => {
      // The regex Data
      let regD = {"\"IF\"":{"rule":"console.log(\"IF\")","finalStates":["q3"]},"ws":{"rule":"array = array.map((num)=>num*num);console.log(array);","finalStates":["q5"]},"\"FOR\"":{"rule":"console.log(\"FOR\")","finalStates":["q11"]},"\"+\"":{"rule":"console.log(\"SUMA\")","finalStates":["q14"]},"\"-\"":{"rule":"console.log(\"RESTA\")","finalStates":["q17"]},"\"*\"":{"rule":"console.log(\"MULTIPLICACION\")","finalStates":["q20"]},"\"/\"":{"rule":"console.log(\"DIVISION\")","finalStates":["q23"]},"\"(\"":{"rule":"console.log(\"PARENTESIS_IZQUIERDO\")","finalStates":["q26"]},"\")\"":{"rule":"console.log(\"PARENTESIS_DERECHO\")","finalStates":["q29"]},"digits":{"rule":"console.log(\"DIGITO\")","finalStates":["q31"]},"number":{"rule":"console.log(\"NUMERO CON DECIMAL\")","finalStates":["q36"]},"id":{"rule":"console.log(\"IDENTIFICADOR\")","finalStates":["q39"]},"string":{"rule":"console.log(\"STRING\")","finalStates":["q43"]}};
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
