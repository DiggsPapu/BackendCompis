var NFA = require("./NFA.js");
var State = require("./State.js");

const checkState = (newState, stack) => {
  for (let stackIndex = 0; stackIndex < stack.length; stackIndex++){
    if (stack[stackIndex].label===newState){
      return true;
    };
  };
  return false;
};
// E closure para un conjunto de estados T
function eClosureT(T, nfa){
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
          if (!(checkState(u,E_closure)) && nfa.states.find((s) => s.label === u) !== undefined) {
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

function move(T, symbol, nfa){
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
// check if it is in the dstates
function isInDStates(dStates, state){
  if (state.length>0){
    for (var i = 0; i < dStates.length; i++){
      let isDstates = [];
      // tiene el potencial de ser el mismo estado
      if (dStates[i].length === state.length){
        for (var k = 0; k < dStates[i].length; k++){
          // Este array sirve para verificar si al menos una de las comparaciones fue igual estado porque pueden estar en desorden 
          let atLeastOne = [];
          // Va comparando un estado de los dStates[i] con uno de los estados del state
          for (var l =0; l<state.length; l++){
            atLeastOne.push(state[l].label === dStates[i][k].label);
          };
          // Si al menos tiene un true entonces si estaba presente el estado
          if (atLeastOne.includes(true)){
            isDstates.push(true);
          }
        }
      }
      // Si la longitud es la misma entonces es el mismo estado
      if (isDstates.length === state.length ){
        // retornar el indice del estado
        return i;
      }
    }
  }
  else{
    // En caso de que este vacio, retornar 0
    return 0;
  }
  // en caso de que no lo encuentre, retornar -1, es un nuevo estado
  return -1;  
}
function isFinalState(state, nfa){
  for (let i = 0; i<state.length; i++) {
    if (state[i].label === nfa.finalState.label){
      return true;
    };
  };
  return false;
};
// Conversion from NFA to DFA
const NFAToDFA = (nfa) => {
  // El primer dstate es el eclosure del estado inicial
  let initialClosure = eClosureT([nfa.initialState],nfa)
  // Estados del dfa
  let dStates = [initialClosure];
  // Transiciones del dfa
  let dfaArray = [];
  // Conjunto con los estados ya evaluados
  let markedStates = [];
  // Conjunto con los estados finales
  let finalStates = [];
  // Stack de estados para ir evaluando
  let stackStates = [initialClosure];
  // Alphabet eliminacion de epsilon
  let alfabeto = nfa.alphabet.filter((state)=> state!=="ε");
  while (!(dStates.length === markedStates.length) && !dStates.every(element => markedStates.includes(element)) && stackStates.length>0){
    // Pongo que el estado marcado ya fue revisado y saco del stack, si y solo si no esta ya marcado
    if (!markedStates.includes(stackStates[stackStates.length-1])){
      // Lo saco del stack y lo meto en lo marcado, el estado a evaluar
      let compoundState = stackStates.pop();
      // obtener el indice del estado a evaluar
      let stateIndex = dStates.indexOf(compoundState);
      // crear las transiciones
      let transitions = new Map();
      markedStates.push(compoundState);
      for (let i=0; i<alfabeto.length; i++){
        let symbol = alfabeto[i];
        // encontrar los epsilon closure luego de haberse movido segun el simbolo
        let T = [...move(compoundState, symbol,nfa)]
        let U = eClosureT(T,nfa);
        let code = isInDStates(dStates, U);
        // Es un estado nuevo
        if (U.length > 0 && code<0) {
          dStates.push(U);
          stackStates.push(U);
          transitions.set(symbol, `q${dStates.length-1}`);
        }
        // Es un estado ya creado
        else if (code >0){
          transitions.set(symbol, `q${code}`);
        };
      };
      let newState = new State(`q${stateIndex}`,transitions);
      dfaArray.push(newState);
      // Determinar si es estado final
      if (isFinalState(compoundState,nfa)) {
        finalStates.push(newState);
      };
    };
  };
  // Generar las transiciones para el dfa
  let transitions = new Map();
  for (let i=0; i < dfaArray.length ; i++) {
    transitions.set(dfaArray[i].label, dfaArray[i].transitions);
  };
  return new NFA(dfaArray[0],finalStates,dfaArray,nfa.alphabet,transitions);
};
function inWhichGroup(label, piGroups){  
  if (label!==undefined){
    for (var groupIndex = 0; groupIndex < piGroups.length; groupIndex++){
      if (checkState(label,  piGroups[groupIndex])){
        return groupIndex;
      }
    }
  }
  return undefined;
};
const minimizeDFA = (dfa) => {
  const nonFinalStates = [...dfa.states.filter((state) => dfa.finalState.find((state1)=>state1.label===state.label)===undefined)];
  const finalStates = [...dfa.finalState];
  let piGroups = [nonFinalStates, finalStates];
  let alphabet = dfa.alphabet.filter((value)=>value!=="ε");
  let piNew = [];
  // Mientras que el grupo pi nuevo no sea igual que el grupo pi anterior
  while (piGroups.length !== piNew.length) {
    // Asignar la misma agrupacion al grupo pi nuevo
    piNew = [...piGroups];
    // Recorrer todos los grupos pi
    for (let i = 0; i<piGroups.length; i++) {
      // Extraer un grupo pi y recorrerlo
      let groupG = [...piGroups[i]];
      // En caso de que tengan un valor de uno se mantiene el grupo G igual en otro caso se reemplaza por los subgrupos
      if (groupG.length>1) {
        // Crear la nueva distribucion del grupo G con un nodo para el primer grupo
        let newGroups = [[groupG[0]]]
        let j = 0; 
        let over = false
        while(!over && j<groupG.length) {
          // Se ignora el primer nodo, el asignado al primer grupo
          if (j>0) {
            // Obtener el primer nodo a evaluar y extraer valores
            let gNode = groupG[j]
            let gLabel = gNode.label
            let gTransitions = gNode.transitions
            // comparar en cada grupo
            for (let k = 0; k < newGroups.length; k++) {
              let theyAreInTheSameGroup = true;
              for (let z = 0; z<alphabet.length; z++){
                let gTransition = gTransitions.get(alphabet[z]);
                let newGTransition = newGroups[k][0].transitions.get(alphabet[z]);
                let gTGroup = inWhichGroup(gTransition, piGroups);
                let newGTGroup = inWhichGroup(newGTransition, piGroups);
                let areInSameGroup = gTGroup === newGTGroup
                theyAreInTheSameGroup*=areInSameGroup;
              };
              if (theyAreInTheSameGroup && newGroups[k].filter((state)=>state.label === gLabel).length===0) {
                newGroups[k].push(gNode);
                break;
              }
              if (k===newGroups.length-1) {
                newGroups.push([gNode])
                break;
              };
            };
          };
          j++;
        };   
        // remove the groupG in piNew
        for (let u = 0; u < piNew.length; u++) {
          let sameGroup = true;
          if (groupG.length === piNew[u].length){
            for (let v = 0; v < piNew[u].length; v++) {
              sameGroup = sameGroup && (piNew[u][v].label === groupG[v].label);
            }
          } else {
            sameGroup = false;
          }
          if (sameGroup) {
            piNew.splice(u, 1); // use splice to remove the element
            u--; // decrease u since the array size has decreased
          }
        }
        piNew.push(...newGroups);
      };
    };
    if (piNew.length !== piGroups.length) {
      piGroups = [...piNew];
      piNew = [];
    };
  };
  let arrayOfStates = [];
  let transitions1 = new Map();
  let initialState = "";
  let finalState = [];
  // Trabajar con los piGroups final
  for (let stateIndex = 0; stateIndex < piGroups.length; stateIndex++){
    let stateTransitions = new Map();
    let representativeState = piGroups[stateIndex][0];
    if (representativeState!==undefined){
      // Se generan las transiciones
      for (let y = 0; y < alphabet.length;  y++) {
        let group = inWhichGroup(representativeState.transitions.get(alphabet[y]),piGroups);
        // Se ignora el estado de atrapamiento
        if (group !== undefined) {
          stateTransitions.set(alphabet[y], "q"+group);
        };
      };
      // Se crean los estados
      let newState = new State(`q${stateIndex}`,stateTransitions);
      arrayOfStates.push(newState);
      transitions1.set(`q${stateIndex}`,newState.transitions);
      if (piGroups[stateIndex].filter((state)=>state.label===dfa.initialState.label).length>0){
        initialState = newState;
      }
      // Obtener los estados finales
      for (let x = 0; x < dfa.finalState.length; x++) {
        if (piGroups[stateIndex].filter((state)=>state.label===dfa.finalState[x].label).length>0) {
          finalState.push(newState);
          break;
        };
      };
    };
  };
  let dfaMinimized = new NFA(initialState, finalState, arrayOfStates, alphabet, transitions1);
  return dfaMinimized;
};
module.exports = {
  eClosureT,
  move,
  checkState,
  minimizeDFA,
  NFAToDFA
};