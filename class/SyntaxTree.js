var NFA = require("./NFA");
var State = require("./State");
var Token = require("./Token");
var TreeNode = require("./TreeNode");

class SyntaxTree {
  constructor(treeRoot, nodes, regex, maxpos) {
    this.treeRoot = treeRoot;
    this.nodes = nodes;
    this.regex = regex;
    this.tokens = [("return ID", "ID")];
    this.maxpos = maxpos;
    this.alphabet = null;
    this.getAlphabetTokens();
  }
  printSet(set){
    let string = "";
    for (let element of set) {
      string+=" "+element.value+" position: "+element.position+"\n"
    }
    return string;
  }
  printArraySet(sets){
    let string = "";
    for (let i = 0; i<sets.length; i++){
      string+="set"+i+":\n"+this.printSet(sets[i]) + "\n";
    }
    return string;
  }
  // Obtener el alfabeto
  getAlphabet() {
    this.alphabet = [];
    // recorrer la postfix
    for (let i = 0; i < this.regex.regex.length; i++) {
      const l = this.regex.regex[i];
      // si es un simbolo, no es una letra del alfabeto
      if (!["|", ".", "?", "*", "+","ε",")","("].includes(l)) {
        // si no se ha agregado a la lista, se agrega la letra
        if (!this.alphabet.includes(l)) {
          this.alphabet.push(l);
        }
      }
    }
  };
  getAlphabetTokens() {
    this.alphabetTokens = [];
    this.alphabet = [];
    // recorrer la postfix
    for (let i = 0; i < this.regex.regexWithDots.length; i++) {
      const l = this.regex.regexWithDots[i];
      // si es un simbolo, no es una letra del alfabeto
      if ((l.precedence<-1)) {
        // si no se ha agregado a la lista, se agrega la letra
        if (!this.alphabet.includes(l.value) && (l.value !=="ε")) {
          this.alphabet.push(l.value);
        }
      }
    }
  };
  /**
   *
   * @param {*} set1
   * @param {*} set2
   * @returns un nuevo set con la union de dos conjuntos para poder calcular las funciones del arbol
   */
  union = (set1, set2) => {
    return new Set([...set1, ...set2]);
  };

  /**
   *
   * @param {*} set1
   * @param {*} set2
   * @returns new Set() con la interseccion de dos conjuntos para poder calcular las funciones del arbol
   */
  intersection = (set1, set2) => {
    return new Set([...set1].filter((x) => set2.has(x)));
  };

  /**
   *
   * @param {*} n
   *
   * NULLABLE
   *
   * sobre el nodo, de forma recursiva (cada nodo es un lenguaje regular),
   * me devuelve true si el lenguaje del nodo n puede ser vacio, si no es vacio me devuelve false
   */  
  nullableTokens(n) {
    // en el caso de llegar a una hoja...
    if (n.left === null && n.right === null) {
      // verificar que no sea un epsilon
      return n.value.value === "ε";
    } else {
      // ahora hay que ver cada caso y ejecutar recursivamente las operaciones respecto a las reglas
      if ((n.value.value === "*" && n.value.precedence === 2) || (n.value.value === "?" && n.value.precedence === 2)) {
        // definitivamente es anulable
        return true;
      } else if (n.value.value === "+" && n.value.precedence === 2) {
        // se le pasa a su nodo hijo
        return this.nullableTokens(n.left);
      } else if (n.value.value === "." && n.value.precedence === 1) {
        // se verifica la verdad en ambos casos
        return this.nullableTokens(n.left) && this.nullableTokens(n.right);
      } else if (n.value.value === "|" && n.value.precedence === 0) {
        // con que uno de los dos sea verdadero este nodo sera anulable
        return this.nullableTokens(n.left) || this.nullableTokens(n.right);
      }
    }
  }

