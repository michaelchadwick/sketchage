/* main */
/* app entry point and main functions */
/* global $, Sketchage */

Sketchage.settings = {
  "squareCount": SQUARE_COUNT_DEFAULT,
  "gridWidth": GRID_WIDTH_DEFAULT,
  "clicklessMode": false,
  "rainbowMode": false
}

Sketchage.mouseIsDown = false;
Sketchage.altIsDown = false;

Sketchage.color = "";
Sketchage.colorTransparent = COLOR_BG_DEFAULT;
Sketchage.colorFG = COLOR_FG_DEFAULT;
Sketchage.colorBG = COLOR_BG_DEFAULT;

// modal methods
async function modalOpen(type) {
  switch(type) {
    case 'start':
    case 'help':
      this.myModal = new Modal('perm', 'How to Use Sketchage',
        `
          <p><strong>Sketchage</strong> is a super simple grid-based drawing program. Choose a foreground and background color from the picker, and then either left-click (FG) or right-click (BG) on a square, or click and drag around, to fill in the picture. If you want to just drag your mouse without clicking, check the "Clickless drawing" box. Hold the <strong>Alt</strong> key to erase cells instead.</p>

          <p>The number of squares and overall grid width can be adjusted (but it will clear the grid!).</p>

          <p>The "Generate Image" button will save your creation as a BMP that you can right-click to save to your computer.</p>

          <hr />

          <p>Sketchage based on <a href="https://github.com/mixophrygian">mixophrygian</a>'s "<a href="https://github.com/mixophrygian/Etcha-sketch">Etcha-sketch</a></p>
        `,
        null,
        null
      )
      break

    case 'settings':
      this.myModal = new Modal('perm', 'Settings',
        `
          <section id="settings">
            <label for="text-square-count">Square Count</label>
            <input type="number" id="text-square-count" max="128" min="4" value="32" />
            <button id="button-square-count-recreate" class="button-img">&check;</button>
            <button id="button-square-count-default" class="button-text">Default</button>

            <label for="text-grid-width">Grid Width</label>
            <input type="number" id="text-grid-width" value="640" />
            <button id="button-grid-width-resize" class="button-img">&check;</button>
            <button id="button-grid-width-default" class="button-text">Default</button>

            <!-- clickless mode -->
            <div class="setting-row">
              <div class="text">
                <div class="title">Clickless Mode</div>
                <div class="description">Draw without having to hold the mouse button down</div>
              </div>
              <div class="control">
                <div class="container">
                  <div id="button-setting-clickless-mode" data-status="" class="switch" onclick="Sketchage.changeSetting('clicklessMode')">
                    <span class="knob"></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- rainbow mode -->
            <div class="setting-row">
              <div class="text">
                <div class="title">Rainbow Mode</div>
                <div class="description">Draw with a pencil that uses a random color for each square</div>
              </div>
              <div class="control">
                <div class="container">
                  <div id="button-setting-rainbow-mode" data-status="" class="switch" onclick="Sketchage.changeSetting('rainbowMode')">
                    <span class="knob"></span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        `,
        null,
        null
      )

      Sketchage.loadGlobalSettings()

      break
  }
}

Sketchage.initApp = function() {
  // set env
  Sketchage.env = ENV_PROD_URL.includes(document.location.hostname) ? 'prod' : 'local'

  // if local dev, show debug stuff
  if (Sketchage.env == 'local') {
    document.title = '(LH) ' + document.title
  }

  Sketchage.loadFromLocalStorage()

  Sketchage.loadGlobalSettings()

  Sketchage.attachEventListeners()
}

Sketchage.loadGlobalSettings = function() {
  if (localStorage.getItem(SKETCHAGE_SETTINGS_KEY)) {
    var lsConfig = JSON.parse(localStorage.getItem(SKETCHAGE_SETTINGS_KEY))

    if (lsConfig) {
      if (lsConfig.clicklessMode) {
        Sketchage.settings.clicklessMode = lsConfig.clicklessMode

        var setting = document.getElementById('button-setting-clickless-mode')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }

      if (lsConfig.rainbowMode) {
        Sketchage.settings.rainbowMode = lsConfig.rainbowMode

        var setting = document.getElementById('button-setting-rainbow-mode')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }
    }
  } else {
    Sketchage.settings.clicklessMode = false
    Sketchage.settings.rainbowMode = false
  }
}

