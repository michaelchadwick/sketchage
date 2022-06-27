/* main */
/* app entry point and main functions */
/* global $, Sketchage */

// settings: saved in LOCAL STORAGE
Sketchage.settings = {
  "squareCount": SQUARE_COUNT_DEFAULT,
  "gridWidth": GRID_WIDTH_DEFAULT,
  "clicklessMode": false,
  "rainbowMode": false,
  "showRulers": false
}

// config: only saved while game is loaded
Sketchage.config = {
  "mouseIsDown": false,
  "altIsDown": false, // erase
  "ctrlIsDown": false, // eyedropper
  "shiftIsDown": false, // paint bucket
  "color": "",
  // TODO: actually make this transparent somehow (for PNG)
  "colorTransparent": COLOR_BG_DEFAULT,
  "colorFG": COLOR_FG_DEFAULT,
  "colorBG": COLOR_BG_DEFAULT
}

/*************************************************************************
 * public methods *
 *************************************************************************/

// modal methods
async function modalOpen(type) {
  switch(type) {
    case 'start':
    case 'help':
      this.myModal = new Modal('perm', 'How to Use Sketchage',
        `
          <p><strong>Sketchage</strong> is a super simple grid-based drawing program. Choose a foreground and background color from the picker, and then either left-click (FG) or right-click (BG) on a square, or click and drag around, to fill in the picture. If you want to just drag your mouse without clicking, check the "Clickless drawing" box. Hold the <strong>Alt</strong> key to erase cells instead.</p>

          <p>The number of squares and overall grid width can be adjusted (but it will clear the grid!).</p>

          <p>The "Save Image" button will save your creation as a BMP (w/ GIF, JPG, and PNG options, too) that you can right-click to save to your computer.</p>

          <hr />

          <div>Sketchage based on <a href="https://github.com/mixophrygian">mixophrygian</a>'s "<a href="https://github.com/mixophrygian/Etcha-sketch">Etcha-sketch</a>".</div>
        `,
        null,
        null
      )
      break

    case 'settings':
      this.myModal = new Modal('perm', 'Settings',
        `
          <section id="settings">

            <!-- square count -->
            <div class="setting-row">
              <div class="text">
                <div class="title">Square Count</div>
                <div class="description">Grid squares per row. Must be even.</div>
              </div>
              <div class="control">
                <div class="container wide">
                  <input type="number" id="text-square-count" max="128" min="4" step="2" value="32" onchange="Sketchage._changeSetting('squareCount')" onkeyup="Sketchage._changeSetting('squareCount', event)" />
                  <button id="button-square-count-recreate" onclick="Sketchage._changeSetting('squareCountResize')">
                    <i class="fas fa-check"></i>
                  </button>
                  <button id="button-square-count-default" title="Reset to default"onclick="Sketchage._changeSetting('squareCountDefault')">
                    <i class="fas fa-rotate-left"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- grid width -->
            <div class="setting-row">
              <div class="text">
                <div class="title">Grid Width</div>
                <div class="description">Grid width, in pixels</div>
              </div>
              <div class="control">
                <div class="container wide">
                  <input type="number" id="text-grid-width" value="640" onchange="Sketchage._changeSetting('gridWidth')" onkeyup="Sketchage._changeSetting('gridWidth', event)"/>
                  <button id="button-grid-width-resize" onclick="Sketchage._changeSetting('gridWidthResize')">
                    <i class="fas fa-check"></i>
                  </button>
                  <button id="button-grid-width-default" title="Reset to default" onclick="Sketchage._changeSetting('gridWidthDefault')">
                    <i class="fas fa-rotate-left"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- clickless mode -->
            <div class="setting-row">
              <div class="text">
                <div class="title">Clickless Mode</div>
                <div class="description">Draw without having to hold the mouse button down</div>
              </div>
              <div class="control">
                <div class="container">
                  <div id="button-setting-clickless-mode" data-status="" class="switch" onclick="Sketchage._changeSetting('clicklessMode')">
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
                  <div id="button-setting-rainbow-mode" data-status="" class="switch" onclick="Sketchage._changeSetting('rainbowMode')">
                    <span class="knob"></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- show ruler -->
            <div class="setting-row">
              <div class="text">
                <div class="title">Show Rulers</div>
                <div class="description">Experimental: show pixel rulers</div>
              </div>
              <div class="control">
                <div class="container">
                  <div id="button-setting-show-rulers" data-status="" class="switch" onclick="Sketchage._changeSetting('showRulers')">
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

      Sketchage._loadSettings()

      break
  }
}

Sketchage.initApp = function() {
  // set env
  Sketchage.env = SKETCHAGE_ENV_PROD_URL.includes(document.location.hostname) ? 'prod' : 'local'

  // if local dev, show debug stuff
  if (Sketchage.env == 'local') {
    document.title = '(LH) ' + document.title
  }

  Sketchage._loadFromLocalStorage()

  Sketchage._loadSettings()

  Sketchage._attachEventListeners()
}

/*************************************************************************
 * _private methods *
 *************************************************************************/

Sketchage._loadSettings = function() {
  var lsSettings = JSON.parse(localStorage.getItem(SKETCHAGE_SETTINGS_KEY))

  if (lsSettings) {
    if (lsSettings.squareCount) {
      Sketchage.settings.squareCount = lsSettings.squareCount

      var setting = document.getElementById('text-square-count')

      if (setting) {
        setting.value = lsSettings.squareCount
      }
    }

    if (lsSettings.gridWidth) {
      Sketchage.settings.gridWidth = lsSettings.gridWidth

      var setting = document.getElementById('text-grid-width')

      if (setting) {
        setting.value = lsSettings.gridWidth
      }
    }

    if (lsSettings.clicklessMode) {
      Sketchage.settings.clicklessMode = lsSettings.clicklessMode

      var setting = document.getElementById('button-setting-clickless-mode')

      if (setting) {
        setting.dataset.status = 'true'
      }
    }

    if (lsSettings.rainbowMode) {
      Sketchage.settings.rainbowMode = lsSettings.rainbowMode

      var setting = document.getElementById('button-setting-rainbow-mode')

      if (setting) {
        setting.dataset.status = 'true'
      }
    }

    if (lsSettings.showRulers) {
      Sketchage._enableRulers()
    }
  }
}
Sketchage._changeSetting = function(setting, event = null) {
  switch (setting) {
    case 'squareCount':
      var settingVal = document.getElementById('text-square-count').value

      if (settingVal != '') {
        // save to code/LS
        Sketchage._saveSetting('squareCount', settingVal)
      }

      if (event && event.which === 13) {
        event.preventDefault()
        $("#button-square-count-recreate").click()
      }
      break

    case 'squareCountResize':
      if (confirm('Changing the square count will clear the image. Proceed?')) {
        var settingVal = document.getElementById('text-square-count').value

        if (settingVal != '') {
          // save to code/LS
          Sketchage._saveSetting('squareCount', settingVal)

          // remake grid
          Sketchage._makeGrid()
        }
      }
      break

    case 'squareCountDefault':
      if (confirm('Resetting the square count to default will clear the image. Proceed?')) {
        // update container DOM
        Sketchage.settings.squareCount = SQUARE_COUNT_DEFAULT
        Sketchage.settings.squareCount = SQUARE_COUNT_DEFAULT

        // update setting DOM
        $("text-square-count").val(SQUARE_COUNT_DEFAULT)

        // save to code/LS
        Sketchage._saveSetting('squareCount', settingVal)

        // remake grid
        Sketchage._makeGrid()
      }
      break

    case 'gridWidth':
      var settingVal = document.getElementById('text-grid-width').value

      if (settingVal != '') {
        // save to code/LS
        Sketchage._saveSetting('gridWidth', settingVal)
      }

      if (event && event.which === 13) {
        event.preventDefault()
        $("#button-grid-width-resize").click()
      }
      break

    case 'gridWidthResize':
      if (confirm('Changing the grid width will clear the image. Proceed?')) {
        var settingVal = document.getElementById('text-grid-width').value

        if (settingVal != '') {
          // update container DOM
          Sketchage.dom.gridInner.css("width", settingVal)
          Sketchage.dom.gridInner.css("height", settingVal)

          // save to code/LS
          Sketchage._saveSetting('gridWidth', settingVal)

          // remake grid
          Sketchage._makeGrid()
        }
      }
      break

    case 'gridWidthDefault':
      if (confirm('Resetting the grid width to default will clear the image. Proceed?')) {
        // update container DOM
        Sketchage.dom.gridInner.css("width", GRID_WIDTH_DEFAULT)
        Sketchage.dom.gridInner.css("height", GRID_WIDTH_DEFAULT)

        // update setting DOM
        $("#text-grid-width").val(GRID_WIDTH_DEFAULT)

        // save to code/LS
        Sketchage._saveSetting('gridWidth', GRID_WIDTH_DEFAULT)

        // remake grid
        Sketchage._makeGrid()
      }
      break

    case 'clicklessMode':
      var st = document.getElementById('button-setting-clickless-mode')

      if (st) {
        st = st.dataset.status

        if (st == '' || st == 'false') {
          // update setting DOM
          document.getElementById('button-setting-clickless-mode').dataset.status = 'true'

          // save to code/LS
          Sketchage._saveSetting('clicklessMode', true)
        } else {
          // update setting DOM
          document.getElementById('button-setting-clickless-mode').dataset.status = 'false'

          // save to code/LS
          Sketchage._saveSetting('clicklessMode', false)
        }
      }
      break

    case 'rainbowMode':
      var st = document.getElementById('button-setting-rainbow-mode')

      if (st) {
        st = st.dataset.status

        if (st == '' || st == 'false') {
          // update setting DOM
          document.getElementById('button-setting-rainbow-mode').dataset.status = 'true'

          // update color DOM
          Sketchage.config.colorFG = $("#color-picker-fg").css('background-color')
          Sketchage.config.colorBG = $("#color-picker-bg").css('background-color')

          // save to code/LS
          Sketchage._saveSetting('rainbowMode', true)
        } else {
          // update setting DOM
          document.getElementById('button-setting-rainbow-mode').dataset.status = 'false'

          // save to code/LS
          Sketchage._saveSetting('rainbowMode', false)
        }
      }
      break

    case 'showRulers':
      var st = document.getElementById('button-setting-show-rulers')

      if (st) {
        st = st.dataset.status

        if (st == '' || st == 'false') {
          // update setting DOM
          document.getElementById('button-setting-show-rulers').dataset.status = 'true'

          Sketchage._enableRulers()

          // save to code/LS
          Sketchage._saveSetting('showRulers', true)
        } else {
          // update setting DOM
          document.getElementById('button-setting-show-rulers').dataset.status = 'false'

          Sketchage._disableRulers()

          // save to code/LS
          Sketchage._saveSetting('showRulers', false)
        }
      }
      break
  }
}
Sketchage._saveSetting = function(setting, value) {
  // console.log('saving setting to LS...', setting, value)

  var settings = JSON.parse(localStorage.getItem(SKETCHAGE_SETTINGS_KEY))

  if (settings) {
    // set internal code model
    Sketchage.settings[setting] = value

    // set temp obj that will go to LS
    settings[setting] = value

    // save all settings to LS
    localStorage.setItem(SKETCHAGE_SETTINGS_KEY, JSON.stringify(settings))
  }

  // console.log('!global setting saved!', Sketchage.settings)
}

Sketchage._attachEventListeners = function() {
  // main input event handlers
  Sketchage.dom.body.keydown(function(e) {
    var code = e.which
    if (code === 18) {
      Sketchage.config.altHeld = true
    }
  })
  Sketchage.dom.body.keyup(function(e) {
    var code = e.which
    if (code === 18) {
      Sketchage.config.altHeld = false
    }
  })
  Sketchage.dom.gridInner.mousedown(function() {
    Sketchage.config.mouseIsDown = true
  }).mouseup(function() {
    Sketchage.config.mouseIsDown = false
  })

  // disallow right-clicking on canvas
  Sketchage.dom.gridInner.bind('contextmenu', function(e) {
    e.preventDefault()
  })

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
  Sketchage.dom.interactive.colorFG.change(function() {
    Sketchage.config.colorFG = this.jscolor.toHEXString()
    Sketchage._changeSetting('rainbowMode', false)
  })
  Sketchage.dom.interactive.colorBG.change(function() {
    Sketchage.config.colorBG = this.jscolor.toHEXString()
    Sketchage._changeSetting('rainbowMode', false)
  })

  Sketchage.dom.interactive.btnGenImage.click(function() {
    Sketchage._generateImage()
  })
  Sketchage.dom.interactive.btnClearGrid.click(function() {
    if (confirm('Are you sure you want to reset the image?')) {
      $('.square').css('background-color', Sketchage.config.colorTransparent)

      Sketchage._clearLocalStorage()
    }
  })

  // gotta use keydown, not keypress, or else Delete/Backspace aren't recognized
  document.addEventListener('keydown', (event) => {
    var modKeys = ['Alt', 'Control', 'Meta', 'Shift']

    if (modKeys.some(key => event.getModifierState(key))) {
      // console.log('a modifier key is being held', event.key)

      switch (event.key) {
        case 'Control':
          $('.square').addClass('eyedropper')
          Sketchage.config.ctrlHeld = true
          break
        case 'Shift':
          $('.square').addClass('paintbucket')
          Sketchage.config.shiftHeld = true
          break

      }
    }
  })
  document.addEventListener('keyup', (event) => {
    $('.square').removeClass('eyedropper')
    $('.square').removeClass('paintbucket')
    Sketchage.config.ctrlHeld = false
    Sketchage.config.shiftHeld = false
  })

  // When the user clicks or touches anywhere outside of the modal, close it
  window.addEventListener('click', Sketchage._handleClickTouch)
  window.addEventListener('touchend', Sketchage._handleClickTouch)

  window.addEventListener('resize', Sketchage._resizeRulerBackground)
}

// handle both clicks and touches outside of modals
Sketchage._handleClickTouch = function(event) {
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

Sketchage._enableRulers = function() {
  // show background-image (ruler ticks)
  Sketchage.dom.body.css('background-image', 'linear-gradient(90deg, var(--ruler1-c) 0 var(--ruler1-bdw), transparent 0), linear-gradient(90deg, var(--ruler2-c) 0 var(--ruler2-bdw), transparent 0), linear-gradient(0deg, var(--ruler1-c) 0 var(--ruler1-bdw), transparent 0), linear-gradient(0deg, var(--ruler2-c) 0 var(--ruler2-bdw), transparent 0)')
  // show ruler numbers
  Sketchage.dom.rulerX.css('display', 'flex')
  Sketchage.dom.rulerY.css('display', 'flex')
}
Sketchage._disableRulers = function() {
  // hide background-image (ruler ticks)
  Sketchage.dom.body.css('background-image', 'none')
  // hide ruler numbers
  Sketchage.dom.rulerX.css('display', 'none')
  Sketchage.dom.rulerY.css('display', 'none')
}

// drawing functions
Sketchage._generateImage = function() {
  Sketchage.dom.gridInner.css("float", "left")

  Sketchage.dom.genImageContainer.css({
    "display" : "block",
    "height" : Sketchage.dom.gridInner.height()
  })

  generateLowResBitmap(5, Sketchage.settings.squareCount)

  $newest_img = Sketchage.dom.genImageContainer.last().find('img').last()
  $newest_img_src = $newest_img.attr('src')

  $.ajax({
    url: 'assets/scripts/gd_convert.php',
    type: 'post',
    data: { "imageConversion": $newest_img_src },
    success: function(imgPath) {
      // console.log('image path', imgPath)

      $html = `
        <div class="file-links">
          <a class="file-link" href="${imgPath}.gif" target="_blank">GIF</a> | <a class="file-link" href="${imgPath}.jpg" target="_blank">JPG</a> | <a class="file-link" href="${imgPath}.png" target="_blank">PNG</a>
        </div>
      `

      $newest_img.after($html)
    },
    error: function(error) {
      console.error('img convert failed', error)
    }
  })

  Sketchage.dom.genImages.find('div').find('a.gen-img-x').click(function(event) {
    event.preventDefault()

    if (Sketchage.dom.genImages.find('div').length == 0) {
      Sketchage.dom.gridInner.css("float", "none")
      Sketchage.dom.genImages.css("display", "none")
    }
  })
}
Sketchage._draw = function(square, color) {
  if (Sketchage.config.altHeld) {
    // erase color back to transparent (this is just BG color right now)
    $(square).css('background-color', Sketchage.config.colorTransparent)
  }
  else if (Sketchage.config.ctrlHeld) {
    // change FG color to whatever color the square is
    const squareColor = $(square).css('background-color')
    document.querySelector('#color-picker-fg').jscolor.fromString(squareColor)
  }
  else if (Sketchage.config.shiftHeld) {
    // TODO: paint bucket

    Sketchage.__floodFill(square, color)
  }
  else {
    $(square).css('background-color', color)
  }

  Sketchage._saveToLocalStorage()
}

// helper utility
Sketchage._getRandomColor = function() {
  return "#" + Math.floor(Math.random()*16777215).toString(16)
}

// make grid of squares and adjust ruler
Sketchage._makeGrid = function() {
  // remove any existing squares
  Sketchage.dom.gridInner.find('.square').remove()
  // remove generated images
  Sketchage.dom.genImages.remove()

  // create squares
  for (var i = 0; i < Sketchage.settings.squareCount; i++) {
    for (var j = 0; j < Sketchage.settings.squareCount-1; j++) {
      Sketchage.dom.gridInner.append("<div class='square' id='" + j + "_" + i + "'></div>")
    }

    Sketchage.dom.gridInner.append("<div class='square' id='" + j + "_" + i + "'></div>")
  }

  var squareBorder = 1
  var squareWidth = (Sketchage.settings.gridWidth / Sketchage.settings.squareCount) - (2 * squareBorder)

  Sketchage.dom.gridInner.css({
    gridTemplateColumns: `repeat(${Sketchage.settings.squareCount}, 1fr)`,
    height: Sketchage.settings.gridWidth,
    width: Sketchage.settings.gridWidth
  })

  // color in each square
  $(".square").css({
    backgroundColor: Sketchage.config.colorTransparent,
    height: squareWidth,
    width: squareWidth
  })

  // attach draw event handler
  $(".square").on("mouseenter mousedown touchend touchmove", function(e) {
    if (Sketchage.settings.rainbowMode) {
      Sketchage.config.colorFG = Sketchage._getRandomColor()
      Sketchage.config.colorBG = Sketchage._getRandomColor()
    }

    e.preventDefault()

    // choose Sketchage.config.color based on mouse button
    switch (e.which) {
      case 1: Sketchage.config.color = Sketchage.config.colorFG; break
      case 3: Sketchage.config.color = Sketchage.config.colorBG; break
      default: Sketchage.config.color = Sketchage.config.colorFG; break
    }

    if (Sketchage.settings.clicklessMode) {
      Sketchage._draw(this, Sketchage.config.color)
    } else if (Sketchage.config.mouseIsDown) {
      Sketchage._draw(this, Sketchage.config.color)
    } else {
      $(this).mousedown(function() {
        Sketchage._draw(this, Sketchage.config.color)
      })
    }
  })

  Sketchage._resizeRulerBackground()
}

Sketchage._resizeRulerBackground = function() {
  var clientW = document.documentElement.clientWidth
  var headerHeight = 121
  var adjustRulerXLeft = ((clientW - Sketchage.settings.gridWidth) / 2) - 1
  var adjustRulerXTop = headerHeight
  var adjustRulerYLeft = ((clientW - Sketchage.settings.gridWidth) / 2) - 20
  var adjustRulerYTop = headerHeight

  $(".ruler-x").transition({
    x: adjustRulerXLeft,
    y: adjustRulerXTop,
    width: `${Sketchage.settings.gridWidth}px`,
    duration: 0
  })

  $(".ruler-y").transition({
    height: `${Sketchage.settings.gridWidth}px`,
    x: adjustRulerYLeft,
    y: adjustRulerYTop,
    duration: 0
  })

  $("body").css('background-position', `${adjustRulerXLeft + 1}px ${adjustRulerXTop}px`)
}

// local storage functions
Sketchage._loadFromLocalStorage = function() {
  let lsSettings = JSON.parse(localStorage.getItem(SKETCHAGE_SETTINGS_KEY))

  if (lsSettings) {
    Sketchage.settings = lsSettings
  } else {
    Sketchage._saveToLocalStorage()
  }

  let lsImgData = localStorage.getItem(SKETCHAGE_IMAGE_DATA_KEY)

  if (lsImgData) {
    let load = window.confirm('Previous image/settings data found. Load?')

    if (load) {
      // console.log('user chose to load previous data, so creating grid and then updating')

      Sketchage._makeGrid()

      let colors = lsImgData.split(';')
      let id = ''
      let color = ''

      colors.forEach(function(c) {
        c = c.split(':')
        id = `#${c[0]}`
        color = c[1]
        $(id).css('background-color', color)
      })
    } else {
      // console.log('user declined loading previous data, so creating grid with defaults')

      Sketchage._makeGrid()
    }
  } else {
    // console.log('no local storage, so creating grid with defaults')

    Sketchage._makeGrid()
  }
}
Sketchage._saveToLocalStorage = function() {
  let serial_img = ''

  $(".square").each(function() {
    let id = $(this).attr('id')
    let color = $(this).css('background-color')

    serial_img = serial_img.concat(`${id}:${color};`)
  })

  localStorage.setItem(SKETCHAGE_IMAGE_DATA_KEY, serial_img)
  localStorage.setItem(SKETCHAGE_SETTINGS_KEY, JSON.stringify(Sketchage.settings))
}
Sketchage._clearLocalStorage = function() {
  if (localStorage.getItem(SKETCHAGE_IMAGE_DATA_KEY)) {
    localStorage.removeItem(SKETCHAGE_IMAGE_DATA_KEY)
  }
  if (localStorage.getItem(SKETCHAGE_SETTINGS_KEY)) {
    localStorage.removeItem(SKETCHAGE_SETTINGS_KEY)
  }
}

