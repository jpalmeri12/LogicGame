// Codes
var shapeCodes = {
    "c": "circle",
    "s": "square",
    "h": "hexagon"
};

var colorCodes = {
    "r": "red",
    "g": "green",
    "b": "blue",
    "o": "orange",
    "p": "purple",
    "y": "yellow"
}

var sizeCodes = {
    "s": 0,
    "m": 1,
    "l": 2
}

// Loads all levels from the given file.
function loadLevelsFromFile(url) {
    $.ajax(url).done(function (data) {
        allLevelSets = processLevels(data);
        continueLoading();
    });
}

// Processes a level file.
function processLevels(data) {
    // Split it into lines
    var lines = data.split("\n");
    // Set of all level sets.
    var levelSets = [];
    // The current level set that is being modified.
    var levelSet = null;
    // The current level that is being modified.
    var level = null;
    // For each line, do the specified action
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        // Extract the flag (first two characters) and parameters (rest of the line)
        var flag = line.substr(0, 2);
        var params = line.substr(3);
        // Flag !n: End previous level set if one was active, and create a new level set.
        if (flag == "!n") {
            if (levelSet != null) {
                levelSets.push(levelSet);
            }
            levelSet = newLevelSet(params);
        }
        // Flag !i: Assigns the current level set the given numeric id.
        if (flag == "!i") {
            levelSet.numericID = params;
        }
        // Flag !t: Assigns the current level set the given title.
        if (flag == "!t") {
            levelSet.title = params;
        }
        // Flag !t: Assigns the current level set the given dimensions.
        if (flag == "!d") {
            levelSet.dim = parseInt(params);
        }
        // Flag !l: Creates a new level in the level set, and adds the previous one if applicable.
        if (flag == "!l") {
            if (level != null) {
                levelSet.levels.push(level);
            }
            level = newLevel();
        }
        // Flag !b: Adds one or more blocks (subclass of objects) to the level.
        if (flag == "!b") {
            var blockParams = params.split(", ");
            for (var j = 0; j < blockParams.length; j++) {
                var bp = blockParams[j].split(" ");
                level.obj.push({
                    type: "block",
                    size: sizeCodes[bp[0].charAt(0)],
                    color: colorCodes[bp[0].charAt(1)],
                    shape: shapeCodes[bp[0].charAt(2)],
                    x: parseInt(bp[1]),
                    y: parseInt(bp[2])
                });
            }
        }
        // Flag !g: Adds a gray area to the level.
        if (flag == "!g") {
            var gp = params.split(" ");
            level.gray.push({
                x: parseInt(gp[0]),
                y: parseInt(gp[1]),
                w: parseInt(gp[2]),
                h: parseInt(gp[3])
            });
        }
        // Flag !s: Adds a statement to the level.
        if (flag == "!s") {
            level.statements.push({
                text: params
            });
        }
        // Flag !h: Adds help text to the last statement added to the level.
        if (flag == "!h") {
            var hp = params.split(" ");
            var type = hp[0];
            var text = hp.slice(1).join(" ");
            var lastStatement = level.statements[level.statements.length - 1];
            if (type == "pre") {
                lastStatement.pre = text;
            }
            else if (type == "post") {
                lastStatement.post = text;
            }
        }
        // Flag !f: Sets font size
        if (flag == "!f") {
            level.scale = parseFloat(params);
        }
        // Flag !x: Sets exception numbers
        if (flag == "!x") {
            level.exceptions = parseFloat(params);
        }
        // Flag !r: Makes a new region (domain)
        if (flag == "!r") {
            var rp = params.split(" ");
            level.domains.push({
                name: rp[0],
                x: parseInt(rp[1]),
                y: parseInt(rp[2]),
                w: parseInt(rp[3]),
                h: parseInt(rp[4])
            });
        }
        // Flag !r: Marks level as not having a universal set
        if (flag == "!R") {
            level.hasUniversal = false;
        }
        // Flag !e: End the current level set and add it to the list.
        if (flag == "!e") {
            levelSet.levels.push(level);
            levelSets.push(levelSet);
            level = null;
            levelSet = null;
        }
    }
    levelSets.sort(function(a, b) {
        if (a.numericID < b.numericID) {
            return -1;
        }
        else if (a.numericID > b.numericID) {
            return 1;
        }
        return 0;
    });
    return levelSets;
}

function newLevelSet(internalID) {
    return {
        internalID: internalID,
        numericID: "",
        title: "",
        dim: 7,
        levels: []
    };
}

function newLevel() {
    return {
        obj: [],
        domains: [],
        gray: [],
        colorAreas: [],
        statements: [],
        scale: 1,
        exceptions: 0,
        hasUniversal: true
    }
}