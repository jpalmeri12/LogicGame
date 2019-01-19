var allLevelSets = [];

var game = {};

var grid = {
    size: 10,
    x: .5,
    y: 2.5,
    dim: 7,
    obj: [],
    on: false,
    ctrl: {
        drag: false,
        id: -1
    },
    statements: [],
    gray: [],
    cleared: false,
    canContinue: false
};

var colors = {
    "red": "#ff6666",
    "green": "#00e6ac",
    "blue": "#33adff",
    "orange": "#ff9900",
    "purple": "#6600cc",
    "yellow": "#ffff66"
};

var domainColors = {
    "A": "#404040",
    "B": "#404040",
    "C": "#404040",
    "D": "#404040",
    "E": "#404040",
    "F": "#404040",
    "G": "#404040",
    "H": "#404040",
    "I": "#404040",
}

var blockSizeWords = ["small", "medium", "large"];

var levels = [];

var debug = false;
var unlockAll = false;

var parts = {
    1: {
        name: "Basics",
        r: 51,
        g: 173,
        b: 255
    },
    2: {
        name: "Domains",
        r: 0,
        g: 230,
        b: 172
    },
    3: {
        name: "Numbers",
        r: 255,
        g: 153,
        b: 0
    },
    4: {
        name: "Modifiers",
        r: 255,
        g: 102,
        b: 102
    },
    5: {
        name: "Oddities",
        r: 102,
        g: 0,
        b: 204
    }
};

var progress = {};

var currentUser = "user";
var clearedLevels = 0;

var levelStates = {};

$(function () {
    loadLevelsFromFile("files/levels.txt");
});

function continueLoading() {
    loadGame();
    initControls();
    initEditor();
    makeMenuGraphic();
    //showScreen("prepScreen");
    returnToMenu(false);
}

// Returns to menu. If doSave is true, it will save the current level state.
function returnToMenu(doSave) {
    if (doSave) {
        saveLevelState();
    }
    clearedLevels = getClearedLevelCount();
    makeMenuButtons();
    showScreen("menuScreen");
    $("#clearedText").text("Cleared: " + clearedLevels);
}

// Makes menu buttons. Called every time the user goes back to the menu.
function makeMenuButtons() {
    // Empty and append the header.
    $("#menuButtons").empty();
    $("#menuButtons").append('<div class="menuEndBox"><div class="menuEndText">Level Selection</div></div>');
    var rows = [];
    // Keeps track of the last row that was appended. This is the row buttons will be added to.
    var lastRowID = 0;
    var lastRow = null;
    for (var i = 0; i < allLevelSets.length; i++) {
        var ls = allLevelSets[i];
        var nmID = ls.numericID;
        var id = nmID.split("-");
        var world = id[0];
        var lv = id[1];
        // Append the button if it's unlocked.
        var req = (world - 1) * 30 + (lv - 1) * 6;
        if (clearedLevels >= req || unlockAll) {
            // But first check to see if a new row should be appended.
            if (world > lastRowID) {
                lastRowID = world;
                var lastRowBox = $('<div class="menuRowBox"></div>');
                lastRow = $('<div class="menuRow menuBG' + world + '"></div>');
                lastRowBox.append('<div class="menuRowTag menuBG' + world + '"><div class="menuRowTagText1">Part ' + world + '</div></div>');
                lastRowBox.append(lastRow);
                lastRowBox.append('<div class="menuRowTag menuBG' + world + '"><div class="menuRowTagText2">' + parts[world].name + '</div></div>');
                $("#menuButtons").append(lastRowBox);
            }
            // Then append the button.
            var newButton = $('<div id="menuButton' + nmID + '" class="menuButton"></div>');
            newButton.append('<div class="menuButtonText">' + nmID + '</div>');
            var progress = getUserProgress(currentUser, ls.internalID);
            var progString = "★ " + ls.levels.length;
            if (!progress.cleared) {
                progString = progress.progress + " / " + ls.levels.length;
            }
            newButton.append('<div class="menuButtonProgress">' + progString + '</div>');
            lastRow.append(newButton);
            initMenuClick(nmID);
        }
    }
    for (var i = 1; i <= 5; i++) {
        var c = parts[i];
        $(".menuBG" + i).css("background-color", "rgba(" + c.r + ", " + c.g + ", " + c.b + ", .75)");
    }
    $("#menuButtons").append('<div class="menuEndBox"><div id="clearedText" class="menuEndText"></div></div>');
}

