var EXIST_CHAR = "#";
var FORALL_CHAR = "@";

function evalBoolSentence(sentence) {
    str = sentence + "";
    var loops = 0;
    while (str.length > 1 && loops < 50000) {
        loops++;
        // Remove extraneous parentheses
        str = iterReplaceGroup(str, [["(T)", "T"], ["(F)", "F"]]);
        // Negations
        str = iterReplaceGroup(str, [["~T", "F"], ["~F", "T"]]);
        // And
        str = iterReplaceGroup(str, [["T&T", "T"], ["T&F", "F"], ["F&T", "F"], ["F&F", "F"]]);
        // Or
        str = iterReplaceGroup(str, [["T|T", "T"], ["T|F", "T"], ["F|T", "T"], ["F|F", "F"]]);
        // Xor
        str = iterReplaceGroup(str, [["T+T", "F"], ["T+F", "T"], ["F+T", "T"], ["F+F", "F"]]);
        // Implies
        str = iterReplaceGroup(str, [["T>T", "T"], ["T>F", "F"], ["F>T", "T"], ["F>F", "T"]]);
        // Biconditional
        str = iterReplaceGroup(str, [["T=T", "T"], ["T=F", "F"], ["F=T", "F"], ["F=F", "T"]]);
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
    // Equality function
    //    str = evalWorldStatementPart(str, objects, "Equals", function (params) {
    //        if (params[0] == params[1]) {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    // Check directions (north, south, east, west, above, below)
    //    str = evalWorldStatementPart(str, objects, "NorthOf", function (params) {
    //        if (objects[params[0]].z < objects[params[1]].z) {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    str = evalWorldStatementPart(str, objects, "SouthOf", function (params) {
    //        if (objects[params[0]].z > objects[params[1]].z) {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    str = evalWorldStatementPart(str, objects, "WestOf", function (params) {
    //        if (objects[params[0]].x < objects[params[1]].x) {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    str = evalWorldStatementPart(str, objects, "EastOf", function (params) {
    //        if (objects[params[0]].x > objects[params[1]].x) {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    str = evalWorldStatementPart(str, objects, "Below", function (params) {
    //        if (objects[params[0]].y < objects[params[1]].y) {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    // Size functions
    //    str = evalWorldStatementPart(str, objects, "Smaller", function (params) {
    //        if (objects[params[0]].size < objects[params[1]].size) {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    str = evalWorldStatementPart(str, objects, "Larger", function (params) {
    //        if (objects[params[0]].size > objects[params[1]].size) {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    str = evalWorldStatementPart(str, objects, "SameSize", function (params) {
    //        if (objects[params[0]].size == objects[params[1]].size) {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    str = evalWorldStatementPart(str, objects, "Small", function (params) {
    //        if (objects[params[0]].size < 1) {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    str = evalWorldStatementPart(str, objects, "Medium", function (params) {
    //        if (objects[params[0]].size == 1) {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    str = evalWorldStatementPart(str, objects, "Large", function (params) {
    //        if (objects[params[0]].size > 1) {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    // Shape functions
    //    str = evalWorldStatementPart(str, objects, "SameShape", function (params) {
    //        if (objects[params[0]].type == objects[params[1]].type) {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    str = evalWorldStatementPart(str, objects, "Tetra", function (params) {
    //        if (objects[params[0]].type == "tet") {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    str = evalWorldStatementPart(str, objects, "Cube", function (params) {
    //        if (objects[params[0]].type == "cube") {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    str = evalWorldStatementPart(str, objects, "Dodec", function (params) {
    //        if (objects[params[0]].type == "dodec") {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    // Color functions
    //    str = evalWorldStatementPart(str, objects, "SameColor", function (params) {
    //        if (objects[params[0]].laserColor == objects[params[1]].laserColor) {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    str = evalWorldStatementPart(str, objects, "Green", function (params) {
    //        if (objects[params[0]].laserColor == "green") {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    str = evalWorldStatementPart(str, objects, "Blue", function (params) {
    //        if (objects[params[0]].laserColor == "blue") {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    str = evalWorldStatementPart(str, objects, "Orange", function (params) {
    //        if (objects[params[0]].laserColor == "orange") {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    str = evalWorldStatementPart(str, objects, "Purple", function (params) {
    //        if (objects[params[0]].laserColor == "purple") {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    // Other position functions
    //    str = evalWorldStatementPart(str, objects, "OnGround", function (params) {
    //        if (objects[params[0]].y == "0") {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    str = evalWorldStatementPart(str, objects, "InCenter", function (params) {
    //        if ((objects[params[0]].x == "2" || objects[params[0]].x == "3") && (objects[params[0]].z == "2" || objects[params[0]].z == "3")) {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    str = evalWorldStatementPart(str, objects, "InCorner", function (params) {
    //        if ((objects[params[0]].x == "0" || objects[params[0]].x == "5") && (objects[params[0]].z == "0" || objects[params[0]].z == "5")) {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
    //    str = evalWorldStatementPart(str, objects, "Adjacent", function (params) {
    //        var dist = Math.abs(objects[params[0]].x - objects[params[1]].x) + Math.abs(objects[params[0]].y - objects[params[1]].y) + Math.abs(objects[params[0]].z - objects[params[1]].z);
    //        if (dist == 1) {
    //            return "T";
    //        } else {
    //            return "F";
    //        }
    //    });
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
    // Check if the first character is a "there exists" or "for all" character.
    var first = str.charAt(0);
    if (first == EXIST_CHAR || first == FORALL_CHAR) {
        // Quantifier (either "there exists" or "for all")
        var quant = str.charAt(0);
        // Variable to iterate over
        var currentVar = str.charAt(1);
        // The rest of the statement
        var rest = str.slice(3, str.length);
        // Count how many objects the statement is true for.
        var count = 0;
        // Total number of objects in the set being analyzed.
        var objectsInSet = 0;
        for (var i = 0; i < objects.length; i++) {
            if (true) { // Leaving this here so I can add set restrictions later.
                objectsInSet++;
                var newRest = iterReplace(rest, currentVar, i);
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

function evaluateWorld() {
    var result = runWorldEvaluation(grid);
    if (result) {
        clearLevel();
    }
}

//function applyLaserColors() {
//    // For each shape...
//    for (var i = 0; i < shapes.length; i++) {
//        var shape = shapes[i];
//        var laserColor = laserColorMap[shape.y][shape.z];
//        // If the laser color for that row is empty, just use the shape's actual color. Otherwise, use the laser's color.
//        if (laserColor != "") {
//            shape.laserColor = laserColor;
//        } else {
//            shape.laserColor = shape.color;
//        }
//        // Set the actual shape mesh's color
//        $("#shape" + i).attr("color", colors[shape.laserColor]);
//    }
//}

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
    str = iterReplace(str, "@", "∀");
    str = iterReplace(str, "#", "∃");
    str = iterReplace(str, "/", "∈");
    str = iterReplace(str, "~", "¬");
    str = iterReplace(str, ">", " ⇒ ");
    str = iterReplace(str, "=", " ⇔ ");
    str = iterReplace(str, "+", " ⊕ ");
    str = iterReplace(str, "|", " ∨ ");
    str = iterReplace(str, "&", " ∧ ");
    return str;
}