Sketchage.attachEventListeners = function() {
  // main input event handlers
  Sketchage.dom.body.keydown(function(e) {
    var code = e.which;
    if (code === 18) {
      Sketchage.altIsDown = true;
    }
  });
  Sketchage.dom.body.keyup(function(e) {
    var code = e.which;
    if (code === 18) {
      Sketchage.altIsDown = false;
    }
  });
  Sketchage.dom.container.mousedown(function() {
    Sketchage.mouseIsDown = true;
  }).mouseup(function() {
    Sketchage.mouseIsDown = false;
  });

  // disallow right-clicking on canvas
  Sketchage.dom.container.bind('contextmenu', function(e) {
    e.preventDefault();
  });

  // attach event handlers to header buttons
  Sketchage.dom.interactive.btnNav.click(() => {
    Sketchage.dom.navOverlay.toggleClass('show')
  })
  Sketchage.dom.interactive.btnNavClose.click(() => {
    Sketchage.dom.navOverlay.toggleClass('show')
  })
  Sketchage.dom.interactive.btnHelp.click(() => modalOpen('help'))
  Sketchage.dom.interactive.btnSettings.click(() => modalOpen('settings'))

  // attach event handlers to color radio options
  $("#color-picker-fg").change(function() {
    Sketchage.colorFG = this.jscolor.toHEXString();
    $("#check-rainbow").prop("checked", false);
  });
  $("#color-picker-bg").change(function() {
    Sketchage.colorBG = this.jscolor.toHEXString();
    $("#check-rainbow").prop("checked", false);
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
      Sketchage.saveToLocalStorage();
      Sketchage.makeGrid();
    }
  });
  $("#button-square-count-default").click(function() {
    if (confirm('Resetting the square count to default will clear the image. Proceed?')) {
      Sketchage.squareCount = SQUARE_COUNT_DEFAULT;
      $("text-square-count").val(SQUARE_COUNT_DEFAULT);
      Sketchage.makeGrid();
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
      Sketchage.dom.container.css("width", $("#text-grid-width").val());
      Sketchage.dom.container.css("height", $("#text-grid-width").val());
      Sketchage.saveToLocalStorage();
      Sketchage.makeGrid();
    }
  });
  $("#button-grid-width-default").click(function() {
    if (confirm('Resetting the grid width to default will clear the image. Proceed?')) {
      Sketchage.dom.container.css("width", GRID_WIDTH_DEFAULT);
      Sketchage.dom.container.css("height", GRID_WIDTH_DEFAULT);
      $("#text-grid-width").val(GRID_WIDTH_DEFAULT);
      Sketchage.makeGrid();
    }
  });
  $("#button-generate-image").click(function() {
    Sketchage.generateImage();
  });
  $("#button-clear-grid").click(function() {
    if (confirm('Are you sure you want to reset the image?')) {
      $('.square').css('background-color', Sketchage.colorTransparent);

      Sketchage.clearLocalStorage();
    }
  });

  // handle both clicks and touches outside of modals
  Sketchage.handleClickTouch = function(event) {
    var dialog = document.getElementsByClassName('modal-dialog')[0]

    if (dialog) {
      var isConfirm = dialog.classList.contains('modal-confirm')

      // only close if not a confirmation!
      if (event.target == dialog && !isConfirm) {
        dialog.remove()
      }
    }

    if (event.target == Sketchage.dom.navOverlay) {
      Sketchage.dom.navOverlay.classList.toggle('show')
    }
  }
}