  /**
   *
   * @param {*} n
   *
   * el nodo n genera un lenguaje, cada palabra tiene una pos en el arbol,
   * firstpos devuelve cada posicion para esa palabra en el arbol
   */
  firstposTokens(n) {
    // revisar si se llega a una hoja
    if (n.left === null && n.right === null) {
      if (n.value.value === "ε") {
        return new Set();
      } else {
        return new Set([n]);
      }
    } else {
      // si no es porque estamos en un operador
      if ((n.value.value === "*" && n.value.precedence ===2) || (n.value.value === "+" && n.value.precedence ===2) || (n.value.value === "?" && n.value.precedence ===2)) {
        return this.firstposTokens(n.left);
      } else if (n.value.value === "." && n.value.precedence ===1) {
        if (this.nullableTokens(n.left)) {
          // hacer A U B para el nodo
          return this.union(this.firstposTokens(n.left), this.firstposTokens(n.right)); //this.firstpos(n.left).union(this.firstpos(n.right));
        } else {
          return this.firstposTokens(n.left);
        }
      } else if (n.value.value === "|" && n.value.precedence ===0) {
        // hacer A U B para el nodo
        return this.union(this.firstposTokens(n.left), this.firstposTokens(n.right)); // igual q arriba
      }
    }
  }
  /**
   *
   * @param {*} n
   *
   * es basicamente lo mismo que firstpos pero calculando las ultimas posiciones, es decir,
   * acorde a la estructura del arbol planteada, deberia retornar las hojas que se encuentren
   * antes a la derecha, mientras que firstpos retorna las que esten a la izquierda
   */
  lastposTokens(n) {
    if (n.left === null && n.right === null) {
      if (n.value.value === "ε") {
        return new Set();
      } else {
        return new Set([n]);
      }
    } else {
      // si no es porque estamos en un operador
      if ((n.value.value === "*" && n.value.precedence ===2) || (n.value.value === "+" && n.value.precedence ===2) || (n.value.value === "?" && n.value.precedence ===2)) {
        return this.lastposTokens(n.left);
      } else if (n.value.value === "." && n.value.precedence === 1) {
        if (this.nullableTokens(n.right)) {
          // retornar la union de conjuntos de los nodos hijos
          return this.union(this.lastposTokens(n.left), this.lastposTokens(n.right)); // this.lastpos(n.left).union(this.lastpos(n.right));
        } else {
          return this.lastposTokens(n.right);
        }
      } else if (n.value.value === "|" && n.value.precedence ===0) {
        // retornar la union de conjuntos de los hijos

        return this.union(this.lastposTokens(n.left), this.lastposTokens(n.right));
      }
    }
  }

