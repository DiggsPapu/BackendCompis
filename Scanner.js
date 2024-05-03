
    let tokens = [];
    let inProductionSection = false;
    let ignoreTokens = [];
    let inProductionDefinition = false;
    let productions = new Map();
    let currentProduction = "";
    let foundIndividualProduction = false;

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
    let yalexNFA = {"alphabet":[47,42,48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,10,13,9,32,33,34,35,36,37,38,39,40,41,43,44,45,46,58,59,60,61,62,63,64,37,116,111,107,101,110,32,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,97,98,99,100,102,103,104,105,106,108,109,112,113,114,115,117,118,119,120,121,122,48,49,50,51,52,53,54,55,56,57,95,73,71,78,79,82,69,32,65,66,67,68,70,72,74,75,76,77,80,81,83,84,85,86,87,88,89,90,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,48,49,50,51,52,53,54,55,56,57,95,37,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,48,49,50,51,52,53,54,55,56,57,95,32,58,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,48,49,50,51,52,53,54,55,56,57,95,10,13,9,32,59,124,10,13,9,32],"initialState":{"name":"init","transitions":{"ε":["q0","q6","q16","q25","q28","q32","q36","q38","q40"]}},"states":{"q0":{"47":"q1"},"q1":{"42":"q2"},"q2":{"9":"q3","10":"q3","13":"q3","32":"q3","33":"q3","34":"q3","35":"q3","36":"q3","37":"q3","38":"q3","39":"q3","40":"q3","41":"q3","42":"q3","43":"q3","44":"q3","45":"q3","46":"q3","47":"q3","48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3","58":"q3","59":"q3","60":"q3","61":"q3","62":"q3","63":"q3","64":"q3","65":"q3","66":"q3","67":"q3","68":"q3","69":"q3","70":"q3","71":"q3","72":"q3","73":"q3","74":"q3","75":"q3","76":"q3","77":"q3","78":"q3","79":"q3","80":"q3","81":"q3","82":"q3","83":"q3","84":"q3","85":"q3","86":"q3","87":"q3","88":"q3","89":"q3","90":"q3","97":"q3","98":"q3","99":"q3","100":"q3","101":"q3","102":"q3","103":"q3","104":"q3","105":"q3","106":"q3","107":"q3","108":"q3","109":"q3","110":"q3","111":"q3","112":"q3","113":"q3","114":"q3","115":"q3","116":"q3","117":"q3","118":"q3","119":"q3","120":"q3","121":"q3","122":"q3"},"q3":{"9":"q3","10":"q3","13":"q3","32":"q3","33":"q3","34":"q3","35":"q3","36":"q3","37":"q3","38":"q3","39":"q3","40":"q3","41":"q3","42":"q4","43":"q3","44":"q3","45":"q3","46":"q3","47":"q3","48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3","58":"q3","59":"q3","60":"q3","61":"q3","62":"q3","63":"q3","64":"q3","65":"q3","66":"q3","67":"q3","68":"q3","69":"q3","70":"q3","71":"q3","72":"q3","73":"q3","74":"q3","75":"q3","76":"q3","77":"q3","78":"q3","79":"q3","80":"q3","81":"q3","82":"q3","83":"q3","84":"q3","85":"q3","86":"q3","87":"q3","88":"q3","89":"q3","90":"q3","97":"q3","98":"q3","99":"q3","100":"q3","101":"q3","102":"q3","103":"q3","104":"q3","105":"q3","106":"q3","107":"q3","108":"q3","109":"q3","110":"q3","111":"q3","112":"q3","113":"q3","114":"q3","115":"q3","116":"q3","117":"q3","118":"q3","119":"q3","120":"q3","121":"q3","122":"q3"},"q4":{"9":"q3","10":"q3","13":"q3","32":"q3","33":"q3","34":"q3","35":"q3","36":"q3","37":"q3","38":"q3","39":"q3","40":"q3","41":"q3","42":"q4","43":"q3","44":"q3","45":"q3","46":"q3","47":"q5","48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3","58":"q3","59":"q3","60":"q3","61":"q3","62":"q3","63":"q3","64":"q3","65":"q3","66":"q3","67":"q3","68":"q3","69":"q3","70":"q3","71":"q3","72":"q3","73":"q3","74":"q3","75":"q3","76":"q3","77":"q3","78":"q3","79":"q3","80":"q3","81":"q3","82":"q3","83":"q3","84":"q3","85":"q3","86":"q3","87":"q3","88":"q3","89":"q3","90":"q3","97":"q3","98":"q3","99":"q3","100":"q3","101":"q3","102":"q3","103":"q3","104":"q3","105":"q3","106":"q3","107":"q3","108":"q3","109":"q3","110":"q3","111":"q3","112":"q3","113":"q3","114":"q3","115":"q3","116":"q3","117":"q3","118":"q3","119":"q3","120":"q3","121":"q3","122":"q3"},"q5":{"9":"q3","10":"q3","13":"q3","32":"q3","33":"q3","34":"q3","35":"q3","36":"q3","37":"q3","38":"q3","39":"q3","40":"q3","41":"q3","42":"q4","43":"q3","44":"q3","45":"q3","46":"q3","47":"q3","48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3","58":"q3","59":"q3","60":"q3","61":"q3","62":"q3","63":"q3","64":"q3","65":"q3","66":"q3","67":"q3","68":"q3","69":"q3","70":"q3","71":"q3","72":"q3","73":"q3","74":"q3","75":"q3","76":"q3","77":"q3","78":"q3","79":"q3","80":"q3","81":"q3","82":"q3","83":"q3","84":"q3","85":"q3","86":"q3","87":"q3","88":"q3","89":"q3","90":"q3","97":"q3","98":"q3","99":"q3","100":"q3","101":"q3","102":"q3","103":"q3","104":"q3","105":"q3","106":"q3","107":"q3","108":"q3","109":"q3","110":"q3","111":"q3","112":"q3","113":"q3","114":"q3","115":"q3","116":"q3","117":"q3","118":"q3","119":"q3","120":"q3","121":"q3","122":"q3"},"init":{"ε":["q0","q6","q16","q25","q28","q32","q36","q38","q40"]},"q6":{"37":"q7"},"q7":{"116":"q8"},"q8":{"111":"q9"},"q9":{"107":"q10"},"q10":{"101":"q11"},"q11":{"110":"q12"},"q12":{"32":"q13"},"q13":{"32":"q13","65":"q14","66":"q14","67":"q14","68":"q14","69":"q14","70":"q14","71":"q14","72":"q14","73":"q14","74":"q14","75":"q14","76":"q14","77":"q14","78":"q14","79":"q14","80":"q14","81":"q14","82":"q14","83":"q14","84":"q14","85":"q14","86":"q14","87":"q14","88":"q14","89":"q14","90":"q14","97":"q14","98":"q14","99":"q14","100":"q14","101":"q14","102":"q14","103":"q14","104":"q14","105":"q14","106":"q14","107":"q14","108":"q14","109":"q14","110":"q14","111":"q14","112":"q14","113":"q14","114":"q14","115":"q14","116":"q14","117":"q14","118":"q14","119":"q14","120":"q14","121":"q14","122":"q14"},"q14":{"32":"q13","48":"q14","49":"q14","50":"q14","51":"q14","52":"q14","53":"q14","54":"q14","55":"q14","56":"q14","57":"q14","65":"q14","66":"q14","67":"q14","68":"q14","69":"q14","70":"q14","71":"q14","72":"q14","73":"q14","74":"q14","75":"q14","76":"q14","77":"q14","78":"q14","79":"q14","80":"q14","81":"q14","82":"q14","83":"q14","84":"q14","85":"q14","86":"q14","87":"q14","88":"q14","89":"q14","90":"q14","95":"q14","97":"q14","98":"q14","99":"q14","100":"q14","101":"q14","102":"q14","103":"q14","104":"q14","105":"q14","106":"q14","107":"q14","108":"q14","109":"q14","110":"q14","111":"q14","112":"q14","113":"q14","114":"q14","115":"q14","116":"q14","117":"q14","118":"q14","119":"q14","120":"q14","121":"q14","122":"q14"},"q16":{"73":"q17"},"q17":{"71":"q18"},"q18":{"78":"q19"},"q19":{"79":"q20"},"q20":{"82":"q21"},"q21":{"69":"q22"},"q22":{"32":"q23"},"q23":{"32":"q23","65":"q24","66":"q24","67":"q24","68":"q24","69":"q24","70":"q24","71":"q24","72":"q24","73":"q24","74":"q24","75":"q24","76":"q24","77":"q24","78":"q24","79":"q24","80":"q24","81":"q24","82":"q24","83":"q24","84":"q24","85":"q24","86":"q24","87":"q24","88":"q24","89":"q24","90":"q24","97":"q24","98":"q24","99":"q24","100":"q24","101":"q24","102":"q24","103":"q24","104":"q24","105":"q24","106":"q24","107":"q24","108":"q24","109":"q24","110":"q24","111":"q24","112":"q24","113":"q24","114":"q24","115":"q24","116":"q24","117":"q24","118":"q24","119":"q24","120":"q24","121":"q24","122":"q24"},"q24":{"48":"q24","49":"q24","50":"q24","51":"q24","52":"q24","53":"q24","54":"q24","55":"q24","56":"q24","57":"q24","65":"q24","66":"q24","67":"q24","68":"q24","69":"q24","70":"q24","71":"q24","72":"q24","73":"q24","74":"q24","75":"q24","76":"q24","77":"q24","78":"q24","79":"q24","80":"q24","81":"q24","82":"q24","83":"q24","84":"q24","85":"q24","86":"q24","87":"q24","88":"q24","89":"q24","90":"q24","95":"q24","97":"q24","98":"q24","99":"q24","100":"q24","101":"q24","102":"q24","103":"q24","104":"q24","105":"q24","106":"q24","107":"q24","108":"q24","109":"q24","110":"q24","111":"q24","112":"q24","113":"q24","114":"q24","115":"q24","116":"q24","117":"q24","118":"q24","119":"q24","120":"q24","121":"q24","122":"q24"},"q25":{"37":"q26"},"q26":{"37":"q27"},"q27":{},"q28":{"65":"q29","66":"q29","67":"q29","68":"q29","69":"q29","70":"q29","71":"q29","72":"q29","73":"q29","74":"q29","75":"q29","76":"q29","77":"q29","78":"q29","79":"q29","80":"q29","81":"q29","82":"q29","83":"q29","84":"q29","85":"q29","86":"q29","87":"q29","88":"q29","89":"q29","90":"q29","97":"q29","98":"q29","99":"q29","100":"q29","101":"q29","102":"q29","103":"q29","104":"q29","105":"q29","106":"q29","107":"q29","108":"q29","109":"q29","110":"q29","111":"q29","112":"q29","113":"q29","114":"q29","115":"q29","116":"q29","117":"q29","118":"q29","119":"q29","120":"q29","121":"q29","122":"q29"},"q29":{"32":"q30","48":"q29","49":"q29","50":"q29","51":"q29","52":"q29","53":"q29","54":"q29","55":"q29","56":"q29","57":"q29","58":"q31","65":"q29","66":"q29","67":"q29","68":"q29","69":"q29","70":"q29","71":"q29","72":"q29","73":"q29","74":"q29","75":"q29","76":"q29","77":"q29","78":"q29","79":"q29","80":"q29","81":"q29","82":"q29","83":"q29","84":"q29","85":"q29","86":"q29","87":"q29","88":"q29","89":"q29","90":"q29","95":"q29","97":"q29","98":"q29","99":"q29","100":"q29","101":"q29","102":"q29","103":"q29","104":"q29","105":"q29","106":"q29","107":"q29","108":"q29","109":"q29","110":"q29","111":"q29","112":"q29","113":"q29","114":"q29","115":"q29","116":"q29","117":"q29","118":"q29","119":"q29","120":"q29","121":"q29","122":"q29"},"q30":{"32":"q30","58":"q31"},"q31":{},"q32":{"65":"q33","66":"q33","67":"q33","68":"q33","69":"q33","70":"q33","71":"q33","72":"q33","73":"q33","74":"q33","75":"q33","76":"q33","77":"q33","78":"q33","79":"q33","80":"q33","81":"q33","82":"q33","83":"q33","84":"q33","85":"q33","86":"q33","87":"q33","88":"q33","89":"q33","90":"q33","97":"q33","98":"q33","99":"q33","100":"q33","101":"q33","102":"q33","103":"q33","104":"q33","105":"q33","106":"q33","107":"q33","108":"q33","109":"q33","110":"q33","111":"q33","112":"q33","113":"q33","114":"q33","115":"q33","116":"q33","117":"q33","118":"q33","119":"q33","120":"q33","121":"q33","122":"q33"},"q33":{"9":"q34","10":"q34","13":"q34","32":"q34","48":"q33","49":"q33","50":"q33","51":"q33","52":"q33","53":"q33","54":"q33","55":"q33","56":"q33","57":"q33","65":"q33","66":"q33","67":"q33","68":"q33","69":"q33","70":"q33","71":"q33","72":"q33","73":"q33","74":"q33","75":"q33","76":"q33","77":"q33","78":"q33","79":"q33","80":"q33","81":"q33","82":"q33","83":"q33","84":"q33","85":"q33","86":"q33","87":"q33","88":"q33","89":"q33","90":"q33","95":"q33","97":"q33","98":"q33","99":"q33","100":"q33","101":"q33","102":"q33","103":"q33","104":"q33","105":"q33","106":"q33","107":"q33","108":"q33","109":"q33","110":"q33","111":"q33","112":"q33","113":"q33","114":"q33","115":"q33","116":"q33","117":"q33","118":"q33","119":"q33","120":"q33","121":"q33","122":"q33"},"q34":{"9":"q34","10":"q34","13":"q34","32":"q34","65":"q35","66":"q35","67":"q35","68":"q35","69":"q35","70":"q35","71":"q35","72":"q35","73":"q35","74":"q35","75":"q35","76":"q35","77":"q35","78":"q35","79":"q35","80":"q35","81":"q35","82":"q35","83":"q35","84":"q35","85":"q35","86":"q35","87":"q35","88":"q35","89":"q35","90":"q35","97":"q35","98":"q35","99":"q35","100":"q35","101":"q35","102":"q35","103":"q35","104":"q35","105":"q35","106":"q35","107":"q35","108":"q35","109":"q35","110":"q35","111":"q35","112":"q35","113":"q35","114":"q35","115":"q35","116":"q35","117":"q35","118":"q35","119":"q35","120":"q35","121":"q35","122":"q35"},"q35":{"9":"q34","10":"q34","13":"q34","32":"q34","48":"q35","49":"q35","50":"q35","51":"q35","52":"q35","53":"q35","54":"q35","55":"q35","56":"q35","57":"q35","65":"q35","66":"q35","67":"q35","68":"q35","69":"q35","70":"q35","71":"q35","72":"q35","73":"q35","74":"q35","75":"q35","76":"q35","77":"q35","78":"q35","79":"q35","80":"q35","81":"q35","82":"q35","83":"q35","84":"q35","85":"q35","86":"q35","87":"q35","88":"q35","89":"q35","90":"q35","95":"q35","97":"q35","98":"q35","99":"q35","100":"q35","101":"q35","102":"q35","103":"q35","104":"q35","105":"q35","106":"q35","107":"q35","108":"q35","109":"q35","110":"q35","111":"q35","112":"q35","113":"q35","114":"q35","115":"q35","116":"q35","117":"q35","118":"q35","119":"q35","120":"q35","121":"q35","122":"q35"},"q36":{"59":"q37"},"q37":{},"q38":{"124":"q39"},"q39":{},"q40":{"9":"q41","10":"q41","13":"q41","32":"q41"},"q41":{}},"finalStates":{"q5":{"9":"q3","10":"q3","13":"q3","32":"q3","33":"q3","34":"q3","35":"q3","36":"q3","37":"q3","38":"q3","39":"q3","40":"q3","41":"q3","42":"q4","43":"q3","44":"q3","45":"q3","46":"q3","47":"q3","48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3","58":"q3","59":"q3","60":"q3","61":"q3","62":"q3","63":"q3","64":"q3","65":"q3","66":"q3","67":"q3","68":"q3","69":"q3","70":"q3","71":"q3","72":"q3","73":"q3","74":"q3","75":"q3","76":"q3","77":"q3","78":"q3","79":"q3","80":"q3","81":"q3","82":"q3","83":"q3","84":"q3","85":"q3","86":"q3","87":"q3","88":"q3","89":"q3","90":"q3","97":"q3","98":"q3","99":"q3","100":"q3","101":"q3","102":"q3","103":"q3","104":"q3","105":"q3","106":"q3","107":"q3","108":"q3","109":"q3","110":"q3","111":"q3","112":"q3","113":"q3","114":"q3","115":"q3","116":"q3","117":"q3","118":"q3","119":"q3","120":"q3","121":"q3","122":"q3"},"q14":{"32":"q13","48":"q14","49":"q14","50":"q14","51":"q14","52":"q14","53":"q14","54":"q14","55":"q14","56":"q14","57":"q14","65":"q14","66":"q14","67":"q14","68":"q14","69":"q14","70":"q14","71":"q14","72":"q14","73":"q14","74":"q14","75":"q14","76":"q14","77":"q14","78":"q14","79":"q14","80":"q14","81":"q14","82":"q14","83":"q14","84":"q14","85":"q14","86":"q14","87":"q14","88":"q14","89":"q14","90":"q14","95":"q14","97":"q14","98":"q14","99":"q14","100":"q14","101":"q14","102":"q14","103":"q14","104":"q14","105":"q14","106":"q14","107":"q14","108":"q14","109":"q14","110":"q14","111":"q14","112":"q14","113":"q14","114":"q14","115":"q14","116":"q14","117":"q14","118":"q14","119":"q14","120":"q14","121":"q14","122":"q14"},"q24":{"48":"q24","49":"q24","50":"q24","51":"q24","52":"q24","53":"q24","54":"q24","55":"q24","56":"q24","57":"q24","65":"q24","66":"q24","67":"q24","68":"q24","69":"q24","70":"q24","71":"q24","72":"q24","73":"q24","74":"q24","75":"q24","76":"q24","77":"q24","78":"q24","79":"q24","80":"q24","81":"q24","82":"q24","83":"q24","84":"q24","85":"q24","86":"q24","87":"q24","88":"q24","89":"q24","90":"q24","95":"q24","97":"q24","98":"q24","99":"q24","100":"q24","101":"q24","102":"q24","103":"q24","104":"q24","105":"q24","106":"q24","107":"q24","108":"q24","109":"q24","110":"q24","111":"q24","112":"q24","113":"q24","114":"q24","115":"q24","116":"q24","117":"q24","118":"q24","119":"q24","120":"q24","121":"q24","122":"q24"},"q27":{},"q31":{},"q33":{"9":"q34","10":"q34","13":"q34","32":"q34","48":"q33","49":"q33","50":"q33","51":"q33","52":"q33","53":"q33","54":"q33","55":"q33","56":"q33","57":"q33","65":"q33","66":"q33","67":"q33","68":"q33","69":"q33","70":"q33","71":"q33","72":"q33","73":"q33","74":"q33","75":"q33","76":"q33","77":"q33","78":"q33","79":"q33","80":"q33","81":"q33","82":"q33","83":"q33","84":"q33","85":"q33","86":"q33","87":"q33","88":"q33","89":"q33","90":"q33","95":"q33","97":"q33","98":"q33","99":"q33","100":"q33","101":"q33","102":"q33","103":"q33","104":"q33","105":"q33","106":"q33","107":"q33","108":"q33","109":"q33","110":"q33","111":"q33","112":"q33","113":"q33","114":"q33","115":"q33","116":"q33","117":"q33","118":"q33","119":"q33","120":"q33","121":"q33","122":"q33"},"q35":{"9":"q34","10":"q34","13":"q34","32":"q34","48":"q35","49":"q35","50":"q35","51":"q35","52":"q35","53":"q35","54":"q35","55":"q35","56":"q35","57":"q35","65":"q35","66":"q35","67":"q35","68":"q35","69":"q35","70":"q35","71":"q35","72":"q35","73":"q35","74":"q35","75":"q35","76":"q35","77":"q35","78":"q35","79":"q35","80":"q35","81":"q35","82":"q35","83":"q35","84":"q35","85":"q35","86":"q35","87":"q35","88":"q35","89":"q35","90":"q35","95":"q35","97":"q35","98":"q35","99":"q35","100":"q35","101":"q35","102":"q35","103":"q35","104":"q35","105":"q35","106":"q35","107":"q35","108":"q35","109":"q35","110":"q35","111":"q35","112":"q35","113":"q35","114":"q35","115":"q35","116":"q35","117":"q35","118":"q35","119":"q35","120":"q35","121":"q35","122":"q35"},"q37":{},"q39":{},"q41":{}}};
    // Read the data
    await readText(filepath)
    .then(data => {
      // The regex Data
      let regD = {"commentary":{"rule":"","finalStates":["q5"]},"tokenDefinition":{"rule":"tokens = [...tokens, ...newToken.replace(\"%token\", \"\").trim().split(\" \")];","finalStates":["q14"]},"ignoreToken":{"rule":"ignoreTokens.push(newToken.replace(\"IGNORE\", \"\").trim());","finalStates":["q24"]},"startProductionSection":{"rule":"if(inProductionSection===false){\r\n        inProductionSection=true\r\n    }\r\n    else{\r\n        throw new Error(\"Already in production section, so the yapar is invalid because it has multiple production sections.\");\r\n    };","finalStates":["q27"]},"productionName":{"rule":"if(!inProductionDefinition){\r\n        inProductionDefinition = true;\r\n        currentProduction = newToken.replace(\":\", \"\").trim();\r\n        productions.set(currentProduction, []);\r\n    }\r\n    else{\r\n        throw new Error(\"Unexpected a production definition, so the yapar is invalid because the production doesn't have anything.\");\r\n    }","finalStates":["q31"]},"individualProduction":{"rule":"productions.get(currentProduction).push(newToken.split(\" \"));\r\n    foundIndividualProduction = true;","finalStates":["q33","q35"]},"TOKEN_0":{"rule":"if (!foundIndividualProduction){\r\n\tproductions.get(currentProduction).push(['']);\r\n    };\r\n    inProductionDefinition = false;\r\n    foundIndividualProduction = false;","finalStates":["q37"]},"TOKEN_1":{"rule":"foundIndividualProduction = false;","finalStates":["q39"]},"delim":{"rule":"","finalStates":["q41"]}};
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

async function tokenizeYapar(filepath){
  await tokenize(filepath);
  return [tokens, ignoreTokens, productions];
}
module.exports = {tokenizeYapar};