Sketchage.changeSetting = function(setting) {
  switch (setting) {
    case 'clicklessMode':
      var st = document.getElementById('button-setting-clickless-mode').dataset.status

      if (st == '' || st == 'false') {
        document.getElementById('button-setting-clickless-mode').dataset.status = 'true'

        Sketchage.settings.clicklessMode = true;

        Sketchage.saveGlobalSetting('clicklessMode', true)
      } else {
        document.getElementById('button-setting-clickless-mode').dataset.status = 'false'

        Sketchage.settings.clicklessMode = false;

        Sketchage.saveGlobalSetting('clicklessMode', false)
      }

      break

    case 'rainbowMode':
      var st = document.getElementById('button-setting-rainbow-mode').dataset.status

      if (st == '' || st == 'false') {
        document.getElementById('button-setting-rainbow-mode').dataset.status = 'true'

        Sketchage.settings.rainbowMode = true;
        Sketchage.colorFG = $("#color-picker-fg").css("background-color");
        Sketchage.colorBG = $("#color-picker-bg").css("background-color");

        Sketchage.saveGlobalSetting('rainbowMode', true)
      } else {
        document.getElementById('button-setting-rainbow-mode').dataset.status = 'false'

        Sketchage.settings.rainbowMode = false;

        Sketchage.saveGlobalSetting('rainbowMode', false)
      }

      break

  }
}
Sketchage.saveGlobalSetting = function(setting, value) {
  // console.log('saving setting to LS...', setting, value)

  var settings = JSON.parse(localStorage.getItem(SKETCHAGE_SETTINGS_KEY))

  if (settings) {
    // set temp obj that will go to LS
    settings[setting] = value
    // set internal code model
    Sketchage.settings[setting] = value

    localStorage.setItem(SKETCHAGE_SETTINGS_KEY, JSON.stringify(settings))
  }

  // console.log('!global setting saved!', this.bogdle.settings)
}

// drawing functions
Sketchage.generateImage = function() {
  Sketchage.dom.container.css("float", "left");

  Sketchage.dom.genImages.css({
    "display" : "block",
    "height" : Sketchage.dom.container.height()
  });

  generateLowResBitmap(5, Sketchage.squareCount);

  $newest_img = Sketchage.dom.genImages.last().find('img').last();
  $newest_img_src = $newest_img.attr('src');

  $.ajax({
    url: 'assets/scripts/gd_convert.php',
    type: 'post',
    data: { "imageConversion": $newest_img_src },
    success: function(imgPath) {
      // console.log('image path', imgPath);

      $html = `
        <div class="file-links">
          <a class="file-link" href="${imgPath}.gif" target="_blank">GIF</a> | <a class="file-link" href="${imgPath}.jpg" target="_blank">JPG</a> | <a class="file-link" href="${imgPath}.png" target="_blank">PNG</a>
        </div>
      `;

      $newest_img.after($html);
    },
    error: function(error) { console.error('img convert failed', error); }
  });

  Sketchage.dom.genImages.find('div').find('a.gen-img-x').click(function(event) {
    event.preventDefault()

    if (Sketchage.dom.genImages.find('div').length == 0) {
      Sketchage.dom.container.css("float", "none");
      Sketchage.dom.genImages.css("display", "none");
    }
  });
}
Sketchage.draw = function(square, color) {
  if (Sketchage.altIsDown) {
    $(square).css("background-color", Sketchage.colorTransparent);
  }
  else {
    $(square).css("background-color", color);
    Sketchage.saveToLocalStorage();
  }
}

// helper utility
Sketchage.getRandomColor = function() {
  return "#" + Math.floor(Math.random()*16777215).toString(16);
}

