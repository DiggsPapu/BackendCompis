var NFA = require("./NFA.js");
var State = require("./State.js");

class Thompson {
  constructor(postfix) {
    // cosas para el algoritmo
    this.postfix = postfix;
    this.stateNumber = 0;
    // lista para guardar cada afn generado
    this.nfas = [];
    // alfabeto para construir automatas
    this.alphabet = this.getAlphabet(postfix);
    // nfa construido
    this.nfa = this.postfixToNFA();
  }

  // para asignar un label a cada estado
  getNumber() {
    this.stateNumber++;
    return this.stateNumber;
  }

  // metodo para ver obtener el alfabeto del AFN
  getAlphabet(postfix) {
    let alphabet = [];

    // recorrer la postfix
    for (let i = 0; i < postfix.length; i++) {
      const l = postfix[i];
      // si es un simbolo, no es una letra del alfabeto
      if (!["|", ".", "?", "*", "+"].includes(l)) {
        // si no se ha agregado a la lista, se agrega la letra
        if (!alphabet.includes(l)) {
          alphabet.push(l);
        }
      }
    }

    return alphabet;
  }

  // Basis

  // rule 1: epsilon transition (q0) -ε-> (qf)
  fromEpsilon() {
    const label1 = this.getNumber();
    const label2 = this.getNumber();
    // definir transicion epsilon por medio de un Map (es lo mismo que un diccionario de python)
    let transitions = new Map();
    transitions.set("ε", `q${label2}`);
    // pero, para poder armar una matriz de transiciones, necesitamos mapear esto en el afn
    let nfaTransitions = new Map();
    nfaTransitions.set(`q${label1}`, transitions);
    nfaTransitions.set(`q${label2}`, new Map());
    // luego crear los estados y unirlos con la transicion epsilon
    const q0 = new State(`q${label1}`, transitions);
    const qf = new State(`q${label2}`, new Map());
    return new NFA(q0, qf, [q0, qf], this.alphabet, nfaTransitions);
  }

  // rule 2: symbol transition (q0) -symbol-> (qf)
  fromSymbol(symbol) {
    const label1 = this.getNumber();
    const label2 = this.getNumber();
    // definir transicion con simbolo por medio de un Map (es lo mismo que un diccionario de python)
    let transitions = new Map();
    transitions.set(symbol, `q${label2}`);
    // pero, para poder armar una matriz de transiciones, necesitamos mapear esto en el afn
    let nfaTransitions = new Map();
    nfaTransitions.set(`q${label1}`, transitions);
    nfaTransitions.set(`q${label2}`, new Map());
    // luego crear los estados y unirlos con la transicion creada
    const q0 = new State(`q${label1}`, transitions);
    const qf = new State(`q${label2}`, new Map());
    return new NFA(q0, qf, [q0, qf], this.alphabet, nfaTransitions);
  }

  // Induction

  // rule 3: union a|b
  fromUnion(nfaA, nfaB) {
    // hacer estado inicial y final
    const label1 = this.getNumber();
    const label2 = this.getNumber();

    // definir transiciones epsilon desde el nuevo estado inicial hacia
    // afnA y afnB por medio de un Map (es lo mismo que un diccionario de python)
    let transitions = new Map();
    let t = [];
    t.push(nfaA.initialState.label);
    t.push(nfaB.initialState.label);
    transitions.set("ε", t);

    // y unir los estados finales de cada afn hacia el nuevo estado final:

    // para afnA:
    // si mi mapa no tiene esa key...
    if (!nfaA.finalState.transitions.has("ε")) {
      // solo agrego el elemento
      nfaA.finalState.transitions.set("ε", `q${label2}`);
      // si mi mapa ya tiene esa key...
    } else {
      // veo si la key devuelve un array
      if (nfaA.finalState.transitions.get("ε") instanceof Array) {
        // si lo hace, solo le agrego al array lo que quiero
        nfaA.finalState.transitions.get("ε").push(`q${label2}`);
        // si la key devuelve un string
      } else {
        // creo un array vacio, le meto el string que ya tenia
        let arr = [];
        arr.push(nfaA.finalState.transitions.get("ε"));
        // y defino el elemento a la llave existente como un array con lo
        // que tenia y le acabo de agregar
        arr.push(`q${label2}`);
        nfaA.finalState.transitions.set("ε", arr);
      }
    }

    // para afnB:
    // si mi mapa no tiene esa key...
    if (!nfaB.finalState.transitions.has("ε")) {
      // solo agrego el elemento
      nfaB.finalState.transitions.set("ε", `q${label2}`);
      // si mi mapa ya tiene esa key...
    } else {
      // veo si la key devuelve un array
      if (nfaB.finalState.transitions.get("ε") instanceof Array) {
        // si lo hace, solo le agrego al array lo que quiero
        nfaB.finalState.transitions.get("ε").push(`q${label2}`);
        // si la key devuelve un string
      } else {
        // creo un array vacio, le meto el string que ya tenia
        let arr = [];
        arr.push(nfaB.finalState.transitions.get("ε"));
        // y defino el elemento a la llave existente como un array con lo
        // que tenia y le acabo de agregar
        arr.push(`q${label2}`);
        nfaB.finalState.transitions.set("ε", arr);
      }
    }

    // luego crear los estados y unirlos con la transicion creada
    const q0 = new State(`q${label1}`, transitions);
    const qf = new State(`q${label2}`, new Map());

    let states = [];

    // agregar los estados del afnA
    for (let i = 0; i < nfaA.states.length; i++) {
      const state = nfaA.states[i];
      states.push(state);
    }

    // agregar los estados del afnB
    for (let i = 0; i < nfaB.states.length; i++) {
      const state = nfaB.states[i];
      states.push(state);
    }

    // agregar estado final e inicial
    states.push(q0);
    states.push(qf);

    // hacer las transiciones
    let nfaTransitions = new Map();

    // para cada estado
    for (let i = 0; i < states.length; i++) {
      const element = states[i];

      // definir en la tabla de transicion a cada elemento y sus transiciones
      nfaTransitions.set(element.label, element.transitions);
    }

    return new NFA(q0, qf, states, this.alphabet, nfaTransitions);
  }

