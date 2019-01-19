var EXIST_CHAR = "∃";
var FORALL_CHAR = "∀";
var ELEMENT_CHAR = "∈";
var UNIQUE_CHAR = "!";

function evalBoolSentence(sentence) {
    str = sentence + "";
    var loops = 0;
    while (str.length > 1 && loops < 50000) {
        loops++;
        // Remove extraneous parentheses
        str = iterReplaceGroup(str, [["(T)", "T"], ["(F)", "F"]]);
        // Negations
        str = iterReplaceGroup(str, [["¬T", "F"], ["¬F", "T"]]);
        // And
        str = iterReplaceGroup(str, [["T∧T", "T"], ["T∧F", "F"], ["F∧T", "F"], ["F∧F", "F"]]);
        // Or
        str = iterReplaceGroup(str, [["T∨T", "T"], ["T∨F", "T"], ["F∨T", "T"], ["F∨F", "F"]]);
        // Xor
        str = iterReplaceGroup(str, [["T⊻T", "F"], ["T⊻F", "T"], ["F⊻T", "T"], ["F⊻F", "F"]]);
        // Implies
        str = iterReplaceGroup(str, [["T⇒T", "T"], ["T⇒F", "F"], ["F⇒T", "T"], ["F⇒F", "T"]]);
        // Biconditional
        str = iterReplaceGroup(str, [["T⇔T", "T"], ["T⇔F", "F"], ["F⇔T", "F"], ["F⇔F", "T"]]);
        if (loops == 49999) {
            console.log("Error! Something's wrong with sentence evaluation.");
        }
    }
    return str;
}

function iterReplaceGroup(inputStr, rules) {
    // Check if there is anything to be replaced
    var ok = true;
    var str = inputStr + "";
    for (var i = 0; i < rules.length; i++) {
        if (str.indexOf(rules[i][0]) !== -1) {
            ok = false;
        }
    }
    if (!ok) {
        for (var i = 0; i < rules.length; i++) {
            str = iterReplace(str, rules[i][0], rules[i][1]);
        }
    }
    return str;
}

function iterReplace(str, find, replace) {
    var ok = false;
    var newStr = str + "";
    while (!ok) {
        if (newStr.indexOf(find) == -1) {
            ok = true;
        } else {
            newStr = newStr.replace(find, replace);
        }
    }
    return newStr;
}

function varReplace(str, find, replace) {
    var out = str[0];
    var canReplaceVar = ["(", ","];
    var canReplaceDomain = ["∀", "∃", "!", "∈"];
    for (var i = 1; i < str.length; i++) {
        if (str[i] == str[i].toUpperCase()) {
            if (str[i] == find && canReplaceDomain.indexOf(str[i - 1]) !== -1) {
                out += replace;
            } else {
                out += str[i];
            }
        } else {
            if (str[i] == find && canReplaceVar.indexOf(str[i - 1]) !== -1) {
                out += replace;
            } else {
                out += str[i];
            }
        }
    }
    return out;
}