function initMenuClick(nmID) {
    $("#menuButton" + nmID).click(function () {
        loadLevelFromNumID(nmID, 0);
        showScreen("prepScreen");
    });
}

function getClearedLevelCount() {
    var cleared = 0;
    for (var i = 0; i < allLevelSets.length; i++) {
        var pr = getUserProgress(currentUser, allLevelSets[i].internalID).progress;
        cleared += pr;
    }
    return cleared;
}

function resetGrid() {
    return {
        size: 10,
        x: .5,
        y: 2.5,
        dim: 7,
        obj: [],
        on: false,
        ctrl: {
            drag: false,
            id: -1
        },
        statements: [],
        gray: []
    };
}

function loadLevelFromNumID(numericID, lvNum) {
    for (var i = 0; i < allLevelSets.length; i++) {
        if (allLevelSets[i].numericID == numericID) {
            loadLevelSet(allLevelSets[i], lvNum);
        }
    }
}

function loadLevelSet(set, lvNum) {
    game = JSON.parse(JSON.stringify(set));
    $("#prepNumber").text("Puzzle " + game.numericID);
    $("#prepTitle").text(game.title);
    makeLevelSetButtons();
    loadLevel(lvNum);
}

function makeLevelSetButtons() {
    $("#gameLevelButtons").empty();
    for (var i = 0; i < game.levels.length; i++) {
        var newButton = $('<div id="gameLevelButton' + i + '" class="gameLevelButton"></div>');
        newButton.append($('<div class="gameLevelButtonNum">' + (i + 1) + '</div>'));
        $("#gameLevelButtons").append(newButton);
        initLvSetClick(i);
    }
    updateLevelSetButtons();
}

function updateLevelSetButtons() {
    var userProgress = getUserProgress(currentUser, game.internalID);
    var pr = userProgress.progress;
    for (var i = 0; i <= game.levels.length; i++) {
        var lvButton = $("#gameLevelButton" + i);
        var lvButtonText = $("#gameLevelButton" + i + ">.gameLevelButtonNum");
        if (pr >= i || unlockAll) {
            lvButton.removeClass("gameLevelButtonShrink");
            lvButtonText.text(i + 1);
        } else {
            lvButton.addClass("gameLevelButtonShrink");
            lvButtonText.text("");
        }
    }
}

function initLvSetClick(n) {
    $("#gameLevelButton" + n).click(function () {
        var userProgress = getUserProgress(currentUser, game.internalID);
        var pr = userProgress.progress;
        if (grid.on && (pr >= n || unlockAll)) {
            saveLevelState();
            loadLevel(n);
            grid.on = true;
        }
    });
}

function loadLevel(id) {
    // Set current level
    game.currentLevel = id;
    // Update buttons
    $(".gameLevelButton").removeClass("gameLevelButtonSelected");
    $("#gameLevelButton" + id).addClass("gameLevelButtonSelected");
    // Clear the "correct" animation
    $("#gameClearText").removeClass("anim_gameClearIn");
    $("#gameClearText").removeClass("anim_gameClearInstant");
    $("#clickToContinueText").removeClass("anim_ctcIn");
    // Reset the grid and set it to the proper dimensions
    grid = resetGrid();
    setGrid(200, game);
    var lv = game.levels[game.currentLevel];
    var savedState = loadLevelState();
    if (savedState) {
        grid.obj = savedState.obj;
        grid.cleared = savedState.cleared;
    } else {
        grid.obj = jsonClone(lv.obj);
        grid.cleared = false;
    }
    grid.gray = jsonClone(lv.gray);
    grid.domains = jsonClone(lv.domains);
    grid.statements = jsonClone(lv.statements);
    grid.scale = lv.scale;
    grid.exceptions = lv.exceptions;
    grid.hasUniversal = lv.hasUniversal;
    makeStatementDivs();
    makeLevelObjects();
    updateLevelSetButtons();
}