  /**
   *
   * @param {*} i
   *
   * calcula el conjunto followpos de un nodo
   */
  followpos(n) {
    // retornar el followpos de una hoja
    if (n.left === null && n.right === null) {
      return new Set();
    } else {
      // si se llega a un star-node
      if (n.value === "*" || n.value === "+") {
        let i = this.lastpos(n);
        // unir los subconjuntos para cada estado
        for (const state of i) {
          state.followpos = this.union(state.followpos, this.firstpos(n)); // ojo aqui
          // state.followpos.union(this.firstpos(n));
        }
      } else if (n.value === ".") {
        let i = n.left.lastpos;
        for (const state of i) {
          state.followpos = this.union(state.followpos, n.right.firstpos);
          //state.followpos.union(n.right);
        }
      } else {
        return new Set();
      }
    }
  }
  followposTokens(n) {
    // retornar el followpos de una hoja
    if (n.left === null && n.right === null) {
      return new Set();
    } else {
      // si se llega a un star-node
      if ((n.value.value === "*" && n.value.precedence === 2) || (n.value.value === "+" && n.value.precedence === 2)) {
        let i = n.lastpos;
        // unir los subconjuntos para cada estado
        for (const state of i) {
          state.followpos = this.union(state.followpos, n.firstpos); // ojo aqui
          // state.followpos.union(this.firstpos(n));
        }
      } else if (n.value.value === "." && n.value.precedence === 1) {
        let i = n.left.lastpos;
        for (const state of i) {
          state.followpos = this.union(state.followpos, n.right.firstpos);
          //state.followpos.union(n.right);
        }
      } else {
        return new Set();
      }
    }
  }
  isInDStatesTokens(set, dStates){
    if (set.size === 0 ) return -2;
    for (let k = 0; k < dStates.length; k++) {
      let set_1 = dStates[k];
      if (set.size === set_1.size){
        let positions = [];
        let positions2 = [];
        for (let node of  set_1) {
          positions.push(node.position);
        }
        for (let node of set){
          positions2.push(node.position);
        }
        let sortedArray1 = [...positions].sort(function(a, b) {
            return a - b;
        });
        let sortedArray2 = [...positions2].sort(function(a, b) {
          return a - b;
        });
        let isSame = true;
        for (let i = 0; i < sortedArray1.length; i++){
          if (sortedArray1[i]!== sortedArray2[i]){
            isSame = false
            break;
          };
        };
        if (isSame){
          return k;
        }
      };      
    };
    return -1;
  };
  generateDirectDFATokens() {
    this.getAlphabetTokens();
    // Aniadir un # al final
    let newFinishNode = new TreeNode(new Token("#", -3),null,null,this.maxpos);
    let newDotNode = new TreeNode(new Token(".", 1),this.treeRoot,newFinishNode,null);
    this.nodes.push(newFinishNode);
    this.nodes.push(newDotNode);
    this.treeRoot = newDotNode;
    // hacer el calculo de las funciones para cada nodo del arbol
    this.nodes.forEach((node) => {
      node.nullable = this.nullableTokens(node);
      node.firstpos = this.firstposTokens(node);
      node.lastpos = this.lastposTokens(node);
      node.followpos = this.followposTokens(node);
    });
    this.treeRoot.followpos = this.followposTokens(this.treeRoot);
    // Estados del dfa
    let dStates = [this.treeRoot.firstpos];
    // All this will be one state.
    let unmarkedStates = [this.treeRoot.firstpos];
    let q0 = new State("q0", new Map());
    let dfaArray = [q0];
    let finalStates = [];
    let isFinal0 = false
    this.treeRoot.firstpos.forEach((state)=> {
      if (state.value.value === "#" && state.value.precedence === -3){
        isFinal0 = true;
      };
    });
    if (isFinal0){
      finalStates.push(q0);
    }
    while (unmarkedStates.length>0){
      let S = unmarkedStates.pop();
      for (let i = 0; i<this.alphabet.length; i++){
        let U = new Set();
        let a_symbol = this.alphabet[i];
        S.forEach((state) => {  
          if (state.value.value === a_symbol) {
            if (state.followpos.size>1){
              state.followpos.forEach((new_s) => U.add(new_s));
            }
            else {U.add(...state.followpos);}
          };
        });
        let indexU = this.isInDStatesTokens(U, dStates);
        let indexS = dStates.indexOf(S);
        if (!(U.size===0)&&(indexU===-1)){
          dStates.push(U);
          unmarkedStates.push(U);
          let newIndex = dfaArray.length
          dfaArray.push(new State(`q${newIndex}`, new Map()));
          dfaArray[indexS].transitions.set(a_symbol, `q${newIndex}`);
          let isFinal = false
          U.forEach((state)=> {
            if (state.value.value === "#" && state.value.precedence === -3){
              isFinal = true;
            };
          });
          if (isFinal){
            finalStates.push(dfaArray[newIndex])
          }
        };
        if (indexU>-1){
          dfaArray[indexS].transitions.set(a_symbol, `q${indexU}`);
        };
      };
    };
    let transitions = new Map();
  for (let i=0; i < dfaArray.length ; i++) {
    transitions.set(dfaArray[i].label, dfaArray[i].transitions);
  };
    return new NFA(q0,finalStates,dfaArray,this.alphabet,transitions);
  }
}
module.exports = SyntaxTree