const drawGraphDFA = (nfa) => {
  // console.log(nfa)
    let dotStr = "digraph fsm {\n";
    dotStr += "rankdir=BR;\n";
    dotStr += 'size="8,5";\n';
    dotStr += "node [shape = point]; INITIAL_STATE\n";
  
    nfa.finalState.forEach((s) => {
      dotStr += "node [shape = doublecircle]; " + s.label + ";\n";
    });
  
    dotStr += "node [shape = circle];\n";
    dotStr += "INITIAL_STATE -> " + nfa.initialState.label + ";\n";
  
    nfa.transitions.forEach((nextStates, state) => {
      nextStates.forEach((destinies, symbol) => {
        switch (symbol){
          case "+":
            if (destinies instanceof Array) {
              destinies.forEach((s) => {
                dotStr += "" + state + " -> " + s + " [label=\"&#43;\"];\n";
              });
            } else {
              dotStr +=
                "" + state + " -> " + destinies + " [label=\"&#43;\"];\n";
            }
            break;
          case "*":
            if (destinies instanceof Array) {
              destinies.forEach((s) => {
                dotStr += "" + state + " -> " + s + " [label=\"&#42;\"];\n";
              });
            } else {
              dotStr +=
                "" + state + " -> " + destinies + " [label=\"&#42;\"];\n";
            }
            break;
          case ".":
            if (destinies instanceof Array) {
              destinies.forEach((s) => {
                dotStr += "" + state + " -> " + s + " [label=\"&#46;\"];\n";
              });
            } else {
              dotStr +=
                "" + state + " -> " + destinies + " [label=\"&#46;\"];\n";
            }
            break;  
          case ";":
            if (destinies instanceof Array) {
              destinies.forEach((s) => {
                dotStr += "" + state + " -> " + s + " [label=\"&#59;\"];\n";
              });
            } else {
              dotStr +=
                "" + state + " -> " + destinies + " [label=\"&#59;\"];\n";
            }
            break;  
          case "|":
            if (destinies instanceof Array) {
              destinies.forEach((s) => {
                dotStr += "" + state + " -> " + s + " [label=\"&#124;\"];\n";
              });
            } else {
              dotStr +=
                "" + state + " -> " + destinies + " [label=\"&#124;\"];\n";
            }
            break; 
          case "(":
            if (destinies instanceof Array) {
              destinies.forEach((s) => {
                dotStr += "" + state + " -> " + s + " [label=\"&#40;\"];\n";
              });
            } else {
              dotStr +=
                "" + state + " -> " + destinies + " [label=\"&#40;\"];\n";
            }
            break; 
          case ")":
            if (destinies instanceof Array) {
              destinies.forEach((s) => {
                dotStr += "" + state + " -> " + s + " [label=\"&#41;\"];\n";
              });
            } else {
              dotStr +=
                "" + state + " -> " + destinies + " [label=\"&#41;\"];\n";
            }
            break; 
          case " ":
            if (destinies instanceof Array) {
              destinies.forEach((s) => {
                dotStr += "" + state + " -> " + s + " [label=\" \"];\n";
              });
            } else {
              dotStr +=
                "" + state + " -> " + destinies + " [label=\" \"];\n";
            }
            break; 
          default:
            if (destinies instanceof Array) {
              destinies.forEach((s) => {
                dotStr += "" + state + " -> " + s + " [label=" + symbol + "];\n";
              });
            } else {
              dotStr +=
                "" + state + " -> " + destinies + " [label=" + symbol + "];\n";
            }
            break;
        };
      });
    });
  
    dotStr += "}";
  
    return dotStr;
  };
  