  // rule 4: concatenation a.b
  fromConcatenation(nfaA, nfaB) {
    let states = [];

    // agregar los estados del afnA
    for (let i = 0; i < nfaA.states.length; i++) {
      const state = nfaA.states[i];
      states.push(state);
    }

    // agregar los estados del afnB
    for (let i = 0; i < nfaB.states.length; i++) {
      const state = nfaB.states[i];
      states.push(state);
    }

    let nfaTransitions = new Map();
    // para cada estado
    for (let i = 0; i < states.length; i++) {
      const element = states[i];

      // para cada estado de aceptacion del automata A, unirlo al estado de aceptacion del automata B
      const finalState = nfaA.finalState;
      // si es el estado de aceptacion, unirlo al estado inicial del automata siguiente
      if (finalState.label === element.label) {
        finalState.transitions.set("ε", nfaB.initialState.label);
      }

      // definir en la tabla de transiciones a cada elemento y sus transiciones
      nfaTransitions.set(element.label, element.transitions);
    }

    return new NFA(
      nfaA.initialState,
      nfaB.finalState,
      states,
      this.alphabet,
      nfaTransitions
    );
  }

  // rule 5: kleene a*
  fromClosureKleene(nfa) {
    // creo los estados inicial y final
    const label1 = `q${this.getNumber()}`;
    const label2 = `q${this.getNumber()}`;

    // definir transiciones epsilon desde el nuevo estado inicial hacia
    // afnA y afnB por medio de un Map (es lo mismo que un diccionario de python)
    let transitions = new Map();
    let t = [];
    t.push(nfa.initialState.label);
    t.push(label2);
    transitions.set("ε", t);

    // hacer transicion desde el final del afn ingresado a su estado inicial
    if (nfa.finalState.transitions.get("ε") instanceof Array) {
      // si lo hace, solo le agrego al array lo que quiero
      nfa.finalState.transitions.get("ε").push(label2);
      nfa.finalState.transitions.get("ε").push(nfa.initialState.label);
      // si la key devuelve un string
    } else {
      // creo un array vacio, le agrego el string que ya tenia
      let arr = [];
      if (nfa.finalState.transitions.has("ε")) {
        arr.push(nfa.finalState.transitions.get("ε"));
      }
      // y defino el elemento a la llave existente como un array con lo
      // que tenia y le acabo de agregar
      arr.push(label2);
      arr.push(nfa.initialState.label);
      nfa.finalState.transitions.set("ε", arr);
    }

    // crear los nuevos estado del nuevo afn
    const q0 = new State(label1, transitions);
    const qf = new State(label2, new Map());

    let states = [];

    for (let i = 0; i < nfa.states.length; i++) {
      const s = nfa.states[i];
      states.push(s);
    }

    states.push(q0);
    states.push(qf);

    // crear la nueva tabla de transiciones del automata
    let nfaTransitions = new Map();

    for (let i = 0; i < states.length; i++) {
      const s = states[i];
      // definir en la tabla de transicion a cada elemento y sus transiciones
      nfaTransitions.set(s.label, s.transitions);
    }

    return new NFA(q0, qf, states, this.alphabet, nfaTransitions);
  }