function makeLevelObjects() {
    // Set title text
    $("#gameLevelNumber").text(game.numericID);
    $("#gameLevelTitle").text(game.title);
    // Make objects and append them to the DOM
    var size = grid.size / grid.dim;
    // Gray areas
    $("#grayAreas").empty();
    for (var i = 0; i < grid.gray.length; i++) {
        var g = grid.gray[i];
        var grayArea = $('<div class="grayArea"></div>');
        grayArea.css({
            left: (g.x * size) + "rem",
            top: (g.y * size) + "rem",
            width: (g.w * size) + "rem",
            height: (g.h * size) + "rem"
        });
        $("#grayAreas").append(grayArea);
    }
    // Movable objects (blocks and possibly others?)
    $("#movable").empty();
    for (var i = 0; i < grid.obj.length; i++) {
        var o = grid.obj[i];
        if (o.type == "block") {
            var block = makeBlock(o);
            block.data("id", i);
            $("#movable").append(block);
            refreshElement(block);
            o.div = block;
        }
    }
    // Initialize clicks
    initBlockClicks();
    // Set their CSS properties
    $(".block").css({
        width: size + "rem",
        height: size + "rem"
    });
    $("#grabDiv").css({
        width: size + "rem",
        height: size + "rem"
    });
    $(".blockNum").css({
        "font-size": (0.5 * size) + "rem"
    });
    // Update
    updateGrid();
    evaluateWorld();
}

// Initializes some controls.
function initControls() {
    $(window).mouseup(function (evt) {
        endDrag(evt);
    });
    $(window).mousemove(function (evt) {
        updateDrag(evt);
    });
    $(window).keyup(function (evt) {
        if (evt.keyCode == 27) {
            tryReturnToMenu();
        }
        //        if (evt.keyCode == 67 && debug) {
        //            //clearLevel();
        //        }
    });
    $("#prepScreen").click(function () {
        grid.on = true;
        showScreen("gameScreen");
    });
    $("#resetButton").click(function () {
        resetUser(currentUser);
    });
    $("#gameReturnBox").click(function () {
        tryReturnToMenu();
    });
    $("#gameScreen").click(function () {
        if (grid) {
            if (grid.canContinue) {
                nextLevel();
            }
        }
    });
}

// Returns the user to the menu if possible.
function tryReturnToMenu() {
    if (grid) {
        if (grid.on) {
            grid.on = false;
            returnToMenu(true);
        }
    }
}

// Initializes block clicks after they are added to the DOM.
function initBlockClicks() {
    $(".block").mousedown(function (evt) {
        startDrag(evt);
    });
}

// Grabs an object to drag.
function startDrag(evt) {
    var target = evt.currentTarget;
    var id = $(target).data("id");
    if (grid) {
        if (grid.on) {
            if (editMode && editTool == 2) {
                grid.obj.splice(id, 1);
                makeLevelObjects();
            } else {
                if (isInSet(grid.obj[id], grid)) {
                    grid.ctrl.drag = true;
                    grid.ctrl.id = id;
                    $("#grabDiv").css("opacity", 1);
                    var grabbed = grid.obj[grid.ctrl.id].div;
                    $("#grabDiv").html($(grabbed[0]).html());
                    refreshElement($("#grabDiv"));
                    updateGrid();
                    updateDrag(evt);
                }
            }

        }
    }
}

// Updates the drag image.
function updateDrag(evt) {
    var off = $("#gameScreen").offset();
    if (grid.on) {
        if (grid.ctrl.drag) {
            var x = evt.pageX - off.left - $("#grabDiv").width() / 2;
            var y = evt.pageY - off.top - $("#grabDiv").height() / 2;
            $("#grabDiv").css({
                left: x,
                top: y
            });
        }
    }
}

