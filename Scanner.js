let x = Math.random(); 
 let ID =x*2;
 let NUMBER =x*3;
 let SEMICOLON =x*4;
 let ASSIGNOP =x*5;
 let LT =x*6;
 let EQ =x*7;
 let PLUS =x*8;
 let MINUS =x*9;
 let TIMES =x*10;
 let DIV =x*11;
 let LPAREN =x*12;
 let RPAREN =x*13;
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
    let yalexNFA = {"alphabet":[32,9,10,48,49,50,51,52,53,54,55,56,57,46,69,43,45,59,58,61,60,61,43,45,42,47,40,41,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,91,92,93,94,95,96,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254],"initialState":{"name":"init","transitions":{"ε":["q0","q2","q10","q12","q15","q17","q19","q21","q23","q25","q27","q29","q31"]}},"states":{"q0":{"9":"q1","10":"q1","32":"q1"},"q1":{"9":"q1","10":"q1","32":"q1"},"init":{"ε":["q0","q2","q10","q12","q15","q17","q19","q21","q23","q25","q27","q29","q31"]},"q2":{"48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3"},"q3":{"46":"q4","48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3","69":"q5"},"q4":{"48":"q8","49":"q8","50":"q8","51":"q8","52":"q8","53":"q8","54":"q8","55":"q8","56":"q8","57":"q8"},"q5":{"43":"q7","45":"q7","48":"q6","49":"q6","50":"q6","51":"q6","52":"q6","53":"q6","54":"q6","55":"q6","56":"q6","57":"q6"},"q6":{"48":"q6","49":"q6","50":"q6","51":"q6","52":"q6","53":"q6","54":"q6","55":"q6","56":"q6","57":"q6"},"q7":{"48":"q6","49":"q6","50":"q6","51":"q6","52":"q6","53":"q6","54":"q6","55":"q6","56":"q6","57":"q6"},"q8":{"48":"q8","49":"q8","50":"q8","51":"q8","52":"q8","53":"q8","54":"q8","55":"q8","56":"q8","57":"q8","69":"q5"},"q10":{"59":"q11"},"q11":{},"q12":{"58":"q13"},"q13":{"61":"q14"},"q14":{},"q15":{"60":"q16"},"q16":{},"q17":{"61":"q18"},"q18":{},"q19":{"43":"q20"},"q20":{},"q21":{"45":"q22"},"q22":{},"q23":{"42":"q24"},"q24":{},"q25":{"47":"q26"},"q26":{},"q27":{"40":"q28"},"q28":{},"q29":{"41":"q30"},"q30":{},"q31":{"65":"q32","66":"q32","67":"q32","68":"q32","69":"q32","70":"q32","71":"q32","72":"q32","73":"q32","74":"q32","75":"q32","76":"q32","77":"q32","78":"q32","79":"q32","80":"q32","81":"q32","82":"q32","83":"q32","84":"q32","85":"q32","86":"q32","87":"q32","88":"q32","89":"q32","90":"q32","97":"q32","98":"q32","99":"q32","100":"q32","101":"q32","102":"q32","103":"q32","104":"q32","105":"q32","106":"q32","107":"q32","108":"q32","109":"q32","110":"q32","111":"q32","112":"q32","113":"q32","114":"q32","115":"q32","116":"q32","117":"q32","118":"q32","119":"q32","120":"q32","121":"q32","122":"q32"},"q32":{"0":"q32","1":"q32","2":"q32","3":"q32","4":"q32","5":"q32","6":"q32","7":"q32","8":"q32","9":"q32","10":"q32","11":"q32","12":"q32","13":"q32","14":"q32","15":"q32","16":"q32","17":"q32","18":"q32","19":"q32","20":"q32","21":"q32","22":"q32","23":"q32","24":"q32","25":"q32","26":"q32","27":"q32","28":"q32","29":"q32","30":"q32","31":"q32","32":"q32","33":"q32","34":"q32","35":"q32","36":"q32","37":"q32","38":"q32","39":"q32","40":"q32","41":"q32","42":"q32","43":"q32","44":"q32","45":"q32","46":"q32","47":"q32","48":"q32","49":"q32","50":"q32","51":"q32","52":"q32","53":"q32","54":"q32","55":"q32","56":"q32","57":"q32","58":"q32","59":"q32","60":"q32","61":"q32","62":"q32","63":"q32","64":"q32","65":"q32","66":"q32","67":"q32","68":"q32","69":"q32","70":"q32","71":"q32","72":"q32","73":"q32","74":"q32","75":"q32","76":"q32","77":"q32","78":"q32","79":"q32","80":"q32","81":"q32","82":"q32","83":"q32","84":"q32","85":"q32","86":"q32","87":"q32","88":"q32","89":"q32","90":"q32","91":"q32","92":"q32","93":"q32","94":"q32","95":"q32","96":"q32","97":"q32","98":"q32","99":"q32","100":"q32","101":"q32","102":"q32","103":"q32","104":"q32","105":"q32","106":"q32","107":"q32","108":"q32","109":"q32","110":"q32","111":"q32","112":"q32","113":"q32","114":"q32","115":"q32","116":"q32","117":"q32","118":"q32","119":"q32","120":"q32","121":"q32","122":"q32","123":"q32","124":"q32","125":"q32","126":"q32","127":"q32","128":"q32","129":"q32","130":"q32","131":"q32","132":"q32","133":"q32","134":"q32","135":"q32","136":"q32","137":"q32","138":"q32","139":"q32","140":"q32","141":"q32","142":"q32","143":"q32","144":"q32","145":"q32","146":"q32","147":"q32","148":"q32","149":"q32","150":"q32","151":"q32","152":"q32","153":"q32","154":"q32","155":"q32","156":"q32","157":"q32","158":"q32","159":"q32","160":"q32","161":"q32","162":"q32","163":"q32","164":"q32","165":"q32","166":"q32","167":"q32","168":"q32","169":"q32","170":"q32","171":"q32","172":"q32","173":"q32","174":"q32","175":"q32","176":"q32","177":"q32","178":"q32","179":"q32","180":"q32","181":"q32","182":"q32","183":"q32","184":"q32","185":"q32","186":"q32","187":"q32","188":"q32","189":"q32","190":"q32","191":"q32","192":"q32","193":"q32","194":"q32","195":"q32","196":"q32","197":"q32","198":"q32","199":"q32","200":"q32","201":"q32","202":"q32","203":"q32","204":"q32","205":"q32","206":"q32","207":"q32","208":"q32","209":"q32","210":"q32","211":"q32","212":"q32","213":"q32","214":"q32","215":"q32","216":"q32","217":"q32","218":"q32","219":"q32","220":"q32","221":"q32","222":"q32","223":"q32","224":"q32","225":"q32","226":"q32","227":"q32","228":"q32","229":"q32","230":"q32","231":"q32","232":"q32","233":"q32","234":"q32","235":"q32","236":"q32","237":"q32","238":"q32","239":"q32","240":"q32","241":"q32","242":"q32","243":"q32","244":"q32","245":"q32","246":"q32","247":"q32","248":"q32","249":"q32","250":"q32","251":"q32","252":"q32","253":"q32","254":"q32"}},"finalStates":{"q1":{"9":"q1","10":"q1","32":"q1"},"q3":{"46":"q4","48":"q3","49":"q3","50":"q3","51":"q3","52":"q3","53":"q3","54":"q3","55":"q3","56":"q3","57":"q3","69":"q5"},"q6":{"48":"q6","49":"q6","50":"q6","51":"q6","52":"q6","53":"q6","54":"q6","55":"q6","56":"q6","57":"q6"},"q8":{"48":"q8","49":"q8","50":"q8","51":"q8","52":"q8","53":"q8","54":"q8","55":"q8","56":"q8","57":"q8","69":"q5"},"q11":{},"q14":{},"q16":{},"q18":{},"q20":{},"q22":{},"q24":{},"q26":{},"q28":{},"q30":{},"q32":{"0":"q32","1":"q32","2":"q32","3":"q32","4":"q32","5":"q32","6":"q32","7":"q32","8":"q32","9":"q32","10":"q32","11":"q32","12":"q32","13":"q32","14":"q32","15":"q32","16":"q32","17":"q32","18":"q32","19":"q32","20":"q32","21":"q32","22":"q32","23":"q32","24":"q32","25":"q32","26":"q32","27":"q32","28":"q32","29":"q32","30":"q32","31":"q32","32":"q32","33":"q32","34":"q32","35":"q32","36":"q32","37":"q32","38":"q32","39":"q32","40":"q32","41":"q32","42":"q32","43":"q32","44":"q32","45":"q32","46":"q32","47":"q32","48":"q32","49":"q32","50":"q32","51":"q32","52":"q32","53":"q32","54":"q32","55":"q32","56":"q32","57":"q32","58":"q32","59":"q32","60":"q32","61":"q32","62":"q32","63":"q32","64":"q32","65":"q32","66":"q32","67":"q32","68":"q32","69":"q32","70":"q32","71":"q32","72":"q32","73":"q32","74":"q32","75":"q32","76":"q32","77":"q32","78":"q32","79":"q32","80":"q32","81":"q32","82":"q32","83":"q32","84":"q32","85":"q32","86":"q32","87":"q32","88":"q32","89":"q32","90":"q32","91":"q32","92":"q32","93":"q32","94":"q32","95":"q32","96":"q32","97":"q32","98":"q32","99":"q32","100":"q32","101":"q32","102":"q32","103":"q32","104":"q32","105":"q32","106":"q32","107":"q32","108":"q32","109":"q32","110":"q32","111":"q32","112":"q32","113":"q32","114":"q32","115":"q32","116":"q32","117":"q32","118":"q32","119":"q32","120":"q32","121":"q32","122":"q32","123":"q32","124":"q32","125":"q32","126":"q32","127":"q32","128":"q32","129":"q32","130":"q32","131":"q32","132":"q32","133":"q32","134":"q32","135":"q32","136":"q32","137":"q32","138":"q32","139":"q32","140":"q32","141":"q32","142":"q32","143":"q32","144":"q32","145":"q32","146":"q32","147":"q32","148":"q32","149":"q32","150":"q32","151":"q32","152":"q32","153":"q32","154":"q32","155":"q32","156":"q32","157":"q32","158":"q32","159":"q32","160":"q32","161":"q32","162":"q32","163":"q32","164":"q32","165":"q32","166":"q32","167":"q32","168":"q32","169":"q32","170":"q32","171":"q32","172":"q32","173":"q32","174":"q32","175":"q32","176":"q32","177":"q32","178":"q32","179":"q32","180":"q32","181":"q32","182":"q32","183":"q32","184":"q32","185":"q32","186":"q32","187":"q32","188":"q32","189":"q32","190":"q32","191":"q32","192":"q32","193":"q32","194":"q32","195":"q32","196":"q32","197":"q32","198":"q32","199":"q32","200":"q32","201":"q32","202":"q32","203":"q32","204":"q32","205":"q32","206":"q32","207":"q32","208":"q32","209":"q32","210":"q32","211":"q32","212":"q32","213":"q32","214":"q32","215":"q32","216":"q32","217":"q32","218":"q32","219":"q32","220":"q32","221":"q32","222":"q32","223":"q32","224":"q32","225":"q32","226":"q32","227":"q32","228":"q32","229":"q32","230":"q32","231":"q32","232":"q32","233":"q32","234":"q32","235":"q32","236":"q32","237":"q32","238":"q32","239":"q32","240":"q32","241":"q32","242":"q32","243":"q32","244":"q32","245":"q32","246":"q32","247":"q32","248":"q32","249":"q32","250":"q32","251":"q32","252":"q32","253":"q32","254":"q32"}}};
    // Read the data
    await readText(filepath)
    .then(data => {
      // The regex Data
      let regD = {"ws":{"rule":"","finalStates":["q1"]},"number":{"rule":"console.log(NUMBER )","finalStates":["q3","q6","q8"]},"TOKEN_0":{"rule":"console.log(SEMICOLON )","finalStates":["q11"]},"TOKEN_1":{"rule":"console.log(ASSIGNOP )","finalStates":["q14"]},"TOKEN_2":{"rule":"console.log(LT )","finalStates":["q16"]},"TOKEN_3":{"rule":"console.log(EQ )","finalStates":["q18"]},"TOKEN_4":{"rule":"console.log(PLUS )","finalStates":["q20"]},"TOKEN_5":{"rule":"console.log(MINUS )","finalStates":["q22"]},"TOKEN_6":{"rule":"console.log(TIMES )","finalStates":["q24"]},"TOKEN_7":{"rule":"console.log(DIV )","finalStates":["q26"]},"TOKEN_8":{"rule":"console.log(LPAREN )","finalStates":["q28"]},"TOKEN_9":{"rule":"console.log(RPAREN )","finalStates":["q30"]},"id":{"rule":"console.log(ID )","finalStates":["q32"]}};
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