function evalWorldStatement(sentence, grid) {
    var str = sentence + "";
    // Equals
    str = evalWorldStatementPart(str, grid, "Equals", function (params) {
        if (params[0] == params[1]) {
            return "T";
        } else {
            return "F";
        }
    });
    // OnDark function
    str = evalWorldStatementPart(str, grid, "OnDark", function (params) {
        var o = grid.obj[params[0]];
        for (var i = 0; i < grid.gray.length; i++) {
            var g = grid.gray[i];
            if (o.x >= g.x && o.x < g.x + g.w && o.y >= g.y && o.y < g.y + g.h) {
                return "T";
            }
        }
        return "F";
    });
    // Colors
    str = evalWorldStatementPart(str, grid, "Red", function (params) {
        if (grid.obj[params[0]].color == "red") {
            return "T";
        } else {
            return "F";
        }
    });
    str = evalWorldStatementPart(str, grid, "Green", function (params) {
        if (grid.obj[params[0]].color == "green") {
            return "T";
        } else {
            return "F";
        }
    });
    str = evalWorldStatementPart(str, grid, "Blue", function (params) {
        if (grid.obj[params[0]].color == "blue") {
            return "T";
        } else {
            return "F";
        }
    });
    str = evalWorldStatementPart(str, grid, "Square", function (params) {
        if (grid.obj[params[0]].shape == "square") {
            return "T";
        } else {
            return "F";
        }
    });
    str = evalWorldStatementPart(str, grid, "Circle", function (params) {
        if (grid.obj[params[0]].shape == "circle") {
            return "T";
        } else {
            return "F";
        }
    });
    str = evalWorldStatementPart(str, grid, "Hexagon", function (params) {
        if (grid.obj[params[0]].shape == "hexagon") {
            return "T";
        } else {
            return "F";
        }
    });
    str = evalWorldStatementPart(str, grid, "SameColor", function (params) {
        if (grid.obj[params[0]].color == grid.obj[params[1]].color) {
            return "T";
        } else {
            return "F";
        }
    });
    // Shapes
    str = evalWorldStatementPart(str, grid, "SameShape", function (params) {
        if (grid.obj[params[0]].shape == grid.obj[params[1]].shape) {
            return "T";
        } else {
            return "F";
        }
    });
    // Relative position functions
    str = evalWorldStatementPart(str, grid, "Above", function (params) {
        if (grid.obj[params[0]].y < grid.obj[params[1]].y) {
            return "T";
        } else {
            return "F";
        }
    });
    str = evalWorldStatementPart(str, grid, "Below", function (params) {
        if (grid.obj[params[0]].y > grid.obj[params[1]].y) {
            return "T";
        } else {
            return "F";
        }
    });
    str = evalWorldStatementPart(str, grid, "SameRow", function (params) {
        if (grid.obj[params[0]].y == grid.obj[params[1]].y) {
            return "T";
        } else {
            return "F";
        }
    });
    str = evalWorldStatementPart(str, grid, "LeftOf", function (params) {
        if (grid.obj[params[0]].x < grid.obj[params[1]].x) {
            return "T";
        } else {
            return "F";
        }
    });
    str = evalWorldStatementPart(str, grid, "RightOf", function (params) {
        if (grid.obj[params[0]].x > grid.obj[params[1]].x) {
            return "T";
        } else {
            return "F";
        }
    });
    str = evalWorldStatementPart(str, grid, "SameColumn", function (params) {
        if (grid.obj[params[0]].x == grid.obj[params[1]].x) {
            return "T";
        } else {
            return "F";
        }
    });
    str = evalWorldStatementPart(str, grid, "Adjacent", function (params) {
        var a = grid.obj[params[0]];
        var b = grid.obj[params[1]];
        if (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) == 1) {
            return "T";
        } else {
            return "F";
        }
    });
    // Size functions
    str = evalWorldStatementPart(str, grid, "Smaller", function (params) {
        if (grid.obj[params[0]].size < grid.obj[params[1]].size) {
            return "T";
        } else {
            return "F";
        }
    });
    str = evalWorldStatementPart(str, grid, "Larger", function (params) {
        if (grid.obj[params[0]].size > grid.obj[params[1]].size) {
            return "T";
        } else {
            return "F";
        }
    });
    str = evalWorldStatementPart(str, grid, "SameSize", function (params) {
        if (grid.obj[params[0]].size == grid.obj[params[1]].size) {
            return "T";
        } else {
            return "F";
        }
    });
    str = evalBoolSentence(str);
    return str;
}

function evalWorldStatementPart(str, grid, fnName, fnEval) {
    var done = false;
    var truth;
    while (!done) {
        var index = str.indexOf(fnName);
        if (index !== -1) {
            params = getStringParams(str, index, ")");
            truth = fnEval(params);
            str = str.replace(fnName + "(" + strConcat(params, ",") + ")", truth);
        } else {
            done = true;
        }
    }
    return str;
}

function getStringParams(str, index, endChar) {
    var params = [];
    var currentParam = "";
    var count = 0;
    for (var i = index; str.charAt(i - 1) != endChar && i < str.length; i++) {
        count++;
        var currentChar = str.charAt(i);
        if (currentChar >= '0' && currentChar <= '9') {
            currentParam += currentChar;
        } else {
            if (currentParam != "") {
                params.push(currentParam);
                currentParam = "";
            }
        }
    }
    for (var i = 0; i < params.length; i++) {
        params[i] = parseInt(params[i]);
    }
    return params;
}

// Evaluates a single statement with quantifiers.
function evalQuantifiedStatement(sentence, grid) {
    var str = sentence + "";
    return evalQSHelper(str, grid);
}

