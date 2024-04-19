
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
    let yalexNFA = {"alphabet":[47,42,48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,10,13,9,33,34,35,36,37,38,39,40,41,43,44,45,46,58,59,60,61,62,63,64,116,111,107,101,110,32,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,48,49,50,51,52,53,54,55,56,57,95,10,13,9,73,71,78,79,82,69,32,65,66,67,68,70,72,74,75,76,77,80,81,83,84,85,86,87,88,89,90,48,49,50,51,52,53,54,55,56,57,95,37,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,48,49,50,51,52,53,54,55,56,57,95,32,58,32,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,48,49,50,51,52,53,54,55,56,57,95,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,124,59,10,13,9,32],"initialState":{"name":"init","transitions":{"ε":["q0","q6","q20","q30","q33","q38","q51"]}},"states":{"q0":{"47":"q1"},"q1":{"42":"q2"},"q2":{"9":"q3","10":"q3","13":"q3","33":"q3","34":"q3","35":"q3","36":"q3","37":"q3","38":"q3","39":"q3","40":"q3","41":"q3","42":"q3","43":"q3","44":"q3","45":"q3","46":"q3","47":"q3","48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3","58":"q3","59":"q3","60":"q3","61":"q3","62":"q3","63":"q3","64":"q3","65":"q3","66":"q3","67":"q3","68":"q3","69":"q3","70":"q3","71":"q3","72":"q3","73":"q3","74":"q3","75":"q3","76":"q3","77":"q3","78":"q3","79":"q3","80":"q3","81":"q3","82":"q3","83":"q3","84":"q3","85":"q3","86":"q3","87":"q3","88":"q3","89":"q3","90":"q3","97":"q3","98":"q3","99":"q3","100":"q3","101":"q3","102":"q3","103":"q3","104":"q3","105":"q3","106":"q3","107":"q3","108":"q3","109":"q3","110":"q3","111":"q3","112":"q3","113":"q3","114":"q3","115":"q3","116":"q3","117":"q3","118":"q3","119":"q3","120":"q3","121":"q3","122":"q3"},"q3":{"9":"q3","10":"q3","13":"q3","33":"q3","34":"q3","35":"q3","36":"q3","37":"q3","38":"q3","39":"q3","40":"q3","41":"q3","42":"q4","43":"q3","44":"q3","45":"q3","46":"q3","47":"q3","48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3","58":"q3","59":"q3","60":"q3","61":"q3","62":"q3","63":"q3","64":"q3","65":"q3","66":"q3","67":"q3","68":"q3","69":"q3","70":"q3","71":"q3","72":"q3","73":"q3","74":"q3","75":"q3","76":"q3","77":"q3","78":"q3","79":"q3","80":"q3","81":"q3","82":"q3","83":"q3","84":"q3","85":"q3","86":"q3","87":"q3","88":"q3","89":"q3","90":"q3","97":"q3","98":"q3","99":"q3","100":"q3","101":"q3","102":"q3","103":"q3","104":"q3","105":"q3","106":"q3","107":"q3","108":"q3","109":"q3","110":"q3","111":"q3","112":"q3","113":"q3","114":"q3","115":"q3","116":"q3","117":"q3","118":"q3","119":"q3","120":"q3","121":"q3","122":"q3"},"q4":{"9":"q3","10":"q3","13":"q3","33":"q3","34":"q3","35":"q3","36":"q3","37":"q3","38":"q3","39":"q3","40":"q3","41":"q3","42":"q4","43":"q3","44":"q3","45":"q3","46":"q3","47":"q5","48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3","58":"q3","59":"q3","60":"q3","61":"q3","62":"q3","63":"q3","64":"q3","65":"q3","66":"q3","67":"q3","68":"q3","69":"q3","70":"q3","71":"q3","72":"q3","73":"q3","74":"q3","75":"q3","76":"q3","77":"q3","78":"q3","79":"q3","80":"q3","81":"q3","82":"q3","83":"q3","84":"q3","85":"q3","86":"q3","87":"q3","88":"q3","89":"q3","90":"q3","97":"q3","98":"q3","99":"q3","100":"q3","101":"q3","102":"q3","103":"q3","104":"q3","105":"q3","106":"q3","107":"q3","108":"q3","109":"q3","110":"q3","111":"q3","112":"q3","113":"q3","114":"q3","115":"q3","116":"q3","117":"q3","118":"q3","119":"q3","120":"q3","121":"q3","122":"q3"},"q5":{"9":"q3","10":"q3","13":"q3","33":"q3","34":"q3","35":"q3","36":"q3","37":"q3","38":"q3","39":"q3","40":"q3","41":"q3","42":"q4","43":"q3","44":"q3","45":"q3","46":"q3","47":"q3","48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3","58":"q3","59":"q3","60":"q3","61":"q3","62":"q3","63":"q3","64":"q3","65":"q3","66":"q3","67":"q3","68":"q3","69":"q3","70":"q3","71":"q3","72":"q3","73":"q3","74":"q3","75":"q3","76":"q3","77":"q3","78":"q3","79":"q3","80":"q3","81":"q3","82":"q3","83":"q3","84":"q3","85":"q3","86":"q3","87":"q3","88":"q3","89":"q3","90":"q3","97":"q3","98":"q3","99":"q3","100":"q3","101":"q3","102":"q3","103":"q3","104":"q3","105":"q3","106":"q3","107":"q3","108":"q3","109":"q3","110":"q3","111":"q3","112":"q3","113":"q3","114":"q3","115":"q3","116":"q3","117":"q3","118":"q3","119":"q3","120":"q3","121":"q3","122":"q3"},"init":{"ε":["q0","q6","q20","q30","q33","q38","q51"]},"q6":{"116":"q7"},"q7":{"111":"q8"},"q8":{"107":"q9"},"q9":{"101":"q10"},"q10":{"110":"q11"},"q11":{"32":"q12"},"q12":{"32":"q12","65":"q13","66":"q13","67":"q13","68":"q13","69":"q13","70":"q13","71":"q13","72":"q13","73":"q13","74":"q13","75":"q13","76":"q13","77":"q13","78":"q13","79":"q13","80":"q13","81":"q13","82":"q13","83":"q13","84":"q13","85":"q13","86":"q13","87":"q13","88":"q13","89":"q13","90":"q13"},"q13":{"48":"q14","49":"q14","50":"q14","51":"q14","52":"q14","53":"q14","54":"q14","55":"q14","56":"q14","57":"q14","65":"q14","66":"q14","67":"q14","68":"q14","69":"q14","70":"q14","71":"q14","72":"q14","73":"q14","74":"q14","75":"q14","76":"q14","77":"q14","78":"q14","79":"q14","80":"q14","81":"q14","82":"q14","83":"q14","84":"q14","85":"q14","86":"q14","87":"q14","88":"q14","89":"q14","90":"q14","95":"q14"},"q14":{"9":"q16","10":"q16","13":"q16","32":"q15","48":"q14","49":"q14","50":"q14","51":"q14","52":"q14","53":"q14","54":"q14","55":"q14","56":"q14","57":"q14","65":"q14","66":"q14","67":"q14","68":"q14","69":"q14","70":"q14","71":"q14","72":"q14","73":"q14","74":"q14","75":"q14","76":"q14","77":"q14","78":"q14","79":"q14","80":"q14","81":"q14","82":"q14","83":"q14","84":"q14","85":"q14","86":"q14","87":"q14","88":"q14","89":"q14","90":"q14","95":"q14"},"q15":{"65":"q17","66":"q17","67":"q17","68":"q17","69":"q17","70":"q17","71":"q17","72":"q17","73":"q17","74":"q17","75":"q17","76":"q17","77":"q17","78":"q17","79":"q17","80":"q17","81":"q17","82":"q17","83":"q17","84":"q17","85":"q17","86":"q17","87":"q17","88":"q17","89":"q17","90":"q17"},"q16":{},"q17":{"48":"q18","49":"q18","50":"q18","51":"q18","52":"q18","53":"q18","54":"q18","55":"q18","56":"q18","57":"q18","65":"q18","66":"q18","67":"q18","68":"q18","69":"q18","70":"q18","71":"q18","72":"q18","73":"q18","74":"q18","75":"q18","76":"q18","77":"q18","78":"q18","79":"q18","80":"q18","81":"q18","82":"q18","83":"q18","84":"q18","85":"q18","86":"q18","87":"q18","88":"q18","89":"q18","90":"q18","95":"q18"},"q18":{"9":"q16","10":"q16","13":"q16","32":"q15","48":"q18","49":"q18","50":"q18","51":"q18","52":"q18","53":"q18","54":"q18","55":"q18","56":"q18","57":"q18","65":"q18","66":"q18","67":"q18","68":"q18","69":"q18","70":"q18","71":"q18","72":"q18","73":"q18","74":"q18","75":"q18","76":"q18","77":"q18","78":"q18","79":"q18","80":"q18","81":"q18","82":"q18","83":"q18","84":"q18","85":"q18","86":"q18","87":"q18","88":"q18","89":"q18","90":"q18","95":"q18"},"q20":{"73":"q21"},"q21":{"71":"q22"},"q22":{"78":"q23"},"q23":{"79":"q24"},"q24":{"82":"q25"},"q25":{"69":"q26"},"q26":{"32":"q27"},"q27":{"32":"q27","65":"q28","66":"q28","67":"q28","68":"q28","69":"q28","70":"q28","71":"q28","72":"q28","73":"q28","74":"q28","75":"q28","76":"q28","77":"q28","78":"q28","79":"q28","80":"q28","81":"q28","82":"q28","83":"q28","84":"q28","85":"q28","86":"q28","87":"q28","88":"q28","89":"q28","90":"q28"},"q28":{"48":"q29","49":"q29","50":"q29","51":"q29","52":"q29","53":"q29","54":"q29","55":"q29","56":"q29","57":"q29","65":"q29","66":"q29","67":"q29","68":"q29","69":"q29","70":"q29","71":"q29","72":"q29","73":"q29","74":"q29","75":"q29","76":"q29","77":"q29","78":"q29","79":"q29","80":"q29","81":"q29","82":"q29","83":"q29","84":"q29","85":"q29","86":"q29","87":"q29","88":"q29","89":"q29","90":"q29","95":"q29"},"q29":{"48":"q29","49":"q29","50":"q29","51":"q29","52":"q29","53":"q29","54":"q29","55":"q29","56":"q29","57":"q29","65":"q29","66":"q29","67":"q29","68":"q29","69":"q29","70":"q29","71":"q29","72":"q29","73":"q29","74":"q29","75":"q29","76":"q29","77":"q29","78":"q29","79":"q29","80":"q29","81":"q29","82":"q29","83":"q29","84":"q29","85":"q29","86":"q29","87":"q29","88":"q29","89":"q29","90":"q29","95":"q29"},"q30":{"37":"q31"},"q31":{"37":"q32"},"q32":{},"q33":{"97":"q34","98":"q34","99":"q34","100":"q34","101":"q34","102":"q34","103":"q34","104":"q34","105":"q34","106":"q34","107":"q34","108":"q34","109":"q34","110":"q34","111":"q34","112":"q34","113":"q34","114":"q34","115":"q34","116":"q34","117":"q34","118":"q34","119":"q34","120":"q34","121":"q34","122":"q34"},"q34":{"48":"q35","49":"q35","50":"q35","51":"q35","52":"q35","53":"q35","54":"q35","55":"q35","56":"q35","57":"q35","95":"q35","97":"q35","98":"q35","99":"q35","100":"q35","101":"q35","102":"q35","103":"q35","104":"q35","105":"q35","106":"q35","107":"q35","108":"q35","109":"q35","110":"q35","111":"q35","112":"q35","113":"q35","114":"q35","115":"q35","116":"q35","117":"q35","118":"q35","119":"q35","120":"q35","121":"q35","122":"q35"},"q35":{"32":"q36","48":"q35","49":"q35","50":"q35","51":"q35","52":"q35","53":"q35","54":"q35","55":"q35","56":"q35","57":"q35","58":"q37","95":"q35","97":"q35","98":"q35","99":"q35","100":"q35","101":"q35","102":"q35","103":"q35","104":"q35","105":"q35","106":"q35","107":"q35","108":"q35","109":"q35","110":"q35","111":"q35","112":"q35","113":"q35","114":"q35","115":"q35","116":"q35","117":"q35","118":"q35","119":"q35","120":"q35","121":"q35","122":"q35"},"q36":{"32":"q36","58":"q37"},"q37":{},"q38":{"32":"q38","65":"q40","66":"q40","67":"q40","68":"q40","69":"q40","70":"q40","71":"q40","72":"q40","73":"q40","74":"q40","75":"q40","76":"q40","77":"q40","78":"q40","79":"q40","80":"q40","81":"q40","82":"q40","83":"q40","84":"q40","85":"q40","86":"q40","87":"q40","88":"q40","89":"q40","90":"q40","97":"q39","98":"q39","99":"q39","100":"q39","101":"q39","102":"q39","103":"q39","104":"q39","105":"q39","106":"q39","107":"q39","108":"q39","109":"q39","110":"q39","111":"q39","112":"q39","113":"q39","114":"q39","115":"q39","116":"q39","117":"q39","118":"q39","119":"q39","120":"q39","121":"q39","122":"q39"},"q39":{"48":"q50","49":"q50","50":"q50","51":"q50","52":"q50","53":"q50","54":"q50","55":"q50","56":"q50","57":"q50","95":"q50","97":"q50","98":"q50","99":"q50","100":"q50","101":"q50","102":"q50","103":"q50","104":"q50","105":"q50","106":"q50","107":"q50","108":"q50","109":"q50","110":"q50","111":"q50","112":"q50","113":"q50","114":"q50","115":"q50","116":"q50","117":"q50","118":"q50","119":"q50","120":"q50","121":"q50","122":"q50"},"q40":{"48":"q41","49":"q41","50":"q41","51":"q41","52":"q41","53":"q41","54":"q41","55":"q41","56":"q41","57":"q41","65":"q41","66":"q41","67":"q41","68":"q41","69":"q41","70":"q41","71":"q41","72":"q41","73":"q41","74":"q41","75":"q41","76":"q41","77":"q41","78":"q41","79":"q41","80":"q41","81":"q41","82":"q41","83":"q41","84":"q41","85":"q41","86":"q41","87":"q41","88":"q41","89":"q41","90":"q41","95":"q41"},"q41":{"32":"q42","48":"q41","49":"q41","50":"q41","51":"q41","52":"q41","53":"q41","54":"q41","55":"q41","56":"q41","57":"q41","59":"q44","65":"q41","66":"q41","67":"q41","68":"q41","69":"q41","70":"q41","71":"q41","72":"q41","73":"q41","74":"q41","75":"q41","76":"q41","77":"q41","78":"q41","79":"q41","80":"q41","81":"q41","82":"q41","83":"q41","84":"q41","85":"q41","86":"q41","87":"q41","88":"q41","89":"q41","90":"q41","95":"q41","97":"q39","98":"q39","99":"q39","100":"q39","101":"q39","102":"q39","103":"q39","104":"q39","105":"q39","106":"q39","107":"q39","108":"q39","109":"q39","110":"q39","111":"q39","112":"q39","113":"q39","114":"q39","115":"q39","116":"q39","117":"q39","118":"q39","119":"q39","120":"q39","121":"q39","122":"q39","124":"q43"},"q42":{"32":"q42","59":"q44","65":"q40","66":"q40","67":"q40","68":"q40","69":"q40","70":"q40","71":"q40","72":"q40","73":"q40","74":"q40","75":"q40","76":"q40","77":"q40","78":"q40","79":"q40","80":"q40","81":"q40","82":"q40","83":"q40","84":"q40","85":"q40","86":"q40","87":"q40","88":"q40","89":"q40","90":"q40","97":"q39","98":"q39","99":"q39","100":"q39","101":"q39","102":"q39","103":"q39","104":"q39","105":"q39","106":"q39","107":"q39","108":"q39","109":"q39","110":"q39","111":"q39","112":"q39","113":"q39","114":"q39","115":"q39","116":"q39","117":"q39","118":"q39","119":"q39","120":"q39","121":"q39","122":"q39","124":"q43"},"q43":{"32":"q43","65":"q46","66":"q46","67":"q46","68":"q46","69":"q46","70":"q46","71":"q46","72":"q46","73":"q46","74":"q46","75":"q46","76":"q46","77":"q46","78":"q46","79":"q46","80":"q46","81":"q46","82":"q46","83":"q46","84":"q46","85":"q46","86":"q46","87":"q46","88":"q46","89":"q46","90":"q46","97":"q45","98":"q45","99":"q45","100":"q45","101":"q45","102":"q45","103":"q45","104":"q45","105":"q45","106":"q45","107":"q45","108":"q45","109":"q45","110":"q45","111":"q45","112":"q45","113":"q45","114":"q45","115":"q45","116":"q45","117":"q45","118":"q45","119":"q45","120":"q45","121":"q45","122":"q45"},"q44":{},"q45":{"48":"q49","49":"q49","50":"q49","51":"q49","52":"q49","53":"q49","54":"q49","55":"q49","56":"q49","57":"q49","95":"q49","97":"q49","98":"q49","99":"q49","100":"q49","101":"q49","102":"q49","103":"q49","104":"q49","105":"q49","106":"q49","107":"q49","108":"q49","109":"q49","110":"q49","111":"q49","112":"q49","113":"q49","114":"q49","115":"q49","116":"q49","117":"q49","118":"q49","119":"q49","120":"q49","121":"q49","122":"q49"},"q46":{"48":"q47","49":"q47","50":"q47","51":"q47","52":"q47","53":"q47","54":"q47","55":"q47","56":"q47","57":"q47","65":"q47","66":"q47","67":"q47","68":"q47","69":"q47","70":"q47","71":"q47","72":"q47","73":"q47","74":"q47","75":"q47","76":"q47","77":"q47","78":"q47","79":"q47","80":"q47","81":"q47","82":"q47","83":"q47","84":"q47","85":"q47","86":"q47","87":"q47","88":"q47","89":"q47","90":"q47","95":"q47"},"q47":{"32":"q48","48":"q47","49":"q47","50":"q47","51":"q47","52":"q47","53":"q47","54":"q47","55":"q47","56":"q47","57":"q47","59":"q44","65":"q47","66":"q47","67":"q47","68":"q47","69":"q47","70":"q47","71":"q47","72":"q47","73":"q47","74":"q47","75":"q47","76":"q47","77":"q47","78":"q47","79":"q47","80":"q47","81":"q47","82":"q47","83":"q47","84":"q47","85":"q47","86":"q47","87":"q47","88":"q47","89":"q47","90":"q47","95":"q47","97":"q45","98":"q45","99":"q45","100":"q45","101":"q45","102":"q45","103":"q45","104":"q45","105":"q45","106":"q45","107":"q45","108":"q45","109":"q45","110":"q45","111":"q45","112":"q45","113":"q45","114":"q45","115":"q45","116":"q45","117":"q45","118":"q45","119":"q45","120":"q45","121":"q45","122":"q45","124":"q43"},"q48":{"32":"q48","59":"q44","65":"q46","66":"q46","67":"q46","68":"q46","69":"q46","70":"q46","71":"q46","72":"q46","73":"q46","74":"q46","75":"q46","76":"q46","77":"q46","78":"q46","79":"q46","80":"q46","81":"q46","82":"q46","83":"q46","84":"q46","85":"q46","86":"q46","87":"q46","88":"q46","89":"q46","90":"q46","97":"q45","98":"q45","99":"q45","100":"q45","101":"q45","102":"q45","103":"q45","104":"q45","105":"q45","106":"q45","107":"q45","108":"q45","109":"q45","110":"q45","111":"q45","112":"q45","113":"q45","114":"q45","115":"q45","116":"q45","117":"q45","118":"q45","119":"q45","120":"q45","121":"q45","122":"q45","124":"q43"},"q49":{"32":"q48","48":"q49","49":"q49","50":"q49","51":"q49","52":"q49","53":"q49","54":"q49","55":"q49","56":"q49","57":"q49","59":"q44","65":"q46","66":"q46","67":"q46","68":"q46","69":"q46","70":"q46","71":"q46","72":"q46","73":"q46","74":"q46","75":"q46","76":"q46","77":"q46","78":"q46","79":"q46","80":"q46","81":"q46","82":"q46","83":"q46","84":"q46","85":"q46","86":"q46","87":"q46","88":"q46","89":"q46","90":"q46","95":"q49","97":"q49","98":"q49","99":"q49","100":"q49","101":"q49","102":"q49","103":"q49","104":"q49","105":"q49","106":"q49","107":"q49","108":"q49","109":"q49","110":"q49","111":"q49","112":"q49","113":"q49","114":"q49","115":"q49","116":"q49","117":"q49","118":"q49","119":"q49","120":"q49","121":"q49","122":"q49","124":"q43"},"q50":{"32":"q42","48":"q50","49":"q50","50":"q50","51":"q50","52":"q50","53":"q50","54":"q50","55":"q50","56":"q50","57":"q50","59":"q44","65":"q40","66":"q40","67":"q40","68":"q40","69":"q40","70":"q40","71":"q40","72":"q40","73":"q40","74":"q40","75":"q40","76":"q40","77":"q40","78":"q40","79":"q40","80":"q40","81":"q40","82":"q40","83":"q40","84":"q40","85":"q40","86":"q40","87":"q40","88":"q40","89":"q40","90":"q40","95":"q50","97":"q50","98":"q50","99":"q50","100":"q50","101":"q50","102":"q50","103":"q50","104":"q50","105":"q50","106":"q50","107":"q50","108":"q50","109":"q50","110":"q50","111":"q50","112":"q50","113":"q50","114":"q50","115":"q50","116":"q50","117":"q50","118":"q50","119":"q50","120":"q50","121":"q50","122":"q50","124":"q43"},"q51":{"9":"q52","10":"q52","13":"q52","32":"q52"},"q52":{}},"finalStates":{"q5":{"9":"q3","10":"q3","13":"q3","33":"q3","34":"q3","35":"q3","36":"q3","37":"q3","38":"q3","39":"q3","40":"q3","41":"q3","42":"q4","43":"q3","44":"q3","45":"q3","46":"q3","47":"q3","48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3","58":"q3","59":"q3","60":"q3","61":"q3","62":"q3","63":"q3","64":"q3","65":"q3","66":"q3","67":"q3","68":"q3","69":"q3","70":"q3","71":"q3","72":"q3","73":"q3","74":"q3","75":"q3","76":"q3","77":"q3","78":"q3","79":"q3","80":"q3","81":"q3","82":"q3","83":"q3","84":"q3","85":"q3","86":"q3","87":"q3","88":"q3","89":"q3","90":"q3","97":"q3","98":"q3","99":"q3","100":"q3","101":"q3","102":"q3","103":"q3","104":"q3","105":"q3","106":"q3","107":"q3","108":"q3","109":"q3","110":"q3","111":"q3","112":"q3","113":"q3","114":"q3","115":"q3","116":"q3","117":"q3","118":"q3","119":"q3","120":"q3","121":"q3","122":"q3"},"q16":{},"q29":{"48":"q29","49":"q29","50":"q29","51":"q29","52":"q29","53":"q29","54":"q29","55":"q29","56":"q29","57":"q29","65":"q29","66":"q29","67":"q29","68":"q29","69":"q29","70":"q29","71":"q29","72":"q29","73":"q29","74":"q29","75":"q29","76":"q29","77":"q29","78":"q29","79":"q29","80":"q29","81":"q29","82":"q29","83":"q29","84":"q29","85":"q29","86":"q29","87":"q29","88":"q29","89":"q29","90":"q29","95":"q29"},"q32":{},"q37":{},"q44":{},"q52":{}}};
    // Read the data
    readText(filepath)
    .then(data => {
      // The regex Data
      let regD = {"commentary":{"rule":"","finalStates":["q5"]},"tokenDefinition":{"rule":"","finalStates":["q16"]},"ignoreToken":{"rule":"","finalStates":["q29"]},"startProductionSection":{"rule":"","finalStates":["q32"]},"productionName":{"rule":"","finalStates":["q37"]},"productionBody":{"rule":"","finalStates":["q44"]},"['\\n''\\r''\\t'' ']":{"rule":"","finalStates":["q52"]}};
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
        [accepted, indexTemp, S] = yalexNFA.yalexSimulate(data, k);
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
  tokenize("./texts/yapar.txt");
