import { eClosureT, move, checkState } from "./DFA";
import { State } from "./State";

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
export class NFA {
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
  // Inicializar la simulacion
  simulate = (input) => {
    // Inicializar el estado 0
    let S = eClosureT([this.initialState], this);
    let indexInput = 0;
    let c = input[indexInput];
    while (indexInput<input.length) {
      S = eClosureT(move(S, c, this),this);
      indexInput++;
      c = input[indexInput];
    };
    for (let indexState = 0; indexState < S.length; indexState++) {
      if (typeof(this.finalState)!==Array && S[indexState].label === this.finalState.label){
        return true;
      } 
      else if (checkState(S[indexState].label, this.finalState)){
        return true;
      };
    };
    return false;
  };
  // YalexSimulation
  yalexSimulate = (input, indexInput) => {
    // console.log(input);
    // Inicializar el estado 0
    let S = eClosureT([this.initialState], this);
    // console.log(S)
    let c = input[indexInput];
    // console.log(c);
    while (indexInput<input.length) {
      S = eClosureT(move(S, c, this),this);
      // console.log(S)
      for (let indexState = 0; indexState < S.length; indexState++) {
        if (typeof(this.finalState)!==Array && S[indexState].label === this.finalState.label){
          // console.log("1salgo")
          return [true, indexInput, S];
        } 
        else if (checkState(S[indexState].label, this.finalState)){
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
      else if (checkState(S[indexState].label, this.finalState)){
        return [true, indexInput, S];
      };
    };
    return [false, indexInput, S];
  };
  addAnotherDfa(star){
    let steps_moved = this.states.length
    let q0 = this.initialState;
    let q01 = star.initialState;
    let qf = [...this.finalState];
    let states = [];
    let transitions = new Map();
    for (let k = 0; k < star.states.length; k++){
      let node_toChange = star.states[k];
      let new_label = "q"+(parseInt(star.states[k].label.substring(1))+steps_moved).toString();
      let node_toChangeTransitions = Array.from(node_toChange.transitions);
      console.log(node_toChangeTransitions);
      let new_transitions = new Map();
      let new_state = null;
      if (node_toChangeTransitions[0] !== undefined && node_toChangeTransitions.length<3){
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
        if (star.finalState.filter((state)=>state.label===node_toChange.label).length>0){
          qf.push(new_state);
        };
        if (node_toChange.label===star.initialState.label){
          q01.label = new_label;
        };
        states.push(new_state);
        transitions.set(new_label, new_transitions);
      }
      else if (node_toChangeTransitions[0] !== undefined && node_toChangeTransitions.length>=3){
        for (let j = 0; j < node_toChangeTransitions.length; j++){
          let new_t = node_toChangeTransitions[j][0];
          let new_tsx = null;
          let substring = new_t.substring(1);
          if (substring === "0"){
            new_tsx="q"+steps_moved.toString();
          }
          else {
            console.log((parseInt(node_toChangeTransitions[j][1].substring(1))+steps_moved).toString())
            new_tsx= "q"+(parseInt(node_toChangeTransitions[j][1].substring(1))+steps_moved).toString();
          };
          new_transitions.set(new_t,new_tsx);
        };
        new_state = new State(new_label, new_transitions);
        if (star.finalState.filter((state)=>state.label===node_toChange.label).length>0){
          qf.push(new_state);
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
          qf.push(new_state);
        };
      }
    }
    for (let k = 0; k < this.states.length; k++){
      states.push(this.states[k]);
      if (this.states[k].label === this.initialState.label) {
        this.states[k].transitions.set("ε",q01.label);
      };
      transitions.set(this.states[k].label, this.states[k].transitions);
    };
    return new NFA(q0,qf,states,[...this.alphabet, ...star.alphabet],transitions);
  }  
};