// grid makers
Sketchage.makeGrid = function() {
  // console.log('making new grid');

  // remove any existing squares
  $("#container .square").remove();
  // remove generated image
  $("#gen-img").remove();

  // create squares
  for(var i = 0; i < Sketchage.settings.squareCount; i++) {
    for(var j = 0; j < Sketchage.settings.squareCount-1; j++) {
      Sketchage.dom.container.append("<div class='square' id='" + j + "_" + i + "'></div>");
    }
    Sketchage.dom.container.append("<div class='square' id='" + j + "_" + i + "'></div>");
  }

  var containerWidth = Sketchage.dom.container.width();
  var squareBorder = 1;
  var squareWidth = containerWidth/Sketchage.settings.squareCount - (2 * squareBorder);

  $(".square").css({
    width: squareWidth,
    height: squareWidth,
    background: Sketchage.colorTransparent
  });

  // main draw handler
  $(".square").on("mouseenter mousedown touchend touchmove", function(e) {
    if (Sketchage.settings.rainbowMode) {
      Sketchage.colorFG = Sketchage.getRandomColor();
      Sketchage.colorBG = Sketchage.getRandomColor();
    }

    // choose Sketchage.color based on mouse button
    switch (e.which) {
      case 1:
        e.preventDefault();
        Sketchage.color = Sketchage.colorFG;
        break;
      case 3:
        e.preventDefault();
        Sketchage.color = Sketchage.colorBG;
        break;
      default:
      Sketchage.color = Sketchage.colorFG;
    }

    if (Sketchage.settings.clicklessMode) {
      Sketchage.draw(this, Sketchage.color);
    } else if (Sketchage.mouseIsDown) {
      Sketchage.draw(this, Sketchage.color);
    } else {
      $(this).mousedown(function() {
        Sketchage.draw(this, Sketchage.color);
      });
    }
  });
}

// local storage functions
Sketchage.loadFromLocalStorage = function() {
  let lsSettings = JSON.parse(localStorage.getItem(SKETCHAGE_SETTINGS_KEY));

  if (lsSettings) {
    Sketchage.settings.squareCount = lsSettings.squareCount;
    Sketchage.settings.gridWidth = lsSettings.gridWidth;
    Sketchage.settings.clicklessMode = lsSettings.clicklessMode;
    Sketchage.settings.rainbowMode = lsSettings.rainbowMode;
  }

  let lsImgData = localStorage.getItem(SKETCHAGE_IMAGE_DATA_KEY);

  if (lsImgData) {
    let load = window.confirm('Previous image/settings data found. Load?');

    if (load) {
      console.log('user chose to load previous data, so creating grid and then updating');

      Sketchage.makeGrid();

      let colors = lsImgData.split(';');

      colors.forEach(function(c) {
        c = c.split(':');
        $(`#${c[0]}`).css('background-color', c[1]);
      });
    } else {
      console.log('user declined loading previous data, so creating grid with defaults');

      Sketchage.makeGrid();
    }
  } else {
    console.log('no local storage, so creating grid with defaults');

    Sketchage.makeGrid();
  }
}
Sketchage.saveToLocalStorage = function() {
  let serial_img = '';

  $(".square").each(function() {
    let id = $(this).attr('id');
    let color = $(this).css('background-color');

    serial_img = serial_img.concat(`${id}:${color};`);
  });

  localStorage.setItem(SKETCHAGE_IMAGE_DATA_KEY, serial_img);

  let newLS = {
    "squareCount": Sketchage.settings.squareCount,
    "gridWidth": Sketchage.settings.gridWidth,
    "clicklessMode": Sketchage.settings.clicklessMode,
    "rainbowMode": Sketchage.settings.rainbowMode
  }

  localStorage.setItem(SKETCHAGE_SETTINGS_KEY, JSON.stringify(newLS));
}
Sketchage.clearLocalStorage = function() {
  if (localStorage.getItem(SKETCHAGE_IMAGE_DATA_KEY)) {
    localStorage.removeItem(SKETCHAGE_IMAGE_DATA_KEY);
  }
  if (localStorage.getItem(SKETCHAGE_SETTINGS_KEY)) {
    localStorage.removeItem(SKETCHAGE_SETTINGS_KEY);
  }
}

// When the user clicks or touches anywhere outside of the modal, close it
window.addEventListener('click', Sketchage.handleClickTouch)
window.addEventListener('touchend', Sketchage.handleClickTouch)

/* ===================================================== */

// start the engine
Sketchage.initApp()
