// Fades to a particular div with the given name.
function showScreen(scr) {
    $(".screenBox.anim_fadeIn").removeClass("anim_fadeIn").addClass("anim_fadeOut");
    setTimeout(function () {
        $("#" + scr).removeClass("anim_fadeOut").addClass("anim_fadeIn");
    }, 250);
}

// Shuffles an array.
function shuffle(array) {
    var m = array.length,
        t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

// Finds the gcd of two numbers.
var gcd = function (a, b) {
    if (!b) {
        return a;
    }

    return gcd(b, a % b);
};

var swap = function (array, pos1, pos2) {
  var temp = array[pos1];
  array[pos1] = array[pos2];
  array[pos2] = temp;
};

var heapsPermute = function (array, output, n) {
  n = n || array.length; // set n default to array.length
  if (n === 1) {
    output(array);
  } else {
    for (var i = 1; i <= n; i += 1) {
      heapsPermute(array, output, n - 1);
      if (n % 2) {
        var j = 1;
      } else {
        var j = i;
      }
      swap(array, j - 1, n - 1); // -1 to account for javascript zero-indexing
    }
  }
};