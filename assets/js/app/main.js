/* main */
/* app entry point and main functions */
/* global $, Sketchage, jscolor */

jscolor.presets.default = {
  format: 'any',
  palette: [
		'#000000ff', '#7d7d7dff', '#870014ff', '#ec1c23ff', '#ff7e26ff',
		'#fef100ff', '#22b14bff', '#00a1e7ff', '#3f47ccff', '#a349a4ff',
		'#ffffffff', '#c3c3c3ff', '#b87957ff', '#feaec9ff', '#ffc80dff',
		'#eee3afff', '#b5e61dff', '#99d9eaff', '#7092beff', '#c8bfe7ff',
	]
}

// settings: saved in LOCAL STORAGE
Sketchage.settings = {}

// config: only saved while game is loaded
Sketchage.config = SKETCHAGE_DEFAULTS.config

/*************************************************************************
 * public methods *
 *************************************************************************/

// modal methods
Sketchage.modalOpen = async function(type) {
  switch(type) {
    case 'start':
    case 'help':
      this.myModal = new Modal('perm', 'How to Use Sketchage',
        `
          <p><strong>Sketchage</strong> is a super simple grid-based drawing program. Choose a foreground and background color from the picker, and then either left-click (FG) or right-click (BG) on a square, or click and drag around, to fill in the picture. If you want to just drag your mouse without clicking, check the "Clickless drawing" box.</p>

          <ul class="icons">
            <li class="icon-draw">Draw with current FG color (key: D)</li>
            <li class="icon-erase">Erase to current BG color (key: E)</li>
            <li class="icon-copy">Copy current color (key: C)</li>
            <li class="icon-fill">Fill area with current color (key: F)</li>
          </ul>

          <p>The number of squares and overall grid width can be adjusted (but it will clear the grid!). Hit the "Export Image" button to save your creation as a BMP (w/ GIF, JPG, and PNG options, too) that you can right-click to save to your computer.</p>

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
                  <button id="button-square-count-resize" onclick="Sketchage._changeSetting('squareCountResize')">
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

    Sketchage.dom.interactive.screenDims.style.display = 'flex'

    Sketchage.__updateScreenDims()
  }

  Sketchage._loadSettings()

  Sketchage._loadImageData()

  Sketchage._attachEventListeners()
}

/*************************************************************************
 * _private methods *
 *************************************************************************/

Sketchage._loadSettings = async function() {
  const lsSettings = JSON.parse(localStorage.getItem(SKETCHAGE_SETTINGS_KEY))

  if (lsSettings) {
    if (lsSettings.squareCount) {
      Sketchage.settings.squareCount = lsSettings.squareCount

      const setting = document.getElementById('text-square-count')

      if (setting) {
        setting.value = lsSettings.squareCount
      }
    }

    if (lsSettings.gridWidth) {
      Sketchage.settings.gridWidth = lsSettings.gridWidth

      const setting = document.getElementById('text-grid-width')

      if (setting) {
        setting.value = lsSettings.gridWidth
      }
    }

    if (lsSettings.clicklessMode) {
      Sketchage.settings.clicklessMode = lsSettings.clicklessMode

      const setting = document.getElementById('button-setting-clickless-mode')

      if (setting) {
        setting.dataset.status = Sketchage.settings.clicklessMode
      }
    }

    if (lsSettings.rainbowMode) {
      Sketchage.settings.rainbowMode = lsSettings.rainbowMode

      const setting = document.getElementById('button-setting-rainbow-mode')

      if (setting) {
        setting.dataset.status = Sketchage.settings.rainbowMode
      }
    }

    if (lsSettings.showRulers) {
      Sketchage._enableRulers()
    }
  } else {
    Sketchage.settings = SKETCHAGE_DEFAULTS.settings

    Sketchage.__saveToLocalStorage()
  }
}
Sketchage._changeSetting = async function(setting, event = null) {
  switch (setting) {
    case 'squareCount':
      const squareCountValue = document.getElementById('text-square-count').value

      if (squareCountValue != '') {
        // save to code/LS
        Sketchage._saveSetting('squareCount', parseInt(squareCountValue))
      }

      if (event && event.which === 13) {
        event.preventDefault()

        $("#button-square-count-resize").click()
      }
      break

    case 'squareCountResize':
      const squareCountResizeConfirmed = await new Modal(
        'confirm',
        'Change Square Count',
        'Changing the square count will clear the image. Proceed?',
        'Yes',
        'No'
      ).question()

      try {
        if (squareCountResizeConfirmed) {
          const squareCountValue = document.getElementById('text-square-count').value

          if (squareCountValue != '') {
            // save to code/LS
            Sketchage._saveSetting('squareCount', parseInt(squareCountValue))

            // remake grid
            Sketchage._makeGrid()
          }
        }
      } catch(err) {
        console.error('could not change square count', err)
      }
      break

    case 'squareCountDefault':
      const squareCountDefaultConfirmed = await new Modal(
        'confirm',
        'Reset Square Count to Default',
        'Resetting the square count to default will clear the image. Proceed?',
        'Yes',
        'No'
      ).question()

      try {
        if (squareCountDefaultConfirmed) {
          // update container DOM
          Sketchage.settings.squareCount = SQUARE_COUNT_DEFAULT
          Sketchage.settings.squareCount = SQUARE_COUNT_DEFAULT

          // update setting DOM
          $("#text-square-count").val(SQUARE_COUNT_DEFAULT)

          // save to code/LS
          Sketchage._saveSetting('squareCount', SQUARE_COUNT_DEFAULT)

          // remake grid
          Sketchage._makeGrid()
        }
      } catch(err) {
        console.error('could not reset square count to default', err)
      }
      break

    case 'gridWidth':
      const gridWidthValue = document.getElementById('text-grid-width').value

      if (gridWidthValue != '') {
        // save to code/LS
        Sketchage._saveSetting('gridWidth', parseInt(gridWidthValue))
      }

      if (event && event.which === 13) {
        event.preventDefault()
        $("#button-grid-width-resize").click()
      }
      break

    case 'gridWidthResize':
      const gridWidthResizeConfirmed = await new Modal('confirm', 'Reset Square Count',
        'Changing the grid width will clear the image. Proceed?',
        'Yes',
        'No'
      ).question()

      try {
        if (gridWidthResizeConfirmed) {
          const gridWidthValue = document.getElementById('text-grid-width').value

          if (gridWidthValue != '') {
            // update container DOM
            Sketchage.dom.gridInner.css("width", gridWidthValue)
            Sketchage.dom.gridInner.css("height", gridWidthValue)

            // save to code/LS
            Sketchage._saveSetting('gridWidth', parseInt(gridWidthValue))

            // remake grid
            Sketchage._makeGrid()
          }
        }
      } catch(err) {
        console.error('could not change the grid width', err)
      }
      break

    case 'gridWidthDefault':
      const gridWidthDefaultConfirmed = await new Modal(
        'confirm',
        'Reset Grid Width to Default',
        'Resetting the grid width to default will clear the image. Proceed?',
        'Yes',
        'No'
      ).question()

      try {
        if (gridWidthDefaultConfirmed) {
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
      } catch(err) {
        console.error('could not change grid width to default', err)
      }
      break

    case 'clicklessMode':
      const clicklessModeButton = document.getElementById('button-setting-clickless-mode')

      if (clicklessModeButton) {
        const clicklessModeStatus = clicklessModeButton.dataset.status

        if (clicklessModeStatus == '' || clicklessModeStatus == 'false') {
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
      const rainbowModeButton = document.getElementById('button-setting-rainbow-mode')

      if (rainbowModeButton) {
        const rainbowModeStatus = rainbowModeButton.dataset.status

        if (rainbowModeStatus == '' || rainbowModeStatus == 'false') {
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
      } else {
        Sketchage._saveSetting('rainbowMode', event)
      }
      break

    case 'showRulers':
      const showRulersButton = document.getElementById('button-setting-show-rulers')

      if (showRulersButton) {
        const showRulersStatus = showRulersButton.dataset.status

        if (showRulersStatus == '' || showRulersStatus == 'false') {
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

  const settings = JSON.parse(localStorage.getItem(SKETCHAGE_SETTINGS_KEY))

  if (settings) {
    // set internal code model
    Sketchage.settings[setting] = value

    // set temp obj that will go to LS
    settings[setting] = value

    // save all settings to LS
    Sketchage.__saveToLocalStorage()
  }

  // console.log('!global setting saved!', Sketchage.settings)
}

Sketchage._loadImageData = async function() {
  const lsImgData = localStorage.getItem(SKETCHAGE_IMAGE_DATA_KEY)

  if (lsImgData) {
    const isPristine = lsImgData.split(';').map(cell => cell.split(':')[1]).every(c => c == 'rgb(255, 255, 255)')

    if (!isPristine) {
      const prevImageDataConfirmed = await new Modal(
        'confirm',
        'Previous Image Data Found',
        'Previous image data was found. Do you want to load it?',
        'Yes',
        'No'
      ).question()

      try {
        if (prevImageDataConfirmed) {
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
          Sketchage._makeGrid()
        }
      } catch (err) {
        console.error('data load failed', err)
      }
    }
  } else {
    Sketchage._makeGrid()
  }
}

Sketchage._attachEventListeners = function() {
  // main input event handlers
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
  Sketchage.dom.interactive.btnHelp.click(() => Sketchage.modalOpen('help'))
  Sketchage.dom.interactive.btnSettings.click(() => Sketchage.modalOpen('settings'))

  Sketchage.dom.interactive.btnGenImage.click(function() {
    Sketchage._generateImage()
  })
  Sketchage.dom.interactive.btnClearGrid.click(async function() {
    const resetImageConfirmed = await new Modal(
      'confirm',
      'Reset Image',
      'Are you sure you want to reset the image?',
      'Yes',
      'No'
    ).question()

    try {
      if (resetImageConfirmed) {
        $('.square').css('background-color', Sketchage.config.colorTransparent)

        Sketchage.__clearLocalStorage()
      }
    } catch (err) {
      console.error('could not reset image', err)
    }
  })

  Sketchage.dom.interactive.modes.click(function(event) {
    let target = event.target

    if (event.target.tagName == 'IMG') {
      target = event.target.parentElement
    }

    const mode = target.dataset.mode

    $('#mode-selection button.current').removeClass('current')
    target.classList.add('current')

    Sketchage._changeMode(mode)
  })

  // gotta use keydown, not keypress, or else Delete/Backspace aren't recognized
  document.addEventListener('keydown', (event) => {
    const modKeys = ['Alt', 'Control', 'Meta', 'Shift']

    // STUB
    if (modKeys.some(key => event.getModifierState(key))) {}
  })
  document.addEventListener('keyup', (event) => {
    switch (event.code) {
      case 'KeyC': Sketchage._changeMode('copy'); break
      case 'KeyD': Sketchage._changeMode('draw'); break
      case 'KeyE': Sketchage._changeMode('erase'); break
      case 'KeyF': Sketchage._changeMode('fill'); break
    }
  })

  // When the user clicks or touches anywhere outside of the modal, close it
  window.addEventListener('click', Sketchage._handleClickTouch)
  window.addEventListener('touchend', Sketchage._handleClickTouch)

  window.addEventListener('resize', Sketchage.__resizeRulerBackground)
  window.addEventListener('resize', Sketchage.__updateScreenDims)
}

// attach event handlers to jscolor pickers
Sketchage._jscolorFGChange = () => {
  Sketchage.config.colorFG = this.jscolor.toString()
  Sketchage._changeSetting('rainbowMode', false)
}
Sketchage._jscolorBGChange = () => {
  Sketchage.config.colorBG = this.jscolor.toString()
  Sketchage._changeSetting('rainbowMode', false)
}

Sketchage._changeMode = (mode) => {
  Sketchage.config.mode = mode

  $('#mode-selection button.current').removeClass('current')
  $(`#mode-selection button[data-mode=${mode}]`).addClass('current')

  $('#grid').removeClass()
  $('#grid').addClass(mode)
}

// handle both clicks and touches outside of modals
Sketchage._handleClickTouch = function(event) {
  const dialog = document.getElementsByClassName('modal-dialog')[0]

  if (dialog) {
    const isConfirm = dialog.classList.contains('modal-confirm')

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
    url: 'assets/php/gd_convert.php',
    type: 'post',
    data: { "imageConversion": $newest_img_src },
    success: function(imgPath) {
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

Sketchage._makeGrid = function() {
  // remove any existing squares
  Sketchage.dom.gridInner.find('.square').remove()
  // remove generated images
  Sketchage.dom.genImages.remove()

  // create squares
  for (var i = 0; i < Sketchage.settings.squareCount; i++) {
    for (var j = 0; j < Sketchage.settings.squareCount - 1; j++) {
      Sketchage.dom.gridInner.append(`<div class='square' id='${j}_${i}'></div>`)
    }

    Sketchage.dom.gridInner.append(`<div class='square' id='${j}_${i}'></div>`)
  }

  const squareBorder = 1
  const squareWidth = (Sketchage.settings.gridWidth / Sketchage.settings.squareCount) - (2 * squareBorder)

  Sketchage.dom.gridInner.css({
    gridTemplateColumns: `repeat(${Sketchage.settings.squareCount}, 1fr)`,
    height: Sketchage.settings.gridWidth,
    width: Sketchage.settings.gridWidth
  })

  const $squares = $('.square')

  // for each square, set height, width, color, and attach an event handler
  $squares.css({
    'background-color': Sketchage.config.colorTransparent,
    'height': squareWidth,
    'width': squareWidth
  })

  $squares.on("mouseenter mousedown touchend touchmove", function(e) {
    if (Sketchage.settings.rainbowMode) {
      Sketchage.config.colorFG = Sketchage.__getRandomColor()
      Sketchage.config.colorBG = Sketchage.__getRandomColor()
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

  Sketchage.__updateScreenDims()
  Sketchage.__resizeRulerBackground()
}

// main drawing function
Sketchage._draw = function(square, color) {
  let colorToUse = color

  switch (Sketchage.config.mode) {
    case 'erase':
      // erase color back to transparent (this is just BG color right now)
      $(square).css('background-color', Sketchage.config.colorTransparent)

      break

    case 'copy':
      // grab background-color of current square
      let squareColor = $(square).css('background-color')

      squareColor = Sketchage.__rgb2Hexa(squareColor)

      // set current color and update jscolor
      Sketchage.config.color = squareColor
      document.querySelector('#color-picker-fg').jscolor.fromString(squareColor)

      break

    case 'fill':
      if (!Sketchage.settings.rainbowMode) {
        colorToUse = document.querySelector('#color-picker-fg').jscolor.toRGBAString()
        Sketchage.config.color = colorToUse
      }

      // grab reference to current square and its background-color
      const id = $(square).attr('id').split('_')
      const x = parseInt(id[0])
      const y = parseInt(id[1])

      Sketchage.__startFill(x, y, colorToUse)

      break

    case 'draw':
    default:
      if (!Sketchage.settings.rainbowMode) {
        colorToUse = document.querySelector('#color-picker-fg').jscolor.toRGBAString()
        Sketchage.config.color = colorToUse
      }

      $(square).css('background-color', colorToUse)

      break
  }

  Sketchage.__saveImageData()
}

/*************************************************************************
 * _private __helper methods *
 *************************************************************************/

Sketchage.__updateScreenDims = function() {
  const dims = `
    <span><strong>viewportW</strong>: ${document.body.offsetWidth}</span>
    <span><strong>viewPortH</strong>: ${document.body.offsetHeight}</span>
    <span><strong>contentW</strong>: ${Sketchage.dom.content.width()}</span>
    <span><strong>contentH</strong>: ${Sketchage.dom.content.height()}</span>
    <span><strong>gridW</strong>: ${Sketchage.dom.grid.width()}</span>
    <span><strong>gridH</strong>: ${Sketchage.dom.grid.height()}</span>
  `

  Sketchage.dom.interactive.screenDims[0].innerHTML = dims
}

Sketchage.__resizeRulerBackground = function() {
  const clientW = document.documentElement.clientWidth
  const headerHeight = 121
  const adjustRulerXLeft = ((clientW - Sketchage.settings.gridWidth) / 2) - 1
  const adjustRulerXTop = headerHeight
  const adjustRulerYLeft = ((clientW - Sketchage.settings.gridWidth) / 2) - 20
  const adjustRulerYTop = headerHeight

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

Sketchage.__saveImageData = function() {
  let serial_img = ''

  $(".square").each(function() {
    let id = $(this).attr('id')
    let color = $(this).css('background-color')

    serial_img = serial_img.concat(`${id}:${color};`)
  })

  localStorage.setItem(SKETCHAGE_IMAGE_DATA_KEY, serial_img)
}
Sketchage.__saveToLocalStorage = function() {
  localStorage.setItem(SKETCHAGE_SETTINGS_KEY, JSON.stringify(Sketchage.settings))
}
Sketchage.__clearLocalStorage = function() {
  if (localStorage.getItem(SKETCHAGE_IMAGE_DATA_KEY)) {
    localStorage.removeItem(SKETCHAGE_IMAGE_DATA_KEY)
  }
}

Sketchage.__getRandomColor = function() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16)
}

Sketchage.__floodFill = function(x, y, prevColor, newColor) {
  setTimeout(() => {

    const $square = $(`#${x}_${y}`)
    const edge = Sketchage.config.squareCount

    // if we have traveled outside the bounds of the grid, exit
    if (x < 0 || x >= edge || y < 0 || y >= edge) return

    if (prevColor) {
      // might be missing alpha channel
      if (prevColor.split(',').length < 4) {
        prevColor = Sketchage.__rgb2Rgba(prevColor)
      }

      let currentColor = $square.css('background-color')
      currentColor = Sketchage.__rgb2Rgba(currentColor)

      // if the next square we check isn't the same color as the OG, exit
      if (currentColor !== prevColor) return

      // replace the color at current square
      $square.css('background-color', newColor)

      // recurse for N, E, S, W
      Sketchage.__floodFill(x, y + 1, prevColor, newColor)
      Sketchage.__floodFill(x + 1, y, prevColor, newColor)
      Sketchage.__floodFill(x, y - 1, prevColor, newColor)
      Sketchage.__floodFill(x - 1, y, prevColor, newColor)
    } else {
      return
    }

  }, 0)
}
Sketchage.__startFill = function(x, y, newColor) {
  let prevColor = $(`#${x}_${y}`).css('background-color')
  if (prevColor.split(',').length < 4) {
    // might be missing alpha channel
    prevColor = Sketchage.__rgb2Rgba(prevColor)
  }

  // if current color is already the new color, don't do any filling
  if (prevColor == newColor) return

  // change square color to FG/BG color, then recurse over nearby squares
  Sketchage.__floodFill(x, y, prevColor, newColor)
}

Sketchage.__dec2Hex = function(dec) {
  const hex = parseInt(dec).toString(16);

  return hex.length == 1 ? `0${hex}` : hex;
}
Sketchage.__rgb2Rgba = function(rgb) {
  if (rgb !== undefined) {
    const colors = rgb.split("(")[1].split(")")[0].split(',')

    const R = colors[0].trim()
    const G = colors[1].trim()
    const B = colors[2].trim()

    const rgba = `rgba(${R},${G},${B},1)`

    return rgba;
  }
}
Sketchage.__rgb2Hexa = function(rgb) {
  // get "r, g, b" (and maybe "a") string
  const colors = rgb.split("(")[1].split(")")[0].split(',')

  // convert each value to hex
  const hexR = Sketchage.__dec2Hex(colors[0].trim())
  const hexG = Sketchage.__dec2Hex(colors[1].trim())
  const hexB = Sketchage.__dec2Hex(colors[2].trim())

  let hexA = 'ff'

  if (colors.length == 4) {
    hexA = Sketchage.__dec2Hex(colors[3].trim())
  }

  // glue it back together
  const hex = `${hexR}${hexG}${hexB}${hexA}`

  return hex
}

/* ******************************** *
 * START THE ENGINE                 *
 * ******************************** */

window.onload = Sketchage.initApp