// Drops whatever was being dragged, if anything.
function endDrag(evt) {
    if (grid) {
        if (grid.on) {
            // Grid exists and is active
            var o = grid.obj[grid.ctrl.id];
            // Check if a shape was being dragged
            if (grid.ctrl.drag && grid.ctrl.id > -1) {
                // Get the coordinates the drop location
                var coords = getGridMousePos(evt);
                if (coords.ok) {
                    // Coordinates are within bounds, check to see if it's being dropped in a set
                    if (isInSet(coords, grid)) {
                        // It's in a set, check to see if there's an object in the drop location
                        var i = grid.obj.findIndex(function (a) {
                            return a.x == coords.x && a.y == coords.y
                        });
                        if (i !== -1) {
                            // Index is not -1; there is an object we have to swap with.
                            var o2 = grid.obj[i];
                            o2.x = o.x;
                            o2.y = o.y;
                        }
                        o.x = coords.x;
                        o.y = coords.y;
                    }
                }
            }
            grid.ctrl.drag = false;
            grid.ctrl.id = -1;
            $("#grabDiv").css("opacity", 0);
            $("#grabDiv").html("");
            updateGrid();
            // Run world evaluation after each move
            evaluateWorld();
        }
    }
}

function isInSet(coords, grid) {
    var inSet = false;
    if (grid.hasUniversal) {
        inSet = true;
    } else {
        for (var i = 0; i < grid.domains.length; i++) {
            if (inDomain(coords, grid.domains[i])) {
                inSet = true;
            }
        }
    }
    return inSet;
}

// Creates a block DOM object.
function makeBlock(o) {
    var block = $('<div class="block"></div>');
    var innerBlock = $('<div></div>')
    innerBlock.append(makeSVG(o.shape, o.color, o.size));
    innerBlock.append('<div class="blockNum"></div>');
    innerBlock.addClass("block_size_" + blockSizeWords[o.size]);
    block.append(innerBlock);
    return block;
}

// Sets the size and dimensions of the grid.
function setGrid(size, gameObj) {
    dim = gameObj.dim;
    // Set clickable area dimensions
    var s = size / 20;
    var x = .5;
    var y = (15 - s) / 2;
    $("#grid").css({
        width: s + "rem",
        height: s + "rem",
        left: x + "rem",
        top: y + "rem"
    });
    // Store this information in the grid object
    grid.size = s;
    grid.x = x;
    grid.y = y;
    grid.dim = dim;
    // Make grid background
    makeGridBG(size, gameObj);
}

function makeGridBG(size, gameObj) {
    dim = gameObj.dim;
    var thisLevel = gameObj.levels[gameObj.currentLevel];
    $("#gridsvg").empty();
    // Dimensions
    var x = 10;
    var y = (300 - size) / 2;
    var cellpx = size / dim;
    // Thin lines
    function addLine(x1, y1, x2, y2) {
        $("#gridsvg").append('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="rgb(200, 200, 200)" stroke-width="0.75" stroke-dasharray="3 3" />');
    }
    // Vertical
    var sx = x;
    while (sx - cellpx > 0) {
        sx -= cellpx;
    }
    for (i = sx; i < 400; i += cellpx) {
        addLine(i, 0, i, 300);
    }
    // Horizontal
    var sy = y;
    while (sy - cellpx > 0) {
        sy -= cellpx;
    }
    for (i = sy; i < 400; i += cellpx) {
        addLine(0, i, 400, i);
    }
    // Add outer box
    if (thisLevel.hasUniversal) {
        $("#gridsvg").append('<rect fill="none" stroke="#808080" stroke-width="3" x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" />');
    }
    var domains = thisLevel.domains;
    // Add domain boxes
    for (var i = 0; i < domains.length; i++) {
        var d = domains[i];
        var dx = d.x * cellpx + x;
        var dy = d.y * cellpx + y;
        var dw = d.w * cellpx;
        var dh = d.h * cellpx;
        $("#gridsvg").append('<rect fill="none" stroke="' + domainColors[d.name] + '" stroke-width="3" x="' + dx + '" y="' + dy + '" width="' + dw + '" height="' + dh + '" />');
        $("#gridsvg").append('<circle fill="' + domainColors[d.name] + '" stroke="none" cx="' + dx + '" cy="' + dy + '" r="' + (cellpx / 4) + '"  />');
        $("#gridsvg").append('<text fill="#ffffff" font-family="FuturaDemi" font-size="' + (cellpx / 3) + '" text-anchor="middle" x="' + dx + '" y="' + (dy + cellpx / 9) + '">' + d.name + '</text>');
    }
    // Refresh
    refreshElement($("#gridBG"));
}

