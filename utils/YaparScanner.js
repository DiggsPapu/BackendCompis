
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
let yalexNFA = {"alphabet":[47,42,48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,10,13,9,32,33,34,35,36,37,38,39,40,41,43,44,45,46,58,59,60,61,62,63,64,37,116,111,107,101,110,32,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,97,98,99,100,102,103,104,105,106,108,109,112,113,114,115,117,118,119,120,121,122,48,49,50,51,52,53,54,55,56,57,95,73,71,78,79,82,69,32,65,66,67,68,70,72,74,75,76,77,80,81,83,84,85,86,87,88,89,90,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,48,49,50,51,52,53,54,55,56,57,95,37,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,48,49,50,51,52,53,54,55,56,57,95,32,58,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,48,49,50,51,52,53,54,55,56,57,95,10,13,9,32,59,124,10,13,9,32],"initialState":{"name":"init","transitions":{"ε":["q0","q6","q17","q27","q30","q35","q41","q43","q45"]}},"states":{"q0":{"47":"q1"},"q1":{"42":"q2"},"q2":{"9":"q3","10":"q3","13":"q3","32":"q3","33":"q3","34":"q3","35":"q3","36":"q3","37":"q3","38":"q3","39":"q3","40":"q3","41":"q3","42":"q3","43":"q3","44":"q3","45":"q3","46":"q3","47":"q3","48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3","58":"q3","59":"q3","60":"q3","61":"q3","62":"q3","63":"q3","64":"q3","65":"q3","66":"q3","67":"q3","68":"q3","69":"q3","70":"q3","71":"q3","72":"q3","73":"q3","74":"q3","75":"q3","76":"q3","77":"q3","78":"q3","79":"q3","80":"q3","81":"q3","82":"q3","83":"q3","84":"q3","85":"q3","86":"q3","87":"q3","88":"q3","89":"q3","90":"q3","97":"q3","98":"q3","99":"q3","100":"q3","101":"q3","102":"q3","103":"q3","104":"q3","105":"q3","106":"q3","107":"q3","108":"q3","109":"q3","110":"q3","111":"q3","112":"q3","113":"q3","114":"q3","115":"q3","116":"q3","117":"q3","118":"q3","119":"q3","120":"q3","121":"q3","122":"q3"},"q3":{"9":"q3","10":"q3","13":"q3","32":"q3","33":"q3","34":"q3","35":"q3","36":"q3","37":"q3","38":"q3","39":"q3","40":"q3","41":"q3","42":"q4","43":"q3","44":"q3","45":"q3","46":"q3","47":"q3","48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3","58":"q3","59":"q3","60":"q3","61":"q3","62":"q3","63":"q3","64":"q3","65":"q3","66":"q3","67":"q3","68":"q3","69":"q3","70":"q3","71":"q3","72":"q3","73":"q3","74":"q3","75":"q3","76":"q3","77":"q3","78":"q3","79":"q3","80":"q3","81":"q3","82":"q3","83":"q3","84":"q3","85":"q3","86":"q3","87":"q3","88":"q3","89":"q3","90":"q3","97":"q3","98":"q3","99":"q3","100":"q3","101":"q3","102":"q3","103":"q3","104":"q3","105":"q3","106":"q3","107":"q3","108":"q3","109":"q3","110":"q3","111":"q3","112":"q3","113":"q3","114":"q3","115":"q3","116":"q3","117":"q3","118":"q3","119":"q3","120":"q3","121":"q3","122":"q3"},"q4":{"9":"q3","10":"q3","13":"q3","32":"q3","33":"q3","34":"q3","35":"q3","36":"q3","37":"q3","38":"q3","39":"q3","40":"q3","41":"q3","42":"q4","43":"q3","44":"q3","45":"q3","46":"q3","47":"q5","48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3","58":"q3","59":"q3","60":"q3","61":"q3","62":"q3","63":"q3","64":"q3","65":"q3","66":"q3","67":"q3","68":"q3","69":"q3","70":"q3","71":"q3","72":"q3","73":"q3","74":"q3","75":"q3","76":"q3","77":"q3","78":"q3","79":"q3","80":"q3","81":"q3","82":"q3","83":"q3","84":"q3","85":"q3","86":"q3","87":"q3","88":"q3","89":"q3","90":"q3","97":"q3","98":"q3","99":"q3","100":"q3","101":"q3","102":"q3","103":"q3","104":"q3","105":"q3","106":"q3","107":"q3","108":"q3","109":"q3","110":"q3","111":"q3","112":"q3","113":"q3","114":"q3","115":"q3","116":"q3","117":"q3","118":"q3","119":"q3","120":"q3","121":"q3","122":"q3"},"q5":{"9":"q3","10":"q3","13":"q3","32":"q3","33":"q3","34":"q3","35":"q3","36":"q3","37":"q3","38":"q3","39":"q3","40":"q3","41":"q3","42":"q4","43":"q3","44":"q3","45":"q3","46":"q3","47":"q3","48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3","58":"q3","59":"q3","60":"q3","61":"q3","62":"q3","63":"q3","64":"q3","65":"q3","66":"q3","67":"q3","68":"q3","69":"q3","70":"q3","71":"q3","72":"q3","73":"q3","74":"q3","75":"q3","76":"q3","77":"q3","78":"q3","79":"q3","80":"q3","81":"q3","82":"q3","83":"q3","84":"q3","85":"q3","86":"q3","87":"q3","88":"q3","89":"q3","90":"q3","97":"q3","98":"q3","99":"q3","100":"q3","101":"q3","102":"q3","103":"q3","104":"q3","105":"q3","106":"q3","107":"q3","108":"q3","109":"q3","110":"q3","111":"q3","112":"q3","113":"q3","114":"q3","115":"q3","116":"q3","117":"q3","118":"q3","119":"q3","120":"q3","121":"q3","122":"q3"},"init":{"ε":["q0","q6","q17","q27","q30","q35","q41","q43","q45"]},"q6":{"37":"q7"},"q7":{"116":"q8"},"q8":{"111":"q9"},"q9":{"107":"q10"},"q10":{"101":"q11"},"q11":{"110":"q12"},"q12":{"32":"q13"},"q13":{"32":"q13","65":"q14","66":"q14","67":"q14","68":"q14","69":"q14","70":"q14","71":"q14","72":"q14","73":"q14","74":"q14","75":"q14","76":"q14","77":"q14","78":"q14","79":"q14","80":"q14","81":"q14","82":"q14","83":"q14","84":"q14","85":"q14","86":"q14","87":"q14","88":"q14","89":"q14","90":"q14","97":"q14","98":"q14","99":"q14","100":"q14","101":"q14","102":"q14","103":"q14","104":"q14","105":"q14","106":"q14","107":"q14","108":"q14","109":"q14","110":"q14","111":"q14","112":"q14","113":"q14","114":"q14","115":"q14","116":"q14","117":"q14","118":"q14","119":"q14","120":"q14","121":"q14","122":"q14"},"q14":{"48":"q15","49":"q15","50":"q15","51":"q15","52":"q15","53":"q15","54":"q15","55":"q15","56":"q15","57":"q15","65":"q15","66":"q15","67":"q15","68":"q15","69":"q15","70":"q15","71":"q15","72":"q15","73":"q15","74":"q15","75":"q15","76":"q15","77":"q15","78":"q15","79":"q15","80":"q15","81":"q15","82":"q15","83":"q15","84":"q15","85":"q15","86":"q15","87":"q15","88":"q15","89":"q15","90":"q15","95":"q15","97":"q15","98":"q15","99":"q15","100":"q15","101":"q15","102":"q15","103":"q15","104":"q15","105":"q15","106":"q15","107":"q15","108":"q15","109":"q15","110":"q15","111":"q15","112":"q15","113":"q15","114":"q15","115":"q15","116":"q15","117":"q15","118":"q15","119":"q15","120":"q15","121":"q15","122":"q15"},"q15":{"32":"q13","48":"q15","49":"q15","50":"q15","51":"q15","52":"q15","53":"q15","54":"q15","55":"q15","56":"q15","57":"q15","65":"q15","66":"q15","67":"q15","68":"q15","69":"q15","70":"q15","71":"q15","72":"q15","73":"q15","74":"q15","75":"q15","76":"q15","77":"q15","78":"q15","79":"q15","80":"q15","81":"q15","82":"q15","83":"q15","84":"q15","85":"q15","86":"q15","87":"q15","88":"q15","89":"q15","90":"q15","95":"q15","97":"q15","98":"q15","99":"q15","100":"q15","101":"q15","102":"q15","103":"q15","104":"q15","105":"q15","106":"q15","107":"q15","108":"q15","109":"q15","110":"q15","111":"q15","112":"q15","113":"q15","114":"q15","115":"q15","116":"q15","117":"q15","118":"q15","119":"q15","120":"q15","121":"q15","122":"q15"},"q17":{"73":"q18"},"q18":{"71":"q19"},"q19":{"78":"q20"},"q20":{"79":"q21"},"q21":{"82":"q22"},"q22":{"69":"q23"},"q23":{"32":"q24"},"q24":{"32":"q24","65":"q25","66":"q25","67":"q25","68":"q25","69":"q25","70":"q25","71":"q25","72":"q25","73":"q25","74":"q25","75":"q25","76":"q25","77":"q25","78":"q25","79":"q25","80":"q25","81":"q25","82":"q25","83":"q25","84":"q25","85":"q25","86":"q25","87":"q25","88":"q25","89":"q25","90":"q25","97":"q25","98":"q25","99":"q25","100":"q25","101":"q25","102":"q25","103":"q25","104":"q25","105":"q25","106":"q25","107":"q25","108":"q25","109":"q25","110":"q25","111":"q25","112":"q25","113":"q25","114":"q25","115":"q25","116":"q25","117":"q25","118":"q25","119":"q25","120":"q25","121":"q25","122":"q25"},"q25":{"48":"q26","49":"q26","50":"q26","51":"q26","52":"q26","53":"q26","54":"q26","55":"q26","56":"q26","57":"q26","65":"q26","66":"q26","67":"q26","68":"q26","69":"q26","70":"q26","71":"q26","72":"q26","73":"q26","74":"q26","75":"q26","76":"q26","77":"q26","78":"q26","79":"q26","80":"q26","81":"q26","82":"q26","83":"q26","84":"q26","85":"q26","86":"q26","87":"q26","88":"q26","89":"q26","90":"q26","95":"q26","97":"q26","98":"q26","99":"q26","100":"q26","101":"q26","102":"q26","103":"q26","104":"q26","105":"q26","106":"q26","107":"q26","108":"q26","109":"q26","110":"q26","111":"q26","112":"q26","113":"q26","114":"q26","115":"q26","116":"q26","117":"q26","118":"q26","119":"q26","120":"q26","121":"q26","122":"q26"},"q26":{"48":"q26","49":"q26","50":"q26","51":"q26","52":"q26","53":"q26","54":"q26","55":"q26","56":"q26","57":"q26","65":"q26","66":"q26","67":"q26","68":"q26","69":"q26","70":"q26","71":"q26","72":"q26","73":"q26","74":"q26","75":"q26","76":"q26","77":"q26","78":"q26","79":"q26","80":"q26","81":"q26","82":"q26","83":"q26","84":"q26","85":"q26","86":"q26","87":"q26","88":"q26","89":"q26","90":"q26","95":"q26","97":"q26","98":"q26","99":"q26","100":"q26","101":"q26","102":"q26","103":"q26","104":"q26","105":"q26","106":"q26","107":"q26","108":"q26","109":"q26","110":"q26","111":"q26","112":"q26","113":"q26","114":"q26","115":"q26","116":"q26","117":"q26","118":"q26","119":"q26","120":"q26","121":"q26","122":"q26"},"q27":{"37":"q28"},"q28":{"37":"q29"},"q29":{},"q30":{"65":"q31","66":"q31","67":"q31","68":"q31","69":"q31","70":"q31","71":"q31","72":"q31","73":"q31","74":"q31","75":"q31","76":"q31","77":"q31","78":"q31","79":"q31","80":"q31","81":"q31","82":"q31","83":"q31","84":"q31","85":"q31","86":"q31","87":"q31","88":"q31","89":"q31","90":"q31","97":"q31","98":"q31","99":"q31","100":"q31","101":"q31","102":"q31","103":"q31","104":"q31","105":"q31","106":"q31","107":"q31","108":"q31","109":"q31","110":"q31","111":"q31","112":"q31","113":"q31","114":"q31","115":"q31","116":"q31","117":"q31","118":"q31","119":"q31","120":"q31","121":"q31","122":"q31"},"q31":{"48":"q32","49":"q32","50":"q32","51":"q32","52":"q32","53":"q32","54":"q32","55":"q32","56":"q32","57":"q32","65":"q32","66":"q32","67":"q32","68":"q32","69":"q32","70":"q32","71":"q32","72":"q32","73":"q32","74":"q32","75":"q32","76":"q32","77":"q32","78":"q32","79":"q32","80":"q32","81":"q32","82":"q32","83":"q32","84":"q32","85":"q32","86":"q32","87":"q32","88":"q32","89":"q32","90":"q32","95":"q32","97":"q32","98":"q32","99":"q32","100":"q32","101":"q32","102":"q32","103":"q32","104":"q32","105":"q32","106":"q32","107":"q32","108":"q32","109":"q32","110":"q32","111":"q32","112":"q32","113":"q32","114":"q32","115":"q32","116":"q32","117":"q32","118":"q32","119":"q32","120":"q32","121":"q32","122":"q32"},"q32":{"32":"q33","48":"q32","49":"q32","50":"q32","51":"q32","52":"q32","53":"q32","54":"q32","55":"q32","56":"q32","57":"q32","58":"q34","65":"q32","66":"q32","67":"q32","68":"q32","69":"q32","70":"q32","71":"q32","72":"q32","73":"q32","74":"q32","75":"q32","76":"q32","77":"q32","78":"q32","79":"q32","80":"q32","81":"q32","82":"q32","83":"q32","84":"q32","85":"q32","86":"q32","87":"q32","88":"q32","89":"q32","90":"q32","95":"q32","97":"q32","98":"q32","99":"q32","100":"q32","101":"q32","102":"q32","103":"q32","104":"q32","105":"q32","106":"q32","107":"q32","108":"q32","109":"q32","110":"q32","111":"q32","112":"q32","113":"q32","114":"q32","115":"q32","116":"q32","117":"q32","118":"q32","119":"q32","120":"q32","121":"q32","122":"q32"},"q33":{"32":"q33","58":"q34"},"q34":{},"q35":{"65":"q36","66":"q36","67":"q36","68":"q36","69":"q36","70":"q36","71":"q36","72":"q36","73":"q36","74":"q36","75":"q36","76":"q36","77":"q36","78":"q36","79":"q36","80":"q36","81":"q36","82":"q36","83":"q36","84":"q36","85":"q36","86":"q36","87":"q36","88":"q36","89":"q36","90":"q36","97":"q36","98":"q36","99":"q36","100":"q36","101":"q36","102":"q36","103":"q36","104":"q36","105":"q36","106":"q36","107":"q36","108":"q36","109":"q36","110":"q36","111":"q36","112":"q36","113":"q36","114":"q36","115":"q36","116":"q36","117":"q36","118":"q36","119":"q36","120":"q36","121":"q36","122":"q36"},"q36":{"48":"q37","49":"q37","50":"q37","51":"q37","52":"q37","53":"q37","54":"q37","55":"q37","56":"q37","57":"q37","65":"q37","66":"q37","67":"q37","68":"q37","69":"q37","70":"q37","71":"q37","72":"q37","73":"q37","74":"q37","75":"q37","76":"q37","77":"q37","78":"q37","79":"q37","80":"q37","81":"q37","82":"q37","83":"q37","84":"q37","85":"q37","86":"q37","87":"q37","88":"q37","89":"q37","90":"q37","95":"q37","97":"q37","98":"q37","99":"q37","100":"q37","101":"q37","102":"q37","103":"q37","104":"q37","105":"q37","106":"q37","107":"q37","108":"q37","109":"q37","110":"q37","111":"q37","112":"q37","113":"q37","114":"q37","115":"q37","116":"q37","117":"q37","118":"q37","119":"q37","120":"q37","121":"q37","122":"q37"},"q37":{"9":"q38","10":"q38","13":"q38","32":"q38","48":"q37","49":"q37","50":"q37","51":"q37","52":"q37","53":"q37","54":"q37","55":"q37","56":"q37","57":"q37","65":"q37","66":"q37","67":"q37","68":"q37","69":"q37","70":"q37","71":"q37","72":"q37","73":"q37","74":"q37","75":"q37","76":"q37","77":"q37","78":"q37","79":"q37","80":"q37","81":"q37","82":"q37","83":"q37","84":"q37","85":"q37","86":"q37","87":"q37","88":"q37","89":"q37","90":"q37","95":"q37","97":"q37","98":"q37","99":"q37","100":"q37","101":"q37","102":"q37","103":"q37","104":"q37","105":"q37","106":"q37","107":"q37","108":"q37","109":"q37","110":"q37","111":"q37","112":"q37","113":"q37","114":"q37","115":"q37","116":"q37","117":"q37","118":"q37","119":"q37","120":"q37","121":"q37","122":"q37"},"q38":{"9":"q38","10":"q38","13":"q38","32":"q38","65":"q39","66":"q39","67":"q39","68":"q39","69":"q39","70":"q39","71":"q39","72":"q39","73":"q39","74":"q39","75":"q39","76":"q39","77":"q39","78":"q39","79":"q39","80":"q39","81":"q39","82":"q39","83":"q39","84":"q39","85":"q39","86":"q39","87":"q39","88":"q39","89":"q39","90":"q39","97":"q39","98":"q39","99":"q39","100":"q39","101":"q39","102":"q39","103":"q39","104":"q39","105":"q39","106":"q39","107":"q39","108":"q39","109":"q39","110":"q39","111":"q39","112":"q39","113":"q39","114":"q39","115":"q39","116":"q39","117":"q39","118":"q39","119":"q39","120":"q39","121":"q39","122":"q39"},"q39":{"48":"q40","49":"q40","50":"q40","51":"q40","52":"q40","53":"q40","54":"q40","55":"q40","56":"q40","57":"q40","65":"q40","66":"q40","67":"q40","68":"q40","69":"q40","70":"q40","71":"q40","72":"q40","73":"q40","74":"q40","75":"q40","76":"q40","77":"q40","78":"q40","79":"q40","80":"q40","81":"q40","82":"q40","83":"q40","84":"q40","85":"q40","86":"q40","87":"q40","88":"q40","89":"q40","90":"q40","95":"q40","97":"q40","98":"q40","99":"q40","100":"q40","101":"q40","102":"q40","103":"q40","104":"q40","105":"q40","106":"q40","107":"q40","108":"q40","109":"q40","110":"q40","111":"q40","112":"q40","113":"q40","114":"q40","115":"q40","116":"q40","117":"q40","118":"q40","119":"q40","120":"q40","121":"q40","122":"q40"},"q40":{"9":"q38","10":"q38","13":"q38","32":"q38","48":"q40","49":"q40","50":"q40","51":"q40","52":"q40","53":"q40","54":"q40","55":"q40","56":"q40","57":"q40","65":"q40","66":"q40","67":"q40","68":"q40","69":"q40","70":"q40","71":"q40","72":"q40","73":"q40","74":"q40","75":"q40","76":"q40","77":"q40","78":"q40","79":"q40","80":"q40","81":"q40","82":"q40","83":"q40","84":"q40","85":"q40","86":"q40","87":"q40","88":"q40","89":"q40","90":"q40","95":"q40","97":"q40","98":"q40","99":"q40","100":"q40","101":"q40","102":"q40","103":"q40","104":"q40","105":"q40","106":"q40","107":"q40","108":"q40","109":"q40","110":"q40","111":"q40","112":"q40","113":"q40","114":"q40","115":"q40","116":"q40","117":"q40","118":"q40","119":"q40","120":"q40","121":"q40","122":"q40"},"q41":{"59":"q42"},"q42":{},"q43":{"124":"q44"},"q44":{},"q45":{"9":"q46","10":"q46","13":"q46","32":"q46"},"q46":{}},"finalStates":{"q5":{"9":"q3","10":"q3","13":"q3","32":"q3","33":"q3","34":"q3","35":"q3","36":"q3","37":"q3","38":"q3","39":"q3","40":"q3","41":"q3","42":"q4","43":"q3","44":"q3","45":"q3","46":"q3","47":"q3","48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3","58":"q3","59":"q3","60":"q3","61":"q3","62":"q3","63":"q3","64":"q3","65":"q3","66":"q3","67":"q3","68":"q3","69":"q3","70":"q3","71":"q3","72":"q3","73":"q3","74":"q3","75":"q3","76":"q3","77":"q3","78":"q3","79":"q3","80":"q3","81":"q3","82":"q3","83":"q3","84":"q3","85":"q3","86":"q3","87":"q3","88":"q3","89":"q3","90":"q3","97":"q3","98":"q3","99":"q3","100":"q3","101":"q3","102":"q3","103":"q3","104":"q3","105":"q3","106":"q3","107":"q3","108":"q3","109":"q3","110":"q3","111":"q3","112":"q3","113":"q3","114":"q3","115":"q3","116":"q3","117":"q3","118":"q3","119":"q3","120":"q3","121":"q3","122":"q3"},"q15":{"32":"q13","48":"q15","49":"q15","50":"q15","51":"q15","52":"q15","53":"q15","54":"q15","55":"q15","56":"q15","57":"q15","65":"q15","66":"q15","67":"q15","68":"q15","69":"q15","70":"q15","71":"q15","72":"q15","73":"q15","74":"q15","75":"q15","76":"q15","77":"q15","78":"q15","79":"q15","80":"q15","81":"q15","82":"q15","83":"q15","84":"q15","85":"q15","86":"q15","87":"q15","88":"q15","89":"q15","90":"q15","95":"q15","97":"q15","98":"q15","99":"q15","100":"q15","101":"q15","102":"q15","103":"q15","104":"q15","105":"q15","106":"q15","107":"q15","108":"q15","109":"q15","110":"q15","111":"q15","112":"q15","113":"q15","114":"q15","115":"q15","116":"q15","117":"q15","118":"q15","119":"q15","120":"q15","121":"q15","122":"q15"},"q26":{"48":"q26","49":"q26","50":"q26","51":"q26","52":"q26","53":"q26","54":"q26","55":"q26","56":"q26","57":"q26","65":"q26","66":"q26","67":"q26","68":"q26","69":"q26","70":"q26","71":"q26","72":"q26","73":"q26","74":"q26","75":"q26","76":"q26","77":"q26","78":"q26","79":"q26","80":"q26","81":"q26","82":"q26","83":"q26","84":"q26","85":"q26","86":"q26","87":"q26","88":"q26","89":"q26","90":"q26","95":"q26","97":"q26","98":"q26","99":"q26","100":"q26","101":"q26","102":"q26","103":"q26","104":"q26","105":"q26","106":"q26","107":"q26","108":"q26","109":"q26","110":"q26","111":"q26","112":"q26","113":"q26","114":"q26","115":"q26","116":"q26","117":"q26","118":"q26","119":"q26","120":"q26","121":"q26","122":"q26"},"q29":{},"q34":{},"q37":{"9":"q38","10":"q38","13":"q38","32":"q38","48":"q37","49":"q37","50":"q37","51":"q37","52":"q37","53":"q37","54":"q37","55":"q37","56":"q37","57":"q37","65":"q37","66":"q37","67":"q37","68":"q37","69":"q37","70":"q37","71":"q37","72":"q37","73":"q37","74":"q37","75":"q37","76":"q37","77":"q37","78":"q37","79":"q37","80":"q37","81":"q37","82":"q37","83":"q37","84":"q37","85":"q37","86":"q37","87":"q37","88":"q37","89":"q37","90":"q37","95":"q37","97":"q37","98":"q37","99":"q37","100":"q37","101":"q37","102":"q37","103":"q37","104":"q37","105":"q37","106":"q37","107":"q37","108":"q37","109":"q37","110":"q37","111":"q37","112":"q37","113":"q37","114":"q37","115":"q37","116":"q37","117":"q37","118":"q37","119":"q37","120":"q37","121":"q37","122":"q37"},"q40":{"9":"q38","10":"q38","13":"q38","32":"q38","48":"q40","49":"q40","50":"q40","51":"q40","52":"q40","53":"q40","54":"q40","55":"q40","56":"q40","57":"q40","65":"q40","66":"q40","67":"q40","68":"q40","69":"q40","70":"q40","71":"q40","72":"q40","73":"q40","74":"q40","75":"q40","76":"q40","77":"q40","78":"q40","79":"q40","80":"q40","81":"q40","82":"q40","83":"q40","84":"q40","85":"q40","86":"q40","87":"q40","88":"q40","89":"q40","90":"q40","95":"q40","97":"q40","98":"q40","99":"q40","100":"q40","101":"q40","102":"q40","103":"q40","104":"q40","105":"q40","106":"q40","107":"q40","108":"q40","109":"q40","110":"q40","111":"q40","112":"q40","113":"q40","114":"q40","115":"q40","116":"q40","117":"q40","118":"q40","119":"q40","120":"q40","121":"q40","122":"q40"},"q42":{},"q44":{},"q46":{}}};
// Read the data
await readText(filepath)
.then(data => {
  // The regex Data
  let regD = {"commentary":{"rule":"","finalStates":["q5"]},"tokenDefinition":{"rule":"tokens = [...tokens, ...newToken.replace(\"%token\", \"\").trim().split(\" \")];","finalStates":["q15"]},"ignoreToken":{"rule":"ignoreTokens.push(newToken.replace(\"IGNORE\", \"\").trim());","finalStates":["q26"]},"startProductionSection":{"rule":"if(inProductionSection===false){\r\n        inProductionSection=true\r\n    }\r\n    else{\r\n        throw new Error(\"Already in production section, so the yapar is invalid because it has multiple production sections.\");\r\n    };","finalStates":["q29"]},"productionName":{"rule":"if(!inProductionDefinition){\r\n        inProductionDefinition = true;\r\n        currentProduction = newToken.replace(\":\", \"\").trim();\r\n        productions.set(currentProduction, []);\r\n    }\r\n    else{\r\n        throw new Error(\"Unexpected a production definition, so the yapar is invalid because the production doesn't have anything.\");\r\n    }","finalStates":["q34"]},"individualProduction":{"rule":"productions.get(currentProduction).push(newToken.split(\" \"));\r\n    foundIndividualProduction = true;","finalStates":["q37","q40"]},"TOKEN_0":{"rule":"if (!foundIndividualProduction){\r\n\tproductions.get(currentProduction).push(['']);\r\n    };\r\n    inProductionDefinition = false;\r\n    foundIndividualProduction = false;","finalStates":["q42"]},"TOKEN_1":{"rule":"foundIndividualProduction = false;","finalStates":["q44"]},"delim":{"rule":"","finalStates":["q46"]}};
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
// tokenize("./texts/texto.txt");

async function tokenizeYapar(filepath){
await tokenize(filepath);
return [tokens, ignoreTokens, productions];
}
module.exports = {tokenizeYapar};
