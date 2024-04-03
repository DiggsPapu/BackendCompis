
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
    let c = input[indexInput];
    while (indexInput<input.length) {
      S = this.eClosureT(this.move(S, c, this),this);
      indexInput++;
      c = input[indexInput];
    };
    for (let indexState = 0; indexState < S.length; indexState++) {
      if (typeof(this.finalState)!==Array && S[indexState].label === this.finalState.label){
        return true;
      } 
      else if (this.checkState(S[indexState].label, this.finalState)){
        return true;
      };
    };
    return false;
  };
  simulate2 = (input) => {
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
    // Deserialize the tokenizer Automathon
    let tokenizerNFA = {"alphabet":[" ","\n","\r","\t","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","[","]","0","1","2","3","4","5","6","7","8","9",":","+","*","(",")",".","|","?","á","é","í","ó","ú","Á","É","Í","Ó","Ú","\\",";",",","!","_","-","/","^","=",">","<","%","\"","\n","\t","\r","\b"," ","{","}"],"initialState":{"name":"init","transitions":{"ε":["q0","q2"]}},"states":{"q0":{" ":"q1","\n":"q1","\r":"q1","\t":"q1"},"q1":{" ":"q1","\n":"q1","\r":"q1","\t":"q1"},"init":{"ε":["q0","q2"]},"q2":{"0":"q3","1":"q3","2":"q3","3":"q3","4":"q3","5":"q3","6":"q3","7":"q3","8":"q3","9":"q3","A":"q3","B":"q3","C":"q3","D":"q3","E":"q3","F":"q3","G":"q3","H":"q3","I":"q3","J":"q3","K":"q3","L":"q3","M":"q3","N":"q3","O":"q3","P":"q3","Q":"q3","R":"q3","S":"q3","T":"q3","U":"q3","V":"q3","W":"q3","X":"q3","Y":"q3","Z":"q3","a":"q3","b":"q3","c":"q3","d":"q3","e":"q3","f":"q3","g":"q3","h":"q3","i":"q3","j":"q3","k":"q3","l":"q3","m":"q3","n":"q3","o":"q3","p":"q3","q":"q3","r":"q3","s":"q3","t":"q3","u":"q3","v":"q3","w":"q3","x":"q3","y":"q3","z":"q3","[":"q3","]":"q3",":":"q3","+":"q3","*":"q3","(":"q3",")":"q3",".":"q3","|":"q3","?":"q3","á":"q3","é":"q3","í":"q3","ó":"q3","ú":"q3","Á":"q3","É":"q3","Í":"q3","Ó":"q3","Ú":"q3","\\":"q4",";":"q3",",":"q3","!":"q3","_":"q3","-":"q3","/":"q3","^":"q3","=":"q3",">":"q3","<":"q3","%":"q3","\"":"q5","{":"q3","}":"q3"},"q3":{"0":"q3","1":"q3","2":"q3","3":"q3","4":"q3","5":"q3","6":"q3","7":"q3","8":"q3","9":"q3","A":"q3","B":"q3","C":"q3","D":"q3","E":"q3","F":"q3","G":"q3","H":"q3","I":"q3","J":"q3","K":"q3","L":"q3","M":"q3","N":"q3","O":"q3","P":"q3","Q":"q3","R":"q3","S":"q3","T":"q3","U":"q3","V":"q3","W":"q3","X":"q3","Y":"q3","Z":"q3","a":"q3","b":"q3","c":"q3","d":"q3","e":"q3","f":"q3","g":"q3","h":"q3","i":"q3","j":"q3","k":"q3","l":"q3","m":"q3","n":"q3","o":"q3","p":"q3","q":"q3","r":"q3","s":"q3","t":"q3","u":"q3","v":"q3","w":"q3","x":"q3","y":"q3","z":"q3","[":"q3","]":"q3",":":"q3","+":"q3","*":"q3","(":"q3",")":"q3",".":"q3","|":"q3","?":"q3","á":"q3","é":"q3","í":"q3","ó":"q3","ú":"q3","Á":"q3","É":"q3","Í":"q3","Ó":"q3","Ú":"q3","\\":"q4",";":"q3",",":"q3","!":"q3","_":"q3","-":"q3","/":"q3","^":"q3","=":"q3",">":"q3","<":"q3","%":"q3","\"":"q5","\n":"q8","\t":"q8","\r":"q8"," ":"q8","{":"q3","}":"q3"},"q4":{"b":"q3","f":"q3","n":"q3","r":"q3","s":"q3","t":"q3"},"q5":{"0":"q6","1":"q6","2":"q6","3":"q6","4":"q6","5":"q6","6":"q6","7":"q6","8":"q6","9":"q6","A":"q6","B":"q6","C":"q6","D":"q6","E":"q6","F":"q6","G":"q6","H":"q6","I":"q6","J":"q6","K":"q6","L":"q6","M":"q6","N":"q6","O":"q6","P":"q6","Q":"q6","R":"q6","S":"q6","T":"q6","U":"q6","V":"q6","W":"q6","X":"q6","Y":"q6","Z":"q6","a":"q6","b":"q6","c":"q6","d":"q6","e":"q6","f":"q6","g":"q6","h":"q6","i":"q6","j":"q6","k":"q6","l":"q6","m":"q6","n":"q6","o":"q6","p":"q6","q":"q6","r":"q6","s":"q6","t":"q6","u":"q6","v":"q6","w":"q6","x":"q6","y":"q6","z":"q6",":":"q6","+":"q6","*":"q6","(":"q6",")":"q6",".":"q6","?":"q6","\\":"q7",";":"q6",",":"q6","!":"q6","_":"q6","-":"q6","/":"q6","^":"q6","=":"q6",">":"q6","<":"q6","%":"q6","\n":"q6","\t":"q6","\r":"q6","\b":"q6"," ":"q6"},"q6":{"0":"q6","1":"q6","2":"q6","3":"q6","4":"q6","5":"q6","6":"q6","7":"q6","8":"q6","9":"q6","A":"q6","B":"q6","C":"q6","D":"q6","E":"q6","F":"q6","G":"q6","H":"q6","I":"q6","J":"q6","K":"q6","L":"q6","M":"q6","N":"q6","O":"q6","P":"q6","Q":"q6","R":"q6","S":"q6","T":"q6","U":"q6","V":"q6","W":"q6","X":"q6","Y":"q6","Z":"q6","a":"q6","b":"q6","c":"q6","d":"q6","e":"q6","f":"q6","g":"q6","h":"q6","i":"q6","j":"q6","k":"q6","l":"q6","m":"q6","n":"q6","o":"q6","p":"q6","q":"q6","r":"q6","s":"q6","t":"q6","u":"q6","v":"q6","w":"q6","x":"q6","y":"q6","z":"q6",":":"q6","+":"q6","*":"q6","(":"q6",")":"q6",".":"q6","?":"q6","\\":"q7",";":"q6",",":"q6","!":"q6","_":"q6","-":"q6","/":"q6","^":"q6","=":"q6",">":"q6","<":"q6","%":"q6","\"":"q3","\n":"q6","\t":"q6","\r":"q6","\b":"q6"," ":"q6"},"q7":{"b":"q6","f":"q6","n":"q6","r":"q6","s":"q6","t":"q6"},"q8":{}},"finalStates":{"q1":{" ":"q1","\n":"q1","\r":"q1","\t":"q1"},"q8":{}}};
    // Deserialize the yalex Automathon
    let yalexNFA = {"alphabet":[73,70,70,79,82,43,45,42,47,40,41,48,49,50,51,52,53,54,55,56,57,43,45,48,49,50,51,52,53,54,55,56,57,44,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,48,49,50,51,52,53,54,55,56,57,34,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,48,49,50,51,52,53,54,55,56,57,32],"initialState":{"name":"init","transitions":{"ε":["q0","q3","q8","q10","q12","q14","q16","q18","q20","q22","q27","q30"]}},"states":{"q0":{"73":"q1"},"q1":{"70":"q2"},"q2":{},"init":{"ε":["q0","q3","q8","q10","q12","q14","q16","q18","q20","q22","q27","q30"]},"q3":{"70":"q4"},"q4":{"79":"q5"},"q5":{"82":"q6"},"q6":{},"q8":{"43":"q9"},"q9":{},"q10":{"45":"q11"},"q11":{},"q12":{"42":"q13"},"q13":{},"q14":{"47":"q15"},"q15":{},"q16":{"40":"q17"},"q17":{},"q18":{"41":"q19"},"q19":{},"q20":{"48":"q21","49":"q21","50":"q21","51":"q21","52":"q21","53":"q21","54":"q21","55":"q21","56":"q21","57":"q21"},"q21":{"48":"q21","49":"q21","50":"q21","51":"q21","52":"q21","53":"q21","54":"q21","55":"q21","56":"q21","57":"q21"},"q22":{"43":"q23","45":"q23"},"q23":{"48":"q24","49":"q24","50":"q24","51":"q24","52":"q24","53":"q24","54":"q24","55":"q24","56":"q24","57":"q24"},"q24":{"44":"q25","48":"q24","49":"q24","50":"q24","51":"q24","52":"q24","53":"q24","54":"q24","55":"q24","56":"q24","57":"q24"},"q25":{"48":"q26","49":"q26","50":"q26","51":"q26","52":"q26","53":"q26","54":"q26","55":"q26","56":"q26","57":"q26"},"q26":{"48":"q26","49":"q26","50":"q26","51":"q26","52":"q26","53":"q26","54":"q26","55":"q26","56":"q26","57":"q26"},"q27":{"65":"q28","66":"q28","67":"q28","68":"q28","69":"q28","70":"q28","71":"q28","72":"q28","73":"q28","74":"q28","75":"q28","76":"q28","77":"q28","78":"q28","79":"q28","80":"q28","81":"q28","82":"q28","83":"q28","84":"q28","85":"q28","86":"q28","87":"q28","88":"q28","89":"q28","90":"q28","97":"q28","98":"q28","99":"q28","100":"q28","101":"q28","102":"q28","103":"q28","104":"q28","105":"q28","106":"q28","107":"q28","108":"q28","109":"q28","110":"q28","111":"q28","112":"q28","113":"q28","114":"q28","115":"q28","116":"q28","117":"q28","118":"q28","119":"q28","120":"q28","121":"q28","122":"q28"},"q28":{"48":"q28","49":"q28","50":"q28","51":"q28","52":"q28","53":"q28","54":"q28","55":"q28","56":"q28","57":"q28","65":"q28","66":"q28","67":"q28","68":"q28","69":"q28","70":"q28","71":"q28","72":"q28","73":"q28","74":"q28","75":"q28","76":"q28","77":"q28","78":"q28","79":"q28","80":"q28","81":"q28","82":"q28","83":"q28","84":"q28","85":"q28","86":"q28","87":"q28","88":"q28","89":"q28","90":"q28","97":"q28","98":"q28","99":"q28","100":"q28","101":"q28","102":"q28","103":"q28","104":"q28","105":"q28","106":"q28","107":"q28","108":"q28","109":"q28","110":"q28","111":"q28","112":"q28","113":"q28","114":"q28","115":"q28","116":"q28","117":"q28","118":"q28","119":"q28","120":"q29","121":"q29","122":"q29"},"q29":{"48":"q28","49":"q28","50":"q28","51":"q28","52":"q28","53":"q28","54":"q28","55":"q28","56":"q28","57":"q28","65":"q28","66":"q28","67":"q28","68":"q28","69":"q28","70":"q28","71":"q28","72":"q28","73":"q28","74":"q28","75":"q28","76":"q28","77":"q28","78":"q28","79":"q28","80":"q28","81":"q28","82":"q28","83":"q28","84":"q28","85":"q28","86":"q28","87":"q28","88":"q28","89":"q28","90":"q28","97":"q28","98":"q28","99":"q28","100":"q28","101":"q28","102":"q28","103":"q28","104":"q28","105":"q28","106":"q28","107":"q28","108":"q28","109":"q28","110":"q28","111":"q28","112":"q28","113":"q28","114":"q28","115":"q28","116":"q28","117":"q28","118":"q28","119":"q28","120":"q29","121":"q29","122":"q29"},"q30":{"34":"q31"},"q31":{"32":"q32","48":"q32","49":"q32","50":"q32","51":"q32","52":"q32","53":"q32","54":"q32","55":"q32","56":"q32","57":"q32","65":"q32","66":"q32","67":"q32","68":"q32","69":"q32","70":"q32","71":"q32","72":"q32","73":"q32","74":"q32","75":"q32","76":"q32","77":"q32","78":"q32","79":"q32","80":"q32","81":"q32","82":"q32","83":"q32","84":"q32","85":"q32","86":"q32","87":"q32","88":"q32","89":"q32","90":"q32","97":"q32","98":"q32","99":"q32","100":"q32","101":"q32","102":"q32","103":"q32","104":"q32","105":"q32","106":"q32","107":"q32","108":"q32","109":"q32","110":"q32","111":"q32","112":"q32","113":"q32","114":"q32","115":"q32","116":"q32","117":"q32","118":"q32","119":"q32","120":"q32","121":"q32","122":"q32"},"q32":{"32":"q32","34":"q33","48":"q32","49":"q32","50":"q32","51":"q32","52":"q32","53":"q32","54":"q32","55":"q32","56":"q32","57":"q32","65":"q32","66":"q32","67":"q32","68":"q32","69":"q32","70":"q32","71":"q32","72":"q32","73":"q32","74":"q32","75":"q32","76":"q32","77":"q32","78":"q32","79":"q32","80":"q32","81":"q32","82":"q32","83":"q32","84":"q32","85":"q32","86":"q32","87":"q32","88":"q32","89":"q32","90":"q32","97":"q32","98":"q32","99":"q32","100":"q32","101":"q32","102":"q32","103":"q32","104":"q32","105":"q32","106":"q32","107":"q32","108":"q32","109":"q32","110":"q32","111":"q32","112":"q32","113":"q32","114":"q32","115":"q32","116":"q32","117":"q32","118":"q32","119":"q32","120":"q32","121":"q32","122":"q32"},"q33":{}},"finalStates":{"q2":{},"q6":{},"q9":{},"q11":{},"q13":{},"q15":{},"q17":{},"q19":{},"q21":{"48":"q21","49":"q21","50":"q21","51":"q21","52":"q21","53":"q21","54":"q21","55":"q21","56":"q21","57":"q21"},"q26":{"48":"q26","49":"q26","50":"q26","51":"q26","52":"q26","53":"q26","54":"q26","55":"q26","56":"q26","57":"q26"},"q29":{"48":"q28","49":"q28","50":"q28","51":"q28","52":"q28","53":"q28","54":"q28","55":"q28","56":"q28","57":"q28","65":"q28","66":"q28","67":"q28","68":"q28","69":"q28","70":"q28","71":"q28","72":"q28","73":"q28","74":"q28","75":"q28","76":"q28","77":"q28","78":"q28","79":"q28","80":"q28","81":"q28","82":"q28","83":"q28","84":"q28","85":"q28","86":"q28","87":"q28","88":"q28","89":"q28","90":"q28","97":"q28","98":"q28","99":"q28","100":"q28","101":"q28","102":"q28","103":"q28","104":"q28","105":"q28","106":"q28","107":"q28","108":"q28","109":"q28","110":"q28","111":"q28","112":"q28","113":"q28","114":"q28","115":"q28","116":"q28","117":"q28","118":"q28","119":"q28","120":"q29","121":"q29","122":"q29"},"q33":{}}};
    // Final States Tokenizer
    let finalStatesT = {"delim":["q1"],"anythingElse":["q8"]};
    // console.log(finalStatesT);
    // Read the data
    readText(filepath)
    .then(data => {
      // Append and eof
      data+=' ';
      // The regex Data
      let regD = {"\"IF\"":{"rule":"return \"IF","finalStates":["q2"]},"\"FOR\"":{"rule":"return \"FOR","finalStates":["q6"]},"\"+\"":{"rule":"return \"SUMA","finalStates":["q9"]},"\"-\"":{"rule":"return \"RESTA","finalStates":["q11"]},"\"*\"":{"rule":"return \"MULTIPLICACION","finalStates":["q13"]},"\"/\"":{"rule":"return \"DIVISION","finalStates":["q15"]},"\"(\"":{"rule":"return \"PARENTESIS_IZQUIERDO","finalStates":["q17"]},"\")\"":{"rule":"return \"PARENTESIS_DERECHO","finalStates":["q19"]},"digits":{"rule":"return \"DIGITO","finalStates":["q21"]},"number":{"rule":"return \"NUMERO CON DECIMAL","finalStates":["q26"]},"id":{"rule":"return \"IDENTIFICADOR","finalStates":["q29"]},"string":{"rule":"return \"STRING","finalStates":["q33"]}};
      let finalStatesMap = new Map();
      let keys = Object.keys(regD);
      for (let k = 0; k < keys.length; k++){
        let key = keys[k];
        for (let j = 0; j < regD[key]["finalStates"].length; j++){
          finalStatesMap.set(regD[key]["finalStates"][j], key);
        }
      }
      tokenizerNFA = deSerializeAutomathon(tokenizerNFA);
      let S = null;
      let accepted = false;
      let indexTemp = 0;
      let arrayTokens = [];
      // Tokenization
      for (let k = 0; k < data.length; k++){
        [isWord, indexTemp, S] = tokenizerNFA.yalexSimulate(data, k);
        let fS = S.map((state)=> {return state.label});
        if (finalStatesT["anythingElse"].filter(state => fS.includes(state)).length>0){
          arrayTokens.push(data.slice(k, indexTemp));
        }
        k = indexTemp;
      };
      // checking the scan of the tokens
      yalexNFA = deSerializeAutomathon(yalexNFA);
      console.log("Tokens:");
      console.log(arrayTokens);
      for (let k = 0; k < arrayTokens.length; k++){
        let token = arrayTokens[k];
        let accepted = false;
        let S = null;
        [accepted, S] = yalexNFA.simulate2(token);
        // If it is accepted eval it
        try{
          if (accepted && finalStatesMap.get(S[0].label)!==undefined){
            console.log("Token accepted in rule "+finalStatesMap.get(S[0].label)+": "+token);
            console.log("Evaluating rule:")
            // Get which final State is obtained, we assume the first state in the final states obtained
            evalRule(regD[finalStatesMap.get(S[0].label)]["rule"]);
          }
          // else show a lexical error
          else{
            throw new Error("Lexical error, unexpected token: "+token+" regex");
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
