var editMode = false;
var editString = "";
var editTool = 0;
var movedSinceTyped = false;

var editTools = {
    1: "insert shape",
    2: "delete shape"
};

function initEditor() {
    $("#grid").click(function (evt) {
        if (editMode && editString.length > 0) {
            var coords = getGridMousePos(evt);
            // Coordinates are ok
            if (coords.ok) {
                // Check for collision
                var collided = false;
                for (var i = 0; i < grid.obj.length; i++) {
                    var o = grid.obj[i];
                    if (o.x == coords.x && o.y == coords.y) {
                        collided = true;
                    }
                }
                if (!collided) {
                    addEditorShape(editString, coords.x, coords.y);
                }
            }
        }
    });
    $(window).mousemove(function (evt) {
        movedSinceTyped = true;
    });
    $(window).keydown(function (evt) {
        if (editMode) {
            $("#editModeDisplay").css("opacity", 1);
            var key = evt.which;
            // Input for new shapes
            if (true) {
                if (key >= 65 && key <= 90) {
                    if (movedSinceTyped || editMode != 1) {
                        editMode = 1;
                        movedSinceTyped = false;
                        editString = "";
                    }
                    var letter = String.fromCharCode(key).toLowerCase();
                    editString += letter;
                    updateEditString();
                }
            }
            // Change edit mode
            if (key >= 48 && key <= 57) {
                // 0: print
                if (key == 48) {
                    printLevel(grid);
                } else {
                    editTool = key - 48;
                    editString = "";
                    updateEditString();
                }
            }
            if (key == 8) {
                editString = "";
                updateEditString();
            }
        } else {
            $("#editModeDisplay").css("opacity", 1);
        }
    });
}

function updateEditString() {
    $("#editModeDisplay").text(editTools[editTool]);
    if (editString.length > 0) {
        $("#editInsertText").text(editString);
        $("#editPanel").css("opacity", 1);
    } else {
        $("#editPanel").css("opacity", 0);
    }
}

function printLevel(grid) {
    var out = "";
    // Shapes
    var blockStr = "!b";
    var obj = jsonClone(grid.obj);
    obj = obj.sort(function(a, b) {
        if (a.y != b.y) {
            return a.y - b.y;
        }
        else {
            return a.x - b.x;
        }
    });
    for (var i = 0; i < obj.length; i++) {
        var o = obj[i];
        blockStr += " ";
        blockStr += findKey(sizeCodes, o.size);
        blockStr += findKey(colorCodes, o.color);
        blockStr += findKey(shapeCodes, o.shape) + " ";
        blockStr += o.x + " " + o.y;
        if (i < obj.length - 1) {
            blockStr += ",";
        }
    }
    out += blockStr;
    console.log(out);
}

function addEditorShape(str, x, y) {
    var size = sizeCodes[str[0]];
    var color = colorCodes[str[1]];
    var shape = shapeCodes[str[2]];
    if (size !== null && color && shape) {
        grid.obj.push({
            type: "block",
            size: size,
            color: color,
            shape: shape,
            x: x,
            y: y
        });
        makeLevelObjects();
    }
}