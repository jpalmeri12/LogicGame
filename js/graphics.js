function makeMenuGraphic() {
    // Dimensions
    var cellpx = 25;
    // Thin lines
    function addLine(x1, y1, x2, y2) {
        $("#menusvg").append('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="rgb(200, 200, 200)" stroke-width="0.75" stroke-dasharray="3 3" />');
    }
    // Vertical
    var sx = 200;
    while (sx - cellpx > 0) {
        sx -= cellpx;
    }
    for (i = sx; i < 400; i += cellpx) {
        addLine(i, 0, i, 300);
    }
    // Horizontal
    var sy = 150;
    while (sy - cellpx > 0) {
        sy -= cellpx;
    }
    for (i = sy; i < 400; i += cellpx) {
        addLine(0, i, 400, i);
    }
    // Refresh
    refreshElement($("#menuBG"));
}