
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
    let yalexNFA = {"alphabet":[73,70,32,9,10,70,79,82,43,45,42,47,40,41,48,49,50,51,52,53,54,55,56,57,43,45,48,49,50,51,52,53,54,55,56,57,44,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,48,49,50,51,52,53,54,55,56,57,34,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,48,49,50,51,52,53,54,55,56,57,32],"initialState":{"name":"init","transitions":{"ε":["q0","q3","q6","q10","q12","q14","q16","q18","q20","q22","q24","q29","q32"]}},"states":{"q0":{"73":"q1"},"q1":{"70":"q2"},"q2":{},"init":{"ε":["q0","q3","q6","q10","q12","q14","q16","q18","q20","q22","q24","q29","q32"]},"q3":{"9":"q4","10":"q4","32":"q4"},"q4":{"9":"q4","10":"q4","32":"q4"},"q6":{"70":"q7"},"q7":{"79":"q8"},"q8":{"82":"q9"},"q9":{},"q10":{"43":"q11"},"q11":{},"q12":{"45":"q13"},"q13":{},"q14":{"42":"q15"},"q15":{},"q16":{"47":"q17"},"q17":{},"q18":{"40":"q19"},"q19":{},"q20":{"41":"q21"},"q21":{},"q22":{"48":"q23","49":"q23","50":"q23","51":"q23","52":"q23","53":"q23","54":"q23","55":"q23","56":"q23","57":"q23"},"q23":{"48":"q23","49":"q23","50":"q23","51":"q23","52":"q23","53":"q23","54":"q23","55":"q23","56":"q23","57":"q23"},"q24":{"43":"q25","45":"q25"},"q25":{"48":"q26","49":"q26","50":"q26","51":"q26","52":"q26","53":"q26","54":"q26","55":"q26","56":"q26","57":"q26"},"q26":{"44":"q27","48":"q26","49":"q26","50":"q26","51":"q26","52":"q26","53":"q26","54":"q26","55":"q26","56":"q26","57":"q26"},"q27":{"48":"q28","49":"q28","50":"q28","51":"q28","52":"q28","53":"q28","54":"q28","55":"q28","56":"q28","57":"q28"},"q28":{"48":"q28","49":"q28","50":"q28","51":"q28","52":"q28","53":"q28","54":"q28","55":"q28","56":"q28","57":"q28"},"q29":{"65":"q30","66":"q30","67":"q30","68":"q30","69":"q30","70":"q30","71":"q30","72":"q30","73":"q30","74":"q30","75":"q30","76":"q30","77":"q30","78":"q30","79":"q30","80":"q30","81":"q30","82":"q30","83":"q30","84":"q30","85":"q30","86":"q30","87":"q30","88":"q30","89":"q30","90":"q30","97":"q30","98":"q30","99":"q30","100":"q30","101":"q30","102":"q30","103":"q30","104":"q30","105":"q30","106":"q30","107":"q30","108":"q30","109":"q30","110":"q30","111":"q30","112":"q30","113":"q30","114":"q30","115":"q30","116":"q30","117":"q30","118":"q30","119":"q30","120":"q30","121":"q30","122":"q30"},"q30":{"48":"q30","49":"q30","50":"q30","51":"q30","52":"q30","53":"q30","54":"q30","55":"q30","56":"q30","57":"q30","65":"q30","66":"q30","67":"q30","68":"q30","69":"q30","70":"q30","71":"q30","72":"q30","73":"q30","74":"q30","75":"q30","76":"q30","77":"q30","78":"q30","79":"q30","80":"q30","81":"q30","82":"q30","83":"q30","84":"q30","85":"q30","86":"q30","87":"q30","88":"q30","89":"q30","90":"q30","97":"q30","98":"q30","99":"q30","100":"q30","101":"q30","102":"q30","103":"q30","104":"q30","105":"q30","106":"q30","107":"q30","108":"q30","109":"q30","110":"q30","111":"q30","112":"q30","113":"q30","114":"q30","115":"q30","116":"q30","117":"q30","118":"q30","119":"q30","120":"q31","121":"q31","122":"q31"},"q31":{"48":"q30","49":"q30","50":"q30","51":"q30","52":"q30","53":"q30","54":"q30","55":"q30","56":"q30","57":"q30","65":"q30","66":"q30","67":"q30","68":"q30","69":"q30","70":"q30","71":"q30","72":"q30","73":"q30","74":"q30","75":"q30","76":"q30","77":"q30","78":"q30","79":"q30","80":"q30","81":"q30","82":"q30","83":"q30","84":"q30","85":"q30","86":"q30","87":"q30","88":"q30","89":"q30","90":"q30","97":"q30","98":"q30","99":"q30","100":"q30","101":"q30","102":"q30","103":"q30","104":"q30","105":"q30","106":"q30","107":"q30","108":"q30","109":"q30","110":"q30","111":"q30","112":"q30","113":"q30","114":"q30","115":"q30","116":"q30","117":"q30","118":"q30","119":"q30","120":"q31","121":"q31","122":"q31"},"q32":{"34":"q33"},"q33":{"32":"q34","48":"q34","49":"q34","50":"q34","51":"q34","52":"q34","53":"q34","54":"q34","55":"q34","56":"q34","57":"q34","65":"q34","66":"q34","67":"q34","68":"q34","69":"q34","70":"q34","71":"q34","72":"q34","73":"q34","74":"q34","75":"q34","76":"q34","77":"q34","78":"q34","79":"q34","80":"q34","81":"q34","82":"q34","83":"q34","84":"q34","85":"q34","86":"q34","87":"q34","88":"q34","89":"q34","90":"q34","97":"q34","98":"q34","99":"q34","100":"q34","101":"q34","102":"q34","103":"q34","104":"q34","105":"q34","106":"q34","107":"q34","108":"q34","109":"q34","110":"q34","111":"q34","112":"q34","113":"q34","114":"q34","115":"q34","116":"q34","117":"q34","118":"q34","119":"q34","120":"q34","121":"q34","122":"q34"},"q34":{"32":"q34","34":"q35","48":"q34","49":"q34","50":"q34","51":"q34","52":"q34","53":"q34","54":"q34","55":"q34","56":"q34","57":"q34","65":"q34","66":"q34","67":"q34","68":"q34","69":"q34","70":"q34","71":"q34","72":"q34","73":"q34","74":"q34","75":"q34","76":"q34","77":"q34","78":"q34","79":"q34","80":"q34","81":"q34","82":"q34","83":"q34","84":"q34","85":"q34","86":"q34","87":"q34","88":"q34","89":"q34","90":"q34","97":"q34","98":"q34","99":"q34","100":"q34","101":"q34","102":"q34","103":"q34","104":"q34","105":"q34","106":"q34","107":"q34","108":"q34","109":"q34","110":"q34","111":"q34","112":"q34","113":"q34","114":"q34","115":"q34","116":"q34","117":"q34","118":"q34","119":"q34","120":"q34","121":"q34","122":"q34"},"q35":{}},"finalStates":{"q2":{},"q4":{"9":"q4","10":"q4","32":"q4"},"q9":{},"q11":{},"q13":{},"q15":{},"q17":{},"q19":{},"q21":{},"q23":{"48":"q23","49":"q23","50":"q23","51":"q23","52":"q23","53":"q23","54":"q23","55":"q23","56":"q23","57":"q23"},"q28":{"48":"q28","49":"q28","50":"q28","51":"q28","52":"q28","53":"q28","54":"q28","55":"q28","56":"q28","57":"q28"},"q31":{"48":"q30","49":"q30","50":"q30","51":"q30","52":"q30","53":"q30","54":"q30","55":"q30","56":"q30","57":"q30","65":"q30","66":"q30","67":"q30","68":"q30","69":"q30","70":"q30","71":"q30","72":"q30","73":"q30","74":"q30","75":"q30","76":"q30","77":"q30","78":"q30","79":"q30","80":"q30","81":"q30","82":"q30","83":"q30","84":"q30","85":"q30","86":"q30","87":"q30","88":"q30","89":"q30","90":"q30","97":"q30","98":"q30","99":"q30","100":"q30","101":"q30","102":"q30","103":"q30","104":"q30","105":"q30","106":"q30","107":"q30","108":"q30","109":"q30","110":"q30","111":"q30","112":"q30","113":"q30","114":"q30","115":"q30","116":"q30","117":"q30","118":"q30","119":"q30","120":"q31","121":"q31","122":"q31"},"q35":{}}};
    // Final States Tokenizer
    let finalStatesT = {"delim":["q1"],"anythingElse":["q8"]};
    // console.log(finalStatesT);
    // Read the data
    readText(filepath)
    .then(data => {
      // Append and eof
      data+=' ';
      // The regex Data
      let regD = {"\"IF\"":{"rule":"console.log(\"IF\")","finalStates":["q2"]},"ws":{"rule":"","finalStates":["q4"]},"\"FOR\"":{"rule":"console.log(\"FOR\")","finalStates":["q9"]},"\"+\"":{"rule":"console.log(\"SUMA\")","finalStates":["q11"]},"\"-\"":{"rule":"console.log(\"RESTA\")","finalStates":["q13"]},"\"*\"":{"rule":"console.log(\"MULTIPLICACION\")","finalStates":["q15"]},"\"/\"":{"rule":"console.log(\"DIVISION\")","finalStates":["q17"]},"\"(\"":{"rule":"console.log(\"PARENTESIS_IZQUIERDO\")","finalStates":["q19"]},"\")\"":{"rule":"console.log(\"PARENTESIS_DERECHO\")","finalStates":["q21"]},"digits":{"rule":"console.log(\"DIGITO\")","finalStates":["q23"]},"number":{"rule":"console.log(\"NUMERO CON DECIMAL\")","finalStates":["q28"]},"id":{"rule":"console.log(\"IDENTIFICADOR\")","finalStates":["q31"]},"string":{"rule":"console.log(\"STRING\")","finalStates":["q35"]}};
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