function refreshElement(el) {
    el.html(el.html());
}

function makeSVG(shape, color, size) {
    var sizes = [8, 5.3333, 4];
    var stroke = sizes[size];
    var hex = colors[color];
    var svg = $('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 100 100" xml:space="preserve"></svg>');
    if (shape == "square") {
        svg.append('<rect fill="' + hex + '" stroke="#ffffff" stroke-width="' + stroke + '" x="10" y="10" width="80" height="80" />');
    } else if (shape == "circle") {
        svg.append('<circle fill="' + hex + '" stroke="#ffffff" stroke-width="' + stroke + '" cx="50" cy="50" r="40" />');
    } else if (shape == "hexagon") {
        svg.append('<polygon fill="' + hex + '" stroke="#ffffff" stroke-width="' + stroke + '" points="26.906,90 3.812,50 26.906,10 73.094,10 96.188,50 73.094,90 "/>');
    }
    return svg;
}

// Sets grid objects to the right positions
function updateGrid() {
    for (var i = 0; i < grid.obj.length; i++) {
        var o = grid.obj[i];
        var scale = grid.size / grid.dim;
        var x = o.x * scale;
        var y = o.y * scale;
        var op = 1;
        if (grid.ctrl.drag && i == grid.ctrl.id) {
            op = .25;
        }
        $(o.div[0]).css({
            left: x + "rem",
            top: y + "rem",
            opacity: op
        });
        var numDiv = $(o.div[0]).children(".blockNum")[0];
        if (o.val) {
            $(numDiv).text(o.val);
        }
    }
}

function getGridMouseFloat(evt) {
    var offset = $("#grid").offset();
    var x = (evt.pageX - offset.left) / $("#grid").width();
    var y = (evt.pageY - offset.top) / $("#grid").height();
    return {
        x: x,
        y: y
    };
}

function getGridMousePos(evt) {
    var fl = getGridMouseFloat(evt);
    var x = Math.floor(grid.dim * fl.x);
    var y = Math.floor(grid.dim * fl.y);
    if (x < 0 || x >= grid.dim || y < 0 || y >= grid.dim) {
        return {
            x: -1,
            y: -1,
            ok: false
        };
    }
    return {
        x: x,
        y: y,
        ok: true
    }
}

// Makes statement divs and adds them to the board.
function makeStatementDivs() {
    // Empty the container
    $("#statementBox").empty();
    for (var i = 0; i < grid.statements.length; i++) {
        var st = grid.statements[i];
        // Make the pre hint (if applicable)
        if (st.pre) {
            var preBox = $('<div class="help helpTop"></div>');
            preBox.append('<div class="helpText">' + st.pre + '</div>');
            var preArrow = $('<div class="helpArrowTop"></div>');
            // Box comes before arrow
            $("#statementBox").append(preBox);
            $("#statementBox").append(preArrow);
        }
        // Make the main statement box.
        var mainBox = $('<div class="statement"></div>');
        mainBox.append('<div class="statementText">' + formatSentence(st.text) + '</div>');
        $("#statementBox").append(mainBox);
        // Store a reference to this div
        st.div = mainBox;
        // Make the post hint (if applicable)
        if (st.post) {
            var postBox = $('<div class="help helpBottom"></div>');
            postBox.append('<div class="helpText">' + st.post + '</div>');
            var postArrow = $('<div class="helpArrowBottom"></div>');
            // Arrow comes before box
            $("#statementBox").append(postArrow);
            $("#statementBox").append(postBox);
        }
    }
    $(".statementText").css("font-size", (.5 * grid.scale) + "rem");
    // Exceptions
    if (grid.exceptions > 0) {
        var exBox = $('<div class="exceptionBox"></div>');
        exBox.append('<div class="exceptionText">Except <span class="exceptionNum">' + grid.exceptions + '</span></div>');
        $("#statementBox").append(exBox);
    }
}