const drawGraph = (nfa) => {
    let dotStr = "digraph fsm {\n";
    dotStr += "rankdir=LR;\n";
    dotStr += 'size="8,5";\n';
    dotStr += "node [shape = point]; INITIAL_STATE\n";
    dotStr += "node [shape = doublecircle]; " + nfa.finalState.label + ";\n";
    dotStr += "node [shape = circle];\n";
    dotStr += "INITIAL_STATE -> " + nfa.initialState.label + ";\n";
  
    nfa.transitions.forEach((nextStates, state) => {
      nextStates.forEach((destinies, symbol) => {
        switch (symbol){
          case "+":
            if (destinies instanceof Array) {
              destinies.forEach((s) => {
                dotStr += "" + state + " -> " + s + " [label=\"&#43;\"];\n";
              });
            } else {
              dotStr +=
                "" + state + " -> " + destinies + " [label=\"&#43;\"];\n";
            }
            break;
          case "*":
            if (destinies instanceof Array) {
              destinies.forEach((s) => {
                dotStr += "" + state + " -> " + s + " [label=\"&#42;\"];\n";
              });
            } else {
              dotStr +=
                "" + state + " -> " + destinies + " [label=\"&#42;\"];\n";
            }
            break;
          case ".":
            if (destinies instanceof Array) {
              destinies.forEach((s) => {
                dotStr += "" + state + " -> " + s + " [label=\"&#46;\"];\n";
              });
            } else {
              dotStr +=
                "" + state + " -> " + destinies + " [label=\"&#46;\"];\n";
            }
            break;  
          case ";":
            if (destinies instanceof Array) {
              destinies.forEach((s) => {
                dotStr += "" + state + " -> " + s + " [label=\"&#59;\"];\n";
              });
            } else {
              dotStr +=
                "" + state + " -> " + destinies + " [label=\"&#59;\"];\n";
            }
            break;  
          case "|":
            if (destinies instanceof Array) {
              destinies.forEach((s) => {
                dotStr += "" + state + " -> " + s + " [label=\"&#124;\"];\n";
              });
            } else {
              dotStr +=
                "" + state + " -> " + destinies + " [label=\"&#124;\"];\n";
            }
            break; 
          case "(":
            if (destinies instanceof Array) {
              destinies.forEach((s) => {
                dotStr += "" + state + " -> " + s + " [label=\"&#40;\"];\n";
              });
            } else {
              dotStr +=
                "" + state + " -> " + destinies + " [label=\"&#40;\"];\n";
            }
            break; 
          case ")":
            if (destinies instanceof Array) {
              destinies.forEach((s) => {
                dotStr += "" + state + " -> " + s + " [label=\"&#41;\"];\n";
              });
            } else {
              dotStr +=
                "" + state + " -> " + destinies + " [label=\"&#41;\"];\n";
            }
            break; 
          case " ":
            if (destinies instanceof Array) {
              destinies.forEach((s) => {
                dotStr += "" + state + " -> " + s + " [label=\" \"];\n";
              });
            } else {
              dotStr +=
                "" + state + " -> " + destinies + " [label=\" \"];\n";
            }
            break;
            case "\\":
              if (destinies instanceof Array) {
                destinies.forEach((s) => {
                  dotStr += "" + state + " -> " + s + " [label=\"&#92;\"];\n";
                });
              } else {
                dotStr +=
                  "" + state + " -> " + destinies + " [label=\"&#92;\"];\n";
              }
              break; 
          case "[":
            if (destinies instanceof Array) {
              destinies.forEach((s) => {
                dotStr += "" + state + " -> " + s + " [label=\"&#91;\"];\n";
              });
            } else {
              dotStr +=
                "" + state + " -> " + destinies + " [label=\"&#91;\"];\n";
            }
            break; 
          case "]":
            if (destinies instanceof Array) {
              destinies.forEach((s) => {
                dotStr += "" + state + " -> " + s + " [label=\"&#93;\"];\n";
              });
            } else {
              dotStr +=
                "" + state + " -> " + destinies + " [label=\"&#93;\"];\n";
            }
            break; 
          default:
            if (destinies instanceof Array) {
              destinies.forEach((s) => {
                dotStr += "" + state + " -> " + s + " [label=" + symbol + "];\n";
              });
            } else {
              dotStr +=
                "" + state + " -> " + destinies + " [label=" + symbol + "];\n";
            }
            break;
        };
      });
    });
  
    dotStr += "}";
  
    return dotStr;
  };
  
