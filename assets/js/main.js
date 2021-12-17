$(function() {
  // Sketchage object init
  if ((typeof Sketchage) === 'undefined') var Sketchage = {}

  const GRID_SIZE_DEFAULT = 32;
  const GRID_DIM_DEFAULT = 640;
  const COLOR_FG_DEFAULT = "#000000";
  const COLOR_BG_DEFAULT = "#FFFFFF";

  Sketchage.drawingMode = "click";
  Sketchage.mouseIsDown = false;
  Sketchage.altIsDown = false;
  Sketchage.useRandomColor = false;

  Sketchage.gridSize = GRID_SIZE_DEFAULT;
  Sketchage.gridDim = GRID_DIM_DEFAULT;

  var color = "";
  var colorTransparent = COLOR_BG_DEFAULT;
  var colorFG = COLOR_FG_DEFAULT;
  var colorBG = COLOR_BG_DEFAULT;

  var $body = $("body");
  var $container = $("#container");

  // main input event handler
  $body.keydown(function(e) {
    var code = e.which;
    if (code === 18) {
      Sketchage.altIsDown = true;
    }
  });
  $body.keyup(function(e) {
    var code = e.which;
    if (code === 18) {
      Sketchage.altIsDown = false;
    }
  });
  $container.mousedown(function() {
    Sketchage.mouseIsDown = true;
  }).mouseup(function() {
    Sketchage.mouseIsDown = false;
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
      Sketchage.useRandomColor = true;
    } else {
      colorFG = $("#color-picker-fg").css("background-color");
      colorBG = $("#color-picker-bg").css("background-color");
      Sketchage.useRandomColor = false;
    }
  });
  $("#check-clicklessmode").click(function() {
    if ($(this).prop("checked")) {
      Sketchage.drawingMode = 'clickless';
    } else Sketchage.drawingMode = 'click';
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
    if (confirm('Changing the square count will clear the image. Proceed?')) {
      Sketchage.gridSize = $("#text-square-count").val();
      makeGrid();
    }
  });
  $("#button-square-count-default").click(function() {
    if (confirm('Resetting the square count to default will clear the image. Proceed?')) {
      Sketchage.gridSize = GRID_SIZE_DEFAULT;
      $("text-square-count").val(GRID_SIZE_DEFAULT);
      makeGrid();
    }
  });
  $("#text-grid-width").keyup(function(e) {
    var code = e.which;
    if (code === 13) {
      e.preventDefault();
      $("#button-grid-dim-resize").click();
    }
  });
  $("#button-grid-dim-resize").click(function() {
    if (confirm('Changing the grid width will clear the image. Proceed?')) {
      $container.css("width", $("#text-grid-width").val());
      $container.css("height", $("#text-grid-width").val());
      makeGrid();
    }
  });
  $("#button-grid-dim-default").click(function() {
    if (confirm('Resetting the grid width to default will clear the image. Proceed?')) {
      $container.css("width", GRID_DIM_DEFAULT);
      $container.css("height", GRID_DIM_DEFAULT);
      $("#text-grid-width").val(GRID_DIM_DEFAULT);
      makeGrid();
    }
  });
  $("#button-generate-image").click(function() {
    generateImage();
  });
  $("#button-clear-grid").click(function() {
    if (confirm('Are you sure you want to reset the image?')) {
      $('.square').css('background-color', colorTransparent);

      clearLocalStorage();
    }
  });

  function generateImage() {
    $container.css("float", "left");

    $("#generated-images").css({
        "display" : "block",
        "height" : $container.height()
    });

    generateLowResBitmap(5, Sketchage.gridSize);
    //location.href = "#gen-img";
  }

  function draw(square, color) {
    if (Sketchage.altIsDown) {
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
    for(var i = 0; i < Sketchage.gridSize; i++) {
      for(var j = 0; j < Sketchage.gridSize-1; j++){
        $container.append("<div class='square' id='" + j + "_" + i + "'></div>");
      }
      $container.append("<div class='square' id='" + j + "_" + i + "'></div>");
    }

    var containerWidth = $container.width();
    var squareBorder = 1;
    var squareWidth = containerWidth/Sketchage.gridSize - (2 * squareBorder);

    $(".square").css({
      width: squareWidth,
      height: squareWidth,
      background: colorTransparent
    });

    // main draw handler
    $(".square").on("mouseenter mousedown touchend touchmove", function(e) {
      if (Sketchage.useRandomColor) {
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

      if (Sketchage.drawingMode == 'clickless') {
        draw(this, color);
      } else if (Sketchage.mouseIsDown) {
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
  $("#text-square-count").val(Sketchage.gridSize);
  $("#text-grid-width").val(Sketchage.gridDim);

  makeGrid();

  window.onload = loadFromLocalStorage;
});