function jsonClone(o) {
    return JSON.parse(JSON.stringify(o));
}

// Clear level animation
function clearLevel() {
    // If the level has not already been cleared, play the animation. Otherwise, just show the CORRECT text.
    if (!grid.cleared && !editMode) {
        // Disable controls
        grid.on = false;
        // Record that the user did it
        setUserProgress(currentUser, game.internalID, game.currentLevel + 1, game.currentLevel + 1 >= game.levels.length);
        $("#gameClearText").removeClass("anim_gameClearInstant");
        $("#gameClearText").addClass("anim_gameClearIn");
        $("#whiteBox").removeClass("anim_whiteBoxOut");
        $("#whiteBox").addClass("anim_whiteBoxIn");
        setTimeout(function () {
            $("#whiteBox").removeClass("anim_whiteBoxIn");
            $("#whiteBox").addClass("anim_whiteBoxOut");
            grid.cleared = true;
            saveLevelState();
            grid.canContinue = true;
        }, 875);
        setTimeout(function () {
            $("#clickToContinueText").addClass("anim_ctcIn");
        }, 1000);
    } else {
        $("#gameClearText").removeClass("anim_gameClearIn");
        $("#gameClearText").addClass("anim_gameClearInstant");
    }
}

function levelNotCleared() {
    $("#gameClearText").removeClass("anim_gameClearIn");
    $("#gameClearText").removeClass("anim_gameClearInstant");
}

function nextLevel() {
    grid.canContinue = false;
    if (game.currentLevel < game.levels.length - 1) {
        loadLevel(game.currentLevel + 1);
        grid.on = true;
    } else {
        // Finished the set
        returnToMenu();
    }
}

// Handles level save states.

function saveLevelState() {
    var levelObj = jsonClone(grid.obj);
    if (!levelStates[game.internalID]) {
        levelStates[game.internalID] = {};
    }
    levelStates[game.internalID][game.currentLevel] = {
        obj: levelObj,
        cleared: grid.cleared
    };
}

function loadLevelState() {
    if (!levelStates[game.internalID]) {
        return false;
    }
    if (!levelStates[game.internalID][game.currentLevel]) {
        return false;
    }
    return levelStates[game.internalID][game.currentLevel];
}

// Handles user data saving.

function makeNewUser(user) {
    progress[user] = {};
}

function getUserProgress(user, levelSet) {
    if (!progress[user]) {
        return {
            progress: 0,
            cleared: false
        };
    }
    if (progress[user][levelSet]) {
        return progress[user][levelSet];
    } else {
        return {
            progress: 0,
            cleared: false
        }
    }
}

function setUserProgress(user, levelSet, numCleared, cleared) {
    if (!progress[user]) {
        return false;
    }
    if (!progress[user][levelSet]) {
        progress[user][levelSet] = {
            progress: 0,
            cleared: false
        };
    }
    if (numCleared > progress[user][levelSet].progress) {
        progress[user][levelSet].progress = numCleared;
        if (cleared) {
            progress[user][levelSet].cleared = true;
        }
        saveGame();
    }
    return true;
}

function resetUser(user) {
    progress[user] = {};
    saveGame();
    returnToMenu(false);
}

function saveGame() {
    localStorage.setItem('tarskiLogicGame2D', JSON.stringify(progress));
}

function loadGame() {
    var loadedProgress = localStorage.getItem('tarskiLogicGame2D');
    if (loadedProgress) {
        progress = JSON.parse(loadedProgress);
    } else {
        progress = {};
        makeNewUser("user");
    }
}