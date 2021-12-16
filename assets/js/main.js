$(function() {
  var gridSizeDefault = 32;
  var gridDimDefault = 640;

  var gridSize = gridSizeDefault;
  var gridDim = gridDimDefault;

  var color = "";
  var colorTransparent = "#FFFFFF";
  var colorFG = "#000000";
  var colorBG = "#FFFFFF";
  var colorFGDefault = "#000000";
  var colorBGDefault = "#FFFFFF";

  var clickLessMode = false;
  var mouseIsDown = false;
  var altIsDown = false;
  var useRandomColor = false;

  var $body = $("body");
  var $container = $("#container");
  var $squares = $(".squares");

  // main input event handler
  $body.keydown(function(e) {
    var code = e.which;
    if (code === 18) {
      altIsDown = true;
    }
  });
  $body.keyup(function(e) {
    var code = e.which;
    if (code === 18) {
      altIsDown = false;
    }
  });
  $container.mousedown(function() {
    mouseIsDown = true;
  }).mouseup(function() {
    mouseIsDown = false;
  });

  // disallow right-clicking on canvas
  $container.bind('contextmenu', function(e) {
    e.preventDefault();
  });

  // help square toggle
  $("header a").click(function() {
    $("#help-square").toggle();
  });

  // attach event handlers to color radio options
  $("#color-picker-fg").change(function() {
    colorFG = this.jscolor.toHEXString();
    $("#check-rainbow").prop("checked", false);
  });
  $("#color-picker-bg").change(function() {
    colorBG = this.jscolor.toHEXString();
    $("#check-rainbow").prop("checked", false);
  });
  $("#check-rainbow").click(function() {
    if ($(this).prop("checked")) {
      useRandomColor = true;
    } else {
      colorFG = $("#color-picker-fg").css("background-color");
      colorBG = $("#color-picker-bg").css("background-color");
      useRandomColor = false;
    }
  });
  $("#check-clicklessmode").click(function() {
    if ($(this).prop("checked")) {
      clickLessMode = true;
    } else clickLessMode = false;
  });
  $("#button-clear-grid").click(function() {
    if (confirm('Are you sure you want to reset the image?')) {
      $('.square').css('background-color', colorTransparent);

      clearLocalStorage();
    }
  });

  // attach event handlers to size tools
  $("#text-square-count").keyup(function(e) {
    var code = e.which;
    if (code === 13) {
      e.preventDefault();
      $("#button-square-count-recreate").click();
    }
  });
  $("#button-square-count-recreate").click(function() {
    gridSize = $("#text-square-count").val();
    makeGrid();
  });
  $("#button-square-count-default").click(function() {
    gridSize = gridSizeDefault;
    $("text-square-count").val(gridSizeDefault);
    makeGrid();
  });
  $("#text-grid-width").keyup(function(e) {
    var code = e.which;
    if (code === 13) {
      e.preventDefault();
      $("#button-grid-dim-resize").click();
    }
  });
  $("#button-grid-dim-resize").click(function() {
    $container.css("width", $("#text-grid-width").val());
    $container.css("height", $("#text-grid-width").val());
    makeGrid();
  });
  $("#button-grid-dim-default").click(function() {
    $container.css("width", gridDimDefault);
    $container.css("height", gridDimDefault);
    $("#text-grid-width").val(gridDimDefault);
    makeGrid();
  });
  $("#button-generate-image").click(function() {
    generateImage();
  });

  function generateImage() {
    $container.css("float", "left");
    $("#generated-images").css({
        "display" : "block",
        "height" : $container.height()
    });
    generateLowResBitmap(5, gridSize);
    //location.href = "#gen-img";
  }

  function draw(square, color) {
    if (altIsDown) {
      $(square).css("background-color", colorTransparent);
    }
    else {
      $(square).css("background-color", color);
      saveToLocalStorage();
    }
  }

  function getRandomColor() {
    return "#" + Math.floor(Math.random()*16777215).toString(16);
  }

  function makeGrid() {
    // remove any existing squares
    $("#container .square").remove();
    // remove generated image
    $("#gen-img").remove();

    // create squares
    for(var i = 0; i < gridSize; i++) {
      for(var j = 0; j < gridSize-1; j++){
        $container.append("<div class='square' id='" + j + "_" + i + "'></div>");
      }
      $container.append("<div class='square' id='" + j + "_" + i + "'></div>");
    }

    var containerWidth = $container.width();
    var squareBorder = 1;
    var squareWidth = containerWidth/gridSize - (2 * squareBorder);

    $(".square").css({
      width: squareWidth,
      height: squareWidth,
      background: colorTransparent
    });

    // main draw handler
    $(".square").on("mouseenter mousedown touchend touchmove", function(e) {
      if (useRandomColor) {
        colorFG = getRandomColor();
        colorBG = getRandomColor();
      }

      // choose color based on mouse button
      switch (e.which) {
        case 1:
          e.preventDefault();
          color = colorFG;
          break;
        case 3:
          e.preventDefault();
          color = colorBG;
          break;
        default:
          color = colorFG;
      }

      if (clickLessMode) {
        draw(this, color);
      }
      else if (mouseIsDown) {
        draw(this, color);
      } else {
        $(this).mousedown(function() {
          draw(this, color);
        });
      }
    });
  }

  function loadFromLocalStorage() {
    let settings = localStorage.getItem('sketchage');

    // console.log('settings', settings);

    if (settings) {
      let load = window.confirm('Previous image data found. Load?');

      if (load) {
        let colors = settings.split(';');

        colors.forEach(function(c) {
          c = c.split(':');
          $(`#${c[0]}`).css('background-color', c[1]);
        });
      }
    }
  }

  function saveToLocalStorage() {
    let serialization = '';

    $(".square").each(function() {
      let id = $(this).attr('id');
      let color = $(this).css('background-color');

      serialization = serialization.concat(`${id}:${color};`);
    });

    localStorage.setItem('sketchage', serialization);
  }

  function clearLocalStorage() {
    let settings = localStorage.getItem('sketchage');

    if (settings) {
      localStorage.removeItem('sketchage');
    }
  }

  // make default grid on load
  $("#text-square-count").val(gridSize);
  $("#text-grid-width").val(gridDim);

  makeGrid();

  window.onload = loadFromLocalStorage;
});