/*************************************************************************
 * _private __helper methods *
 *************************************************************************/

Sketchage.__floodFill = function(square, newColor) {
  // grab reference to current square and its background-color
  const squareId = $(square).attr('id').split('_')
  const squareX = parseInt(squareId[0])
  const squareY = parseInt(squareId[1])

  // make sure it's a
  let prevColor = $(square).css('background-color')
  let prevColorHex = prevColor.split('(')[1].split(')')[0].split(',')
  prevColorHex = Sketchage.__rgbToHex(prevColorHex[0].trim(), prevColorHex[1].trim(), prevColorHex[2].trim())

  // console.log(`changing '${prevColorHex}' to '${newColor}'`)

  if (newColor.toLowerCase() == prevColorHex.toLowerCase()) {
    // console.log('prevColor is same as newColor, so doing nothing')
    return
  }

  // change square color to FG/BG color
  // recurse over nearby squares, too
  Sketchage.__floodFillUtil(squareX, squareY, prevColor, newColor)
}
Sketchage.__floodFillUtil = function(squareX, squareY, prevColor, newColor) {
  const square = `#${squareX}_${squareY}`

  // if we have traveled outside the bounds of the grid, exit
  if (squareX < 0 || squareX >= Sketchage.config.squareCount
    || squareY < 0 || squareY >= Sketchage.config.squareCount) {
      return
  }
  // if the next square we check isn't the same color as the OG, exit
  if ($(square).css('background-color') !== prevColor) return

  // replace the color at current square
  $(square).css('background-color', newColor)

  // recurse for N, E, S, W
  Sketchage.__floodFillUtil(squareX, squareY + 1, prevColor, newColor)
  Sketchage.__floodFillUtil(squareX + 1, squareY, prevColor, newColor)
  Sketchage.__floodFillUtil(squareX, squareY - 1, prevColor, newColor)
  Sketchage.__floodFillUtil(squareX - 1, squareY, prevColor, newColor)
}
Sketchage.__colorToHex = function(color) {
  var hexadecimal = parseInt(color).toString(16);
  return hexadecimal.length == 1 ? "0" + hexadecimal : hexadecimal;
}
Sketchage.__rgbToHex = function(r, g, b) {
  return "#" + Sketchage.__colorToHex(r) + Sketchage.__colorToHex(g) + Sketchage.__colorToHex(b);
}

/* ******************************** *
 * START THE ENGINE                 *
 * ******************************** */

window.onload = Sketchage.initApp