const drawGraphTokens = (nfa) => {
    let dotStr = "digraph fsm {\n";
    dotStr += "rankdir=LR;\n";
    dotStr += 'size="8,5";\n';
    dotStr += "node [shape = point]; INITIAL_STATE\n";
    dotStr += "node [shape = doublecircle]; " + nfa.finalState.label + ";\n";
    dotStr += "node [shape = circle];\n";
    dotStr += "INITIAL_STATE -> " + nfa.initialState.label + ";\n";
  
    nfa.transitions.forEach((nextStates, state) => {
      nextStates.forEach((destinies, symbol) => {
        if (destinies instanceof Array) {
          destinies.forEach((s) => {
            dotStr += "" + state + " -> " + s + " [label=" + symbol + "];\n";
          });
        } else {
          dotStr +=
            "" + state + " -> " + destinies + " [label=" + symbol + "];\n";
        }
      });
    });
  
    dotStr += "}";
  
    return dotStr;
  };
  
  const drawTreeTokens = (tree) =>{
    let counter = 0;
    let dotStr = "digraph tree {\n";
    dotStr += "rankdir=TB;\n";
    dotStr += 'size="8,5";\n';
    
    [dotStr, counter] = drawTreeNodeTokens(tree.treeRoot,counter,dotStr);
    dotStr += "}";
    return dotStr;
  };
  function drawTreeNodeTokens(node, counter, string_graph){
    if (node !== null || node !== undefined){
      // console.log(node.value.value)
      string_graph+=counter+" [label=\""+node.value.value+"\"];\n";
      counter++;
      let copy_c = counter-1;
      if (node.left !== null && node.left !== undefined ){
        string_graph += "" + copy_c+ " -> " + counter + ";\n";
        [string_graph,counter] = drawTreeNodeTokens(node.left, counter, string_graph);
      }
      if (node.right !== null ){
        string_graph += "" + copy_c+ " -> " + counter + ";\n";
        [string_graph,counter] = drawTreeNodeTokens(node.right, counter, string_graph);
      }
    };
    return [string_graph, counter];
  };
  
  function drawGraphItems(items, transitions){
    let string_graph = `digraph items{rankdir=LR;\nsize="20,20;\n"`;
    let transitionText = ""
    for (let k = 0; k < items.length; k++){
      // Creating the nodes
      string_graph+=`node[shape = box, label=\"I${k}\n`;
      for (let j = 0; j < items[k].length; j++){
        let item = items[k][j];
        let stringProduction = item.production.join(" ").split(" ");
        // console.log(item)
        stringProduction.splice(item.pos, 0, ".");
        string_graph += `${item.name}->${stringProduction.join(" ")}\n`;
      }
      string_graph+=`\"] I${k};\n`;
      // Create the transitions
      let keys = Array.from(transitions.get(k).keys());
      keys.map((key)=>{
        transitionText+=`I${k}->I${transitions.get(k).get(key)} [label = ${key}];\n`
      });
    }
    string_graph+=transitionText+'}'
    return string_graph;
  }
const drawTreeTokensAscii = (tree) =>{
    let counter = 0;
    let dotStr = "digraph tree {\n";
    dotStr += "rankdir=TB;\n";
    dotStr += 'size="8,5";\n';
    
    [dotStr, counter] = drawTreeNodeTokensAscii(tree.treeRoot,counter,dotStr);
    dotStr += "}";
    return dotStr;
  };
  function drawTreeNodeTokensAscii(node, counter, string_graph){
    if (node !== null || node !== undefined){
      let val = node.value.value;
      if (node.value.precedence < -1){
        val = String.fromCharCode(node.value.value);
      }
      // console.log(node.value.value)
      string_graph+=counter+` [label="${val}"];\n`;
      counter++;
      let copy_c = counter-1;
      if (node.left !== null && node.left !== undefined ){
        string_graph += "" + copy_c+ " -> " + counter + ";\n";
        [string_graph,counter] = drawTreeNodeTokensAscii(node.left, counter, string_graph);
      }
      if (node.right !== null ){
        string_graph += "" + copy_c+ " -> " + counter + ";\n";
        [string_graph,counter] = drawTreeNodeTokensAscii(node.right, counter, string_graph);
      }
    };
    return [string_graph, counter];
  };
  module.exports = {
    drawGraph,
    drawGraphDFA,
    drawGraphTokens,
    drawTreeNodeTokens,
    drawTreeNodeTokensAscii,
    drawTreeTokens,
    drawGraphItems,
  }