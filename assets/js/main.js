$(function() {
  // Sketchage object init
  if ((typeof Sketchage) === 'undefined') var Sketchage = {}

  const SQUARE_COUNT_DEFAULT = 32;
  const GRID_WIDTH_DEFAULT = 640;
  const COLOR_FG_DEFAULT = "#000000";
  const COLOR_BG_DEFAULT = "#FFFFFF";

  Sketchage.drawingMode = "click";
  Sketchage.mouseIsDown = false;
  Sketchage.altIsDown = false;
  Sketchage.useRandomColor = false;

  Sketchage.squareCount = SQUARE_COUNT_DEFAULT;
  Sketchage.gridWidth = GRID_WIDTH_DEFAULT;

  var color = "";
  var colorTransparent = COLOR_BG_DEFAULT;
  var colorFG = COLOR_FG_DEFAULT;
  var colorBG = COLOR_BG_DEFAULT;

  var $body = $("body");
  var $container = $("#container");
  var $genImages = $("#generated-images");

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
      Sketchage.squareCount = $("#text-square-count").val();
      saveToLocalStorage();
      makeGrid();
    }
  });
  $("#button-square-count-default").click(function() {
    if (confirm('Resetting the square count to default will clear the image. Proceed?')) {
      Sketchage.squareCount = SQUARE_COUNT_DEFAULT;
      $("text-square-count").val(SQUARE_COUNT_DEFAULT);
      makeGrid();
    }
  });
  $("#text-grid-width").keyup(function(e) {
    var code = e.which;
    if (code === 13) {
      e.preventDefault();
      $("#button-grid-width-resize").click();
    }
  });
  $("#button-grid-width-resize").click(function() {
    if (confirm('Changing the grid width will clear the image. Proceed?')) {
      $container.css("width", $("#text-grid-width").val());
      $container.css("height", $("#text-grid-width").val());
      saveToLocalStorage();
      makeGrid();
    }
  });
  $("#button-grid-width-default").click(function() {
    if (confirm('Resetting the grid width to default will clear the image. Proceed?')) {
      $container.css("width", GRID_WIDTH_DEFAULT);
      $container.css("height", GRID_WIDTH_DEFAULT);
      $("#text-grid-width").val(GRID_WIDTH_DEFAULT);
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

    $genImages.css({
      "display" : "block",
      "height" : $container.height()
    });

    generateLowResBitmap(5, Sketchage.squareCount);

    $newest_img = $genImages.last().find('img').last();
    $newest_img_src = $newest_img.attr('src');

    $.ajax({
      url: '../../gd_convert.php',
      type: 'post',
      data: { "imageConversion": $newest_img_src },
      success: function(imgPath) {
        // console.log('image path', imgPath);

        $html = `<div class="file-links"><a class="file-link" href="${imgPath}.gif" target="_blank">GIF</a> | <a class="file-link" href="${imgPath}.jpg" target="_blank">JPG</a> | <a class="file-link" href="${imgPath}.png" target="_blank">PNG</a></div>`;

        $newest_img.after($html);
      },
      error: function(error) { console.error('img convert failed', error); }
    });

    $genImages.find('div').find('a.gen-img-x').click(function(event) {
      event.preventDefault()

      if ($genImages.find('div').length == 0) {
        $container.css("float", "none");
        $genImages.css("display", "none");
      }
    });
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
    for(var i = 0; i < Sketchage.squareCount; i++) {
      for(var j = 0; j < Sketchage.squareCount-1; j++){
        $container.append("<div class='square' id='" + j + "_" + i + "'></div>");
      }
      $container.append("<div class='square' id='" + j + "_" + i + "'></div>");
    }

    var containerWidth = $container.width();
    var squareBorder = 1;
    var squareWidth = containerWidth/Sketchage.squareCount - (2 * squareBorder);

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
    let img_data = localStorage.getItem('neb.host.sketchage.image');
    let settings = localStorage.getItem('neb.host.sketchage.settings');

    if (img_data || settings) {
      let load = window.confirm('Previous image/settings data found. Load?');

      if (load) {
        let config = settings.split(';');
        let square_count = config[0].split(':')[1]
        let grid_width = config[1].split(':')[1]

        Sketchage.squareCount = square_count;
        Sketchage.gridWidth = grid_width;

        // set square count and grid width
        $("#text-square-count").val(Sketchage.squareCount);
        $("#text-grid-width").val(Sketchage.gridWidth);

        makeGrid();

        let colors = img_data.split(';');

        colors.forEach(function(c) {
          c = c.split(':');
          $(`#${c[0]}`).css('background-color', c[1]);
        });
      }
    } else {
      // set square count and grid width
      $("#text-square-count").val(Sketchage.squareCount);
      $("#text-grid-width").val(Sketchage.gridWidth);

      makeGrid();
    }
  }
  function saveToLocalStorage() {
    let serial_img = '';

    $(".square").each(function() {
      let id = $(this).attr('id');
      let color = $(this).css('background-color');

      serial_img = serial_img.concat(`${id}:${color};`);
    });

    localStorage.setItem('neb.host.sketchage.image', serial_img);

    let square_count = $("#text-square-count").val();
    let grid_width = $("#text-grid-width").val();

    localStorage.setItem('neb.host.sketchage.settings', `square_count:${square_count};grid_width:${grid_width}`);
  }
  function clearLocalStorage() {

    if (localStorage.getItem('neb.host.sketchage.image')) {
      localStorage.removeItem('neb.host.sketchage.image');
    }
    if (localStorage.getItem('neb.host.sketchage.settings')) {
      localStorage.removeItem('neb.host.sketchage.settings');
    }
  }

  window.onload = loadFromLocalStorage;
});