// Helper function to extract the quantifiers from a sentence.
function evalQSHelper(sentence, grid) {
    var str = sentence + "";
    var objects = grid.obj;
    var domains = grid.domains;
    // Check if the first character is a "there exists" or "for all" character.
    var first = str.charAt(0);
    if (first == EXIST_CHAR || first == FORALL_CHAR || first == UNIQUE_CHAR) {
        // Extract full quantifier (keep going until you hit a space)
        var quantEnd = 0;
        while (str.charAt(quantEnd) != " " && quantEnd < str.length) {
            quantEnd++;
        }
        var fullQuant = str.slice(0, quantEnd);
        // Quantifier (either "there exists" or "for all")
        var quant = str.charAt(0);
        // Variable to iterate over
        var currentVar = str.charAt(1);
        // Is it restricted to a set?
        var quantSet = null;
        if (str.charAt(2) == ELEMENT_CHAR) {
            var quantSetName = str.charAt(3);
            for (var i = 0; i < grid.domains.length; i++) {
                if (grid.domains[i].name == quantSetName) {
                    quantSet = grid.domains[i];
                }
            }
        }
        // The rest of the statement
        var rest = str.slice(quantEnd + 1);
        // Count how many objects the statement is true for.
        var count = 0;
        // Total number of objects in the set being analyzed.
        var objectsInSet = 0;
        // Tests whether the current variable is for domains or not.
        var isDomain = currentVar == currentVar.toUpperCase();
        if (!isDomain) {
            for (var i = 0; i < objects.length; i++) {
                // Check to see if the object is part of the quantifier. (True by default)
                var countObject = true;
                // If the quantifier contains a set, the object must be in the set.
                if (quantSet) {
                    var checkObject = objects[i];
                    if (!inDomain(checkObject, quantSet)) {
                        countObject = false;
                    }
                }
                if (countObject) { // If it satisfies all the restrictions...
                    objectsInSet++;
                    var newRest = varReplace(rest, currentVar, i);
                    if (evalQSHelper(newRest, grid) == "T") {
                        count++;
                    }
                }
            }
        } else {
            for (var i = 0; i < domains.length; i++) {
                objectsInSet++;
                var newRest = varReplace(rest, currentVar, domains[i].name);
                if (evalQSHelper(newRest, grid) == "T") {
                    count++;
                }
            }
        }
        if (quant == EXIST_CHAR) {
            if (count > 0) {
                return "T";
            } else {
                return "F";
            }
        }
        if (quant == UNIQUE_CHAR) {
            if (count == 1) {
                return "T";
            } else {
                return "F";
            }
        }
        if (quant == FORALL_CHAR) {
            if (count == objectsInSet) {
                return "T";
            } else {
                return "F";
            }
        }
    } else {
        // No quantifier. Proceed with evaluation.
        return evalWorldStatement(str, grid);
    }
}

function inDomain(object, domain) {
    if (object.x >= domain.x && object.x < domain.x + domain.w && object.y >= domain.y && object.y < domain.y + domain.h) {
        return true;
    }
    return false;
}

function evaluateWorld() {
    var result = runWorldEvaluation(grid);
    if (result) {
        clearLevel();
    } else {
        levelNotCleared();
    }
}

// Evaluates all statements in the current world as true or false. Returns true if they're all true.
function runWorldEvaluation(grid) {
    var falses = 0;
    for (var i = 0; i < grid.statements.length; i++) {
        var st = grid.statements[i];
        var value = evalQuantifiedStatement(st.text, grid);
        if (value == "T") {
            // Statement is true
            st.div.removeClass("statementFalse");
            st.div.addClass("statementTrue");
        } else {
            // Statement is false
            falses += 1;
            st.div.removeClass("statementTrue");
            st.div.addClass("statementFalse");
        }
    }
    if (falses <= grid.exceptions) {
        return true;
    }
    return false;
}

function formatSentence(sentence) {
    var str = sentence + "";
    var formatStr = "";
    var toAddSpaces = ["∧", "∨", "⊻", "⇒", "⇔"];
    for (var i = 0; i < str.length; i++) {
        if (toAddSpaces.indexOf(str[i]) != -1) {
            formatStr += " ";
            formatStr += str[i];
            formatStr += " ";
        } else if (str[i] == "!") {
            formatStr += "∃!";
        } else {
            formatStr += str[i];
        }
    }
    return formatStr;
}