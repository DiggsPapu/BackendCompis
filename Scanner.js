
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
    let tokenizerNFA = {"alphabet":[" ","\n","\r","\t","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","[","]","0","1","2","3","4","5","6","7","8","9",":","\"","'","+","*","(",")",".","|","?","á","é","í","ó","ú","Á","É","Í","Ó","Ú","\\",";",",","!","-","/","^","=",">","<","%","{","}"," ","\n","\r","\t"],"initialState":{"name":"init","transitions":{"ε":["q0","q2"]}},"states":{"q0":{" ":"q1","\n":"q1","\r":"q1","\t":"q1"},"q1":{" ":"q1","\n":"q1","\r":"q1","\t":"q1"},"init":{"ε":["q0","q2"]},"q2":{"0":"q3","1":"q3","2":"q3","3":"q3","4":"q3","5":"q3","6":"q3","7":"q3","8":"q3","9":"q3","A":"q3","B":"q3","C":"q3","D":"q3","E":"q3","F":"q3","G":"q3","H":"q3","I":"q3","J":"q3","K":"q3","L":"q3","M":"q3","N":"q3","O":"q3","P":"q3","Q":"q3","R":"q3","S":"q3","T":"q3","U":"q3","V":"q3","W":"q3","X":"q3","Y":"q3","Z":"q3","a":"q3","b":"q3","c":"q3","d":"q3","e":"q3","f":"q3","g":"q3","h":"q3","i":"q3","j":"q3","k":"q3","l":"q3","m":"q3","n":"q3","o":"q3","p":"q3","q":"q3","r":"q3","s":"q3","t":"q3","u":"q3","v":"q3","w":"q3","x":"q3","y":"q3","z":"q3","[":"q3","]":"q3",":":"q3","\"":"q3","'":"q3","+":"q3","*":"q3","(":"q3",")":"q3",".":"q3","|":"q3","?":"q3","á":"q3","é":"q3","í":"q3","ó":"q3","ú":"q3","Á":"q3","É":"q3","Í":"q3","Ó":"q3","Ú":"q3","\\":"q4",";":"q3",",":"q3","!":"q3","-":"q3","/":"q3","^":"q3","=":"q3",">":"q3","<":"q3","%":"q3","{":"q3","}":"q3"},"q3":{"0":"q3","1":"q3","2":"q3","3":"q3","4":"q3","5":"q3","6":"q3","7":"q3","8":"q3","9":"q3","A":"q3","B":"q3","C":"q3","D":"q3","E":"q3","F":"q3","G":"q3","H":"q3","I":"q3","J":"q3","K":"q3","L":"q3","M":"q3","N":"q3","O":"q3","P":"q3","Q":"q3","R":"q3","S":"q3","T":"q3","U":"q3","V":"q3","W":"q3","X":"q3","Y":"q3","Z":"q3","a":"q3","b":"q3","c":"q3","d":"q3","e":"q3","f":"q3","g":"q3","h":"q3","i":"q3","j":"q3","k":"q3","l":"q3","m":"q3","n":"q3","o":"q3","p":"q3","q":"q3","r":"q3","s":"q3","t":"q3","u":"q3","v":"q3","w":"q3","x":"q3","y":"q3","z":"q3","[":"q3","]":"q3",":":"q3","\"":"q3","'":"q3","+":"q3","*":"q3","(":"q3",")":"q3",".":"q3","|":"q3","?":"q3","á":"q3","é":"q3","í":"q3","ó":"q3","ú":"q3","Á":"q3","É":"q3","Í":"q3","Ó":"q3","Ú":"q3","\\":"q4",";":"q3",",":"q3","!":"q3","-":"q3","/":"q3","^":"q3","=":"q3",">":"q3","<":"q3","%":"q3","{":"q3","}":"q3"," ":"q5","\n":"q5","\r":"q5","\t":"q5"},"q4":{"b":"q3","f":"q3","n":"q3","r":"q3","s":"q3","t":"q3"},"q5":{}},"finalStates":{"q1":{" ":"q1","\n":"q1","\r":"q1","\t":"q1"},"q5":{}}};
    // Deserialize the yalex Automathon
    let yalexNFA = {"alphabet":[32,9,10,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,91,92,93,94,95,96,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,48,49,50,51,52,53,54,55,56,57,46,69,43,45,59,58,61,60,61,43,45,42,47,40,41],"initialState":{"name":"init","transitions":{"ε":["q0","q2","q5","q12","q14","q17","q19","q21","q23","q25","q27","q29","q31"]}},"states":{"q0":{"9":"q1","10":"q1","32":"q1"},"q1":{"9":"q1","10":"q1","32":"q1"},"init":{"ε":["q0","q2","q5","q12","q14","q17","q19","q21","q23","q25","q27","q29","q31"]},"q2":{"65":"q3","66":"q3","67":"q3","68":"q3","69":"q3","70":"q3","71":"q3","72":"q3","73":"q3","74":"q3","75":"q3","76":"q3","77":"q3","78":"q3","79":"q3","80":"q3","81":"q3","82":"q3","83":"q3","84":"q3","85":"q3","86":"q3","87":"q3","88":"q3","89":"q3","90":"q3","97":"q3","98":"q3","99":"q3","100":"q3","101":"q3","102":"q3","103":"q3","104":"q3","105":"q3","106":"q3","107":"q3","108":"q3","109":"q3","110":"q3","111":"q3","112":"q3","113":"q3","114":"q3","115":"q3","116":"q3","117":"q3","118":"q3","119":"q3","120":"q3","121":"q3","122":"q3"},"q3":{"0":"q3","1":"q3","2":"q3","3":"q3","4":"q3","5":"q3","6":"q3","7":"q3","8":"q3","9":"q3","10":"q3","11":"q3","12":"q3","13":"q3","14":"q3","15":"q3","16":"q3","17":"q3","18":"q3","19":"q3","20":"q3","21":"q3","22":"q3","23":"q3","24":"q3","25":"q3","26":"q3","27":"q3","28":"q3","29":"q3","30":"q3","31":"q3","32":"q3","33":"q3","34":"q3","35":"q3","36":"q3","37":"q3","38":"q3","39":"q3","40":"q3","41":"q3","42":"q3","43":"q3","44":"q3","45":"q3","46":"q3","47":"q3","48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3","58":"q3","59":"q3","60":"q3","61":"q3","62":"q3","63":"q3","64":"q3","65":"q3","66":"q3","67":"q3","68":"q3","69":"q3","70":"q3","71":"q3","72":"q3","73":"q3","74":"q3","75":"q3","76":"q3","77":"q3","78":"q3","79":"q3","80":"q3","81":"q3","82":"q3","83":"q3","84":"q3","85":"q3","86":"q3","87":"q3","88":"q3","89":"q3","90":"q3","91":"q3","92":"q3","93":"q3","94":"q3","95":"q3","96":"q3","97":"q3","98":"q3","99":"q3","100":"q3","101":"q3","102":"q3","103":"q3","104":"q3","105":"q3","106":"q3","107":"q3","108":"q3","109":"q3","110":"q3","111":"q3","112":"q3","113":"q3","114":"q3","115":"q3","116":"q3","117":"q3","118":"q3","119":"q3","120":"q3","121":"q3","122":"q3","123":"q3","124":"q3","125":"q3","126":"q3","127":"q3","128":"q3","129":"q3","130":"q3","131":"q3","132":"q3","133":"q3","134":"q3","135":"q3","136":"q3","137":"q3","138":"q3","139":"q3","140":"q3","141":"q3","142":"q3","143":"q3","144":"q3","145":"q3","146":"q3","147":"q3","148":"q3","149":"q3","150":"q3","151":"q3","152":"q3","153":"q3","154":"q3","155":"q3","156":"q3","157":"q3","158":"q3","159":"q3","160":"q3","161":"q3","162":"q3","163":"q3","164":"q3","165":"q3","166":"q3","167":"q3","168":"q3","169":"q3","170":"q3","171":"q3","172":"q3","173":"q3","174":"q3","175":"q3","176":"q3","177":"q3","178":"q3","179":"q3","180":"q3","181":"q3","182":"q3","183":"q3","184":"q3","185":"q3","186":"q3","187":"q3","188":"q3","189":"q3","190":"q3","191":"q3","192":"q3","193":"q3","194":"q3","195":"q3","196":"q3","197":"q3","198":"q3","199":"q3","200":"q3","201":"q3","202":"q3","203":"q3","204":"q3","205":"q3","206":"q3","207":"q3","208":"q3","209":"q3","210":"q3","211":"q3","212":"q3","213":"q3","214":"q3","215":"q3","216":"q3","217":"q3","218":"q3","219":"q3","220":"q3","221":"q3","222":"q3","223":"q3","224":"q3","225":"q3","226":"q3","227":"q3","228":"q3","229":"q3","230":"q3","231":"q3","232":"q3","233":"q3","234":"q3","235":"q3","236":"q3","237":"q3","238":"q3","239":"q3","240":"q3","241":"q3","242":"q3","243":"q3","244":"q3","245":"q3","246":"q3","247":"q3","248":"q3","249":"q3","250":"q3","251":"q3","252":"q3","253":"q3","254":"q3"},"q5":{"48":"q6","49":"q6","50":"q6","51":"q6","52":"q6","53":"q6","54":"q6","55":"q6","56":"q6","57":"q6"},"q6":{"46":"q7","48":"q6","49":"q6","50":"q6","51":"q6","52":"q6","53":"q6","54":"q6","55":"q6","56":"q6","57":"q6","69":"q8"},"q7":{"48":"q11","49":"q11","50":"q11","51":"q11","52":"q11","53":"q11","54":"q11","55":"q11","56":"q11","57":"q11"},"q8":{"43":"q10","45":"q10","48":"q9","49":"q9","50":"q9","51":"q9","52":"q9","53":"q9","54":"q9","55":"q9","56":"q9","57":"q9"},"q9":{"48":"q9","49":"q9","50":"q9","51":"q9","52":"q9","53":"q9","54":"q9","55":"q9","56":"q9","57":"q9"},"q10":{"48":"q9","49":"q9","50":"q9","51":"q9","52":"q9","53":"q9","54":"q9","55":"q9","56":"q9","57":"q9"},"q11":{"48":"q11","49":"q11","50":"q11","51":"q11","52":"q11","53":"q11","54":"q11","55":"q11","56":"q11","57":"q11","69":"q8"},"q12":{"59":"q13"},"q13":{},"q14":{"58":"q15"},"q15":{"61":"q16"},"q16":{},"q17":{"60":"q18"},"q18":{},"q19":{"61":"q20"},"q20":{},"q21":{"43":"q22"},"q22":{},"q23":{"45":"q24"},"q24":{},"q25":{"42":"q26"},"q26":{},"q27":{"47":"q28"},"q28":{},"q29":{"40":"q30"},"q30":{},"q31":{"41":"q32"},"q32":{}},"finalStates":{"q1":{"9":"q1","10":"q1","32":"q1"},"q3":{"0":"q3","1":"q3","2":"q3","3":"q3","4":"q3","5":"q3","6":"q3","7":"q3","8":"q3","9":"q3","10":"q3","11":"q3","12":"q3","13":"q3","14":"q3","15":"q3","16":"q3","17":"q3","18":"q3","19":"q3","20":"q3","21":"q3","22":"q3","23":"q3","24":"q3","25":"q3","26":"q3","27":"q3","28":"q3","29":"q3","30":"q3","31":"q3","32":"q3","33":"q3","34":"q3","35":"q3","36":"q3","37":"q3","38":"q3","39":"q3","40":"q3","41":"q3","42":"q3","43":"q3","44":"q3","45":"q3","46":"q3","47":"q3","48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3","58":"q3","59":"q3","60":"q3","61":"q3","62":"q3","63":"q3","64":"q3","65":"q3","66":"q3","67":"q3","68":"q3","69":"q3","70":"q3","71":"q3","72":"q3","73":"q3","74":"q3","75":"q3","76":"q3","77":"q3","78":"q3","79":"q3","80":"q3","81":"q3","82":"q3","83":"q3","84":"q3","85":"q3","86":"q3","87":"q3","88":"q3","89":"q3","90":"q3","91":"q3","92":"q3","93":"q3","94":"q3","95":"q3","96":"q3","97":"q3","98":"q3","99":"q3","100":"q3","101":"q3","102":"q3","103":"q3","104":"q3","105":"q3","106":"q3","107":"q3","108":"q3","109":"q3","110":"q3","111":"q3","112":"q3","113":"q3","114":"q3","115":"q3","116":"q3","117":"q3","118":"q3","119":"q3","120":"q3","121":"q3","122":"q3","123":"q3","124":"q3","125":"q3","126":"q3","127":"q3","128":"q3","129":"q3","130":"q3","131":"q3","132":"q3","133":"q3","134":"q3","135":"q3","136":"q3","137":"q3","138":"q3","139":"q3","140":"q3","141":"q3","142":"q3","143":"q3","144":"q3","145":"q3","146":"q3","147":"q3","148":"q3","149":"q3","150":"q3","151":"q3","152":"q3","153":"q3","154":"q3","155":"q3","156":"q3","157":"q3","158":"q3","159":"q3","160":"q3","161":"q3","162":"q3","163":"q3","164":"q3","165":"q3","166":"q3","167":"q3","168":"q3","169":"q3","170":"q3","171":"q3","172":"q3","173":"q3","174":"q3","175":"q3","176":"q3","177":"q3","178":"q3","179":"q3","180":"q3","181":"q3","182":"q3","183":"q3","184":"q3","185":"q3","186":"q3","187":"q3","188":"q3","189":"q3","190":"q3","191":"q3","192":"q3","193":"q3","194":"q3","195":"q3","196":"q3","197":"q3","198":"q3","199":"q3","200":"q3","201":"q3","202":"q3","203":"q3","204":"q3","205":"q3","206":"q3","207":"q3","208":"q3","209":"q3","210":"q3","211":"q3","212":"q3","213":"q3","214":"q3","215":"q3","216":"q3","217":"q3","218":"q3","219":"q3","220":"q3","221":"q3","222":"q3","223":"q3","224":"q3","225":"q3","226":"q3","227":"q3","228":"q3","229":"q3","230":"q3","231":"q3","232":"q3","233":"q3","234":"q3","235":"q3","236":"q3","237":"q3","238":"q3","239":"q3","240":"q3","241":"q3","242":"q3","243":"q3","244":"q3","245":"q3","246":"q3","247":"q3","248":"q3","249":"q3","250":"q3","251":"q3","252":"q3","253":"q3","254":"q3"},"q6":{"46":"q7","48":"q6","49":"q6","50":"q6","51":"q6","52":"q6","53":"q6","54":"q6","55":"q6","56":"q6","57":"q6","69":"q8"},"q9":{"48":"q9","49":"q9","50":"q9","51":"q9","52":"q9","53":"q9","54":"q9","55":"q9","56":"q9","57":"q9"},"q11":{"48":"q11","49":"q11","50":"q11","51":"q11","52":"q11","53":"q11","54":"q11","55":"q11","56":"q11","57":"q11","69":"q8"},"q13":{},"q16":{},"q18":{},"q20":{},"q22":{},"q24":{},"q26":{},"q28":{},"q30":{},"q32":{}}};
    // Final States Tokenizer
    let finalStatesT = {"delim":["q1"],"anythingElse":["q5"]};
    // console.log(finalStatesT);
    // Read the data
    readText(filepath)
    .then(data => {
      // The regex Data
      let regD = {"ws":{"rule":"","finalStates":["q1"]},"id":{"rule":"return ID","finalStates":["q3"]},"number":{"rule":"return NUMBER","finalStates":["q6","q9","q11"]},"';'":{"rule":"return SEMICOLON","finalStates":["q13"]},"\":=\"":{"rule":"return ASSIGNOP","finalStates":["q16"]},"'<'":{"rule":"return LT","finalStates":["q18"]},"'='":{"rule":"return EQ","finalStates":["q20"]},"'+'":{"rule":"return PLUS","finalStates":["q22"]},"'-'":{"rule":"return MINUS","finalStates":["q24"]},"'*'":{"rule":"return TIMES","finalStates":["q26"]},"'/'":{"rule":"return DIV","finalStates":["q28"]},"'('":{"rule":"return LPAREN","finalStates":["q30"]},"')'":{"rule":"return RPAREN","finalStates":["q32"]}};
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
      for (let k = 0; k < arrayTokens.length; k++){
        let token = arrayTokens[k];
        let accepted = false;
        let S = null;
        [accepted, S] = yalexNFA.simulate2(token);
        // If it is accepted eval it
        try{
          if (accepted){
            console.log("Token accepted:"+token);
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