  // a? = a|epsilon
  fromZeroUnion(nfa) {
    let epsilon = this.fromEpsilon();
    return this.fromUnion(nfa, epsilon);
  }
  moveSteps(star, steps_moved){
    let states = [];
    let transitions = new Map();
    for (let k = 0; k < star.states.length; k++){
      let node_toChange = star.states[k];
      let new_label = "q"+(parseInt(star.states[k].label.substring(1))+steps_moved).toString();
      let node_toChangeTransitions = Array.from(node_toChange.transitions);
      let new_transitions = new Map();
      let new_state = null;
      if (node_toChangeTransitions[0] !== undefined){
        let new_t = node_toChangeTransitions[0][0];
        if (typeof(node_toChangeTransitions[0][1])==="object") {
          let new_ts = [...node_toChangeTransitions[0][1]]
          let new_tsx = []
          for (let j = 0; j < new_ts.length; j++){
            let substring = new_ts[j].substring(1)
            if (substring === "0"){
              new_tsx.push("q"+steps_moved);
            }
            else {
              new_tsx.push("q"+(parseInt(substring)+steps_moved));
            };
          };
          new_transitions.set(new_t,new_tsx);
        }
        else {
          let new_ts = node_toChangeTransitions[0][1];
          new_ts = "q"+(parseInt(new_ts.substring(1))+steps_moved).toString();
          new_transitions.set(new_t,new_ts);
        };
        new_state = new State(new_label, new_transitions);
        states.push(new_state);
        transitions.set(new_label, new_transitions);
      }
      else{
        let new_tran = new Map();
        new_state = new State(new_label,new_tran);
        states.push(new_state);
        transitions.set(new_label, new_tran);
      };
    };
  }
  // a+ = a.a*
  fromPositiveClosure(nfa) {
    let star = this.fromClosureKleene(nfa);
    let steps_moved = nfa.states.length
    let q0 = nfa.initialState;
    let q01 = star.initialState;
    let qf = null;
    let states = [];
    let transitions = new Map();
    for (let k = 0; k < star.states.length; k++){
      this.getNumber();
      let node_toChange = star.states[k];
      let new_label = "q"+(parseInt(star.states[k].label.substring(1))+steps_moved).toString();
      let node_toChangeTransitions = Array.from(node_toChange.transitions);
      let new_transitions = new Map();
      let new_state = null;
      if (node_toChangeTransitions[0] !== undefined){
        let new_t = node_toChangeTransitions[0][0];
        if (typeof(node_toChangeTransitions[0][1])==="object") {
          let new_ts = [...node_toChangeTransitions[0][1]]
          let new_tsx = []
          for (let j = 0; j < new_ts.length; j++){
            let substring = new_ts[j].substring(1)
            if (substring === "0"){
              new_tsx.push("q"+steps_moved);
            }
            else {
              new_tsx.push("q"+(parseInt(substring)+steps_moved));
            };
          };
          new_transitions.set(new_t,new_tsx);
        }
        else {
          let new_ts = node_toChangeTransitions[0][1];
          new_ts = "q"+(parseInt(new_ts.substring(1))+steps_moved).toString();
          new_transitions.set(new_t,new_ts);
        };
        new_state = new State(new_label, new_transitions);
        if (node_toChange.label===star.finalState.label){
          qf = new_state;
        };
        if (node_toChange.label===star.initialState.label){
          q01.label = new_label;
        };
        states.push(new_state);
        transitions.set(new_label, new_transitions);
      }
      else{
        let new_tran = new Map();
        new_state = new State(new_label,new_tran);
        states.push(new_state);
        transitions.set(new_label, new_tran);
        if (node_toChange.label===star.finalState.label){
          qf = new_state;
        };
      }
    }
    for (let k = 0; k < nfa.states.length; k++){
      states.push(nfa.states[k]);
      if (nfa.states[k].label === nfa.finalState.label) {
        nfa.states[k].transitions.set("ε",q01.label);
      };
      transitions.set(nfa.states[k].label, nfa.states[k].transitions);
    };
    return new NFA(q0,qf,states,nfa.alphabet,transitions);
  }

  // procesar la regex a un afn
  postfixToNFA() {
    let stack = [];
    // la regex vacia deberia retornar el afn para un epsilon
    if (this.postfix === "") {
      return this.fromEpsilon();
    }
    // recorrer la postfix caracter por caracter
    for (let i = 0; i < this.postfix.length; i++) {
      // obtener cada caracter en la postfix
      const c = this.postfix[i];

      // es union
      if (c === "|") {
        const right = stack.pop();
        const left = stack.pop();
        let nfa = this.fromUnion(left, right);
        stack.push(nfa);
        this.nfas.push(nfa);
      }

      // es concatenacion
      else if (c === ".") {
        const right = stack.pop();
        const left = stack.pop();
        let nfa = this.fromConcatenation(left, right);
        stack.push(nfa);
        this.nfas.push(nfa);
      }

      // es closure/kleene
      else if (c === "*") {
        let nfa = this.fromClosureKleene(stack.pop());
        stack.push(nfa);
        this.nfas.push(nfa);
      }

      // es closure +
      else if (c === "+") {
        let nfa = this.fromPositiveClosure(stack.pop());
        stack.push(nfa);
        this.nfas.push(nfa);
      }

      // es ?, entonces a? = a|epsilon
      else if (c === "?") {
        let nfa = this.fromZeroUnion(stack.pop());
        stack.push(nfa);
        this.nfas.push(nfa);
      }

      // es un simbolo de L
      else {
        let nfa = this.fromSymbol(c);
        stack.push(nfa);
        this.nfas.push(nfa);
      }
    }

    // retornar el afn armado
    const NFA = stack.pop();
    return NFA;
  }
}
module.exports = Thompson