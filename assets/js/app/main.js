/* main */
/* app entry point and main functions */
/* global Sketchage, jscolor */

// TODO: make work on mobile? (force smaller grid size, maybe)

jscolor.presets.default = {
  format: 'any',
  palette: [
    '#000000ff',
    '#7d7d7dff',
    '#870014ff',
    '#ec1c23ff',
    '#ff7e26ff',
    '#fef100ff',
    '#22b14bff',
    '#00a1e7ff',
    '#3f47ccff',
    '#a349a4ff',
    '#ffffffff',
    '#c3c3c3ff',
    '#b87957ff',
    '#feaec9ff',
    '#ffc80dff',
    '#eee3afff',
    '#b5e61dff',
    '#99d9eaff',
    '#7092beff',
    '#c8bfe7ff',
  ],
}

// settings: saved in LOCAL STORAGE
Sketchage.settings = {}

// config: only saved while game is loaded
Sketchage.config = SKETCHAGE_DEFAULTS.config

/*************************************************************************
 * public methods *
 *************************************************************************/

// modal methods
Sketchage.modalOpen = async function (type) {
  switch (type) {
    case 'start':
    case 'help':
      console.log('modal help')
      this.myModal = new Modal(
        'perm',
        'How to Use Sketchage',
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

          <div><a href="https://github.com/michaelchadwick/sketchage">Sketchage</a> based on <a href="https://github.com/mixophrygian">mixophrygian</a>'s "<a href="https://github.com/mixophrygian/Etcha-sketch">Etcha-sketch</a>".</div>
        `,
        null,
        null
      )
      break

    case 'settings':
      this.myModal = new Modal(
        'perm',
        'Settings',
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

    case 'cleared-local-storage':
      this.myModal = new Modal(
        'temp',
        null,
        'Local Storage has been cleared',
        null,
        null
      )

      break
  }
}

Sketchage.initApp = function () {
  // set env
  Sketchage.env = SKETCHAGE_ENV_PROD_URL.includes(document.location.hostname)
    ? 'prod'
    : 'local'

  // if local dev, show debug stuff
  if (Sketchage.env == 'local') {
    document.title = '(LH) ' + document.title

    Sketchage.dom.interactive.screenDims.style.setProperty('display', 'flex')

    Sketchage.__updateScreenDims()
  }
  // if loading from omni.neb.host
  if (document.referrer.indexOf('omni.neb.host') >= 0) {
    Sketchage.__clearLocalStorage(false)
  }

  Sketchage._loadSettings()

  Sketchage._loadImageData()

  Sketchage._attachEventListeners()

  Sketchage._getNebyooApps()
}

/*************************************************************************
 * _private methods *
 *************************************************************************/

Sketchage._loadSettings = async function () {
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
Sketchage._changeSetting = async function (setting, event = null) {
  switch (setting) {
    case 'squareCount':
      const squareCountValue =
        document.getElementById('text-square-count').value

      if (squareCountValue != '') {
        // save to code/LS
        Sketchage._saveSetting('squareCount', parseInt(squareCountValue))
      }

      if (event && event.which === 13) {
        event.preventDefault()

        document.getElementById('button-square-count-resize').click()
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
          const squareCountValue =
            document.getElementById('text-square-count').value

          if (squareCountValue != '') {
            // save to code/LS
            Sketchage._saveSetting('squareCount', parseInt(squareCountValue))

            // remake grid
            Sketchage._makeGrid()
          }
        }
      } catch (err) {
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
          document.getElementById('text-square-count').value =
            SQUARE_COUNT_DEFAULT

          // save to code/LS
          Sketchage._saveSetting('squareCount', SQUARE_COUNT_DEFAULT)

          // remake grid
          Sketchage._makeGrid()
        }
      } catch (err) {
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
        document.getElementById('button-grid-width-resize').click()
      }
      break

    case 'gridWidthResize':
      const gridWidthResizeConfirmed = await new Modal(
        'confirm',
        'Reset Square Count',
        'Changing the grid width will clear the image. Proceed?',
        'Yes',
        'No'
      ).question()

      try {
        if (gridWidthResizeConfirmed) {
          const gridWidthValue =
            document.getElementById('text-grid-width').value

          if (gridWidthValue != '') {
            // update container DOM
            Sketchage.dom.gridInner.style.setProperty(
              'width',
              `${gridWidthValue}px`
            )
            Sketchage.dom.gridInner.style.setProperty(
              'height',
              `${gridWidthValue}px`
            )

            // save to code/LS
            Sketchage._saveSetting('gridWidth', parseInt(gridWidthValue))

            // remake grid
            Sketchage._makeGrid()
          }
        }
      } catch (err) {
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
          Sketchage.dom.gridInner.style.setProperty(
            'width',
            `${GRID_WIDTH_DEFAULT}px`
          )
          Sketchage.dom.gridInner.style.setProperty(
            'height',
            `${GRID_WIDTH_DEFAULT}px`
          )

          // update setting DOM
          document.getElementById('text-grid-width').value = GRID_WIDTH_DEFAULT

          // save to code/LS
          Sketchage._saveSetting('gridWidth', GRID_WIDTH_DEFAULT)

          // remake grid
          Sketchage._makeGrid()
        }
      } catch (err) {
        console.error('could not change grid width to default', err)
      }
      break

    case 'clicklessMode':
      const clicklessModeButton = document.getElementById(
        'button-setting-clickless-mode'
      )

      if (clicklessModeButton) {
        const clicklessModeStatus = clicklessModeButton.dataset.status

        if (clicklessModeStatus == '' || clicklessModeStatus == 'false') {
          // update setting DOM
          document.getElementById(
            'button-setting-clickless-mode'
          ).dataset.status = 'true'

          // save to code/LS
          Sketchage._saveSetting('clicklessMode', true)
        } else {
          // update setting DOM
          document.getElementById(
            'button-setting-clickless-mode'
          ).dataset.status = 'false'

          // save to code/LS
          Sketchage._saveSetting('clicklessMode', false)
        }
      }
      break

    case 'rainbowMode':
      const rainbowModeButton = document.getElementById(
        'button-setting-rainbow-mode'
      )

      if (rainbowModeButton) {
        const rainbowModeStatus = rainbowModeButton.dataset.status

        if (rainbowModeStatus == '' || rainbowModeStatus == 'false') {
          // update setting DOM
          document.getElementById(
            'button-setting-rainbow-mode'
          ).dataset.status = 'true'

          // update color DOM
          Sketchage.config.colorFG = getComputedStyle(
            document.getElementById('color-picker-fg')
          ).getPropertyValue('background-color')
          Sketchage.config.colorBG = getComputedStyle(
            document.getElementById('color-picker-bg')
          ).getPropertyValue('background-color')

          // save to code/LS
          Sketchage._saveSetting('rainbowMode', true)
        } else {
          // update setting DOM
          document.getElementById(
            'button-setting-rainbow-mode'
          ).dataset.status = 'false'

          // save to code/LS
          Sketchage._saveSetting('rainbowMode', false)
        }
      } else {
        Sketchage._saveSetting('rainbowMode', event)
      }
      break

    case 'showRulers':
      const showRulersButton = document.getElementById(
        'button-setting-show-rulers'
      )

      if (showRulersButton) {
        const showRulersStatus = showRulersButton.dataset.status

        if (showRulersStatus == '' || showRulersStatus == 'false') {
          // update setting DOM
          document.getElementById('button-setting-show-rulers').dataset.status =
            'true'

          Sketchage._enableRulers()

          // save to code/LS
          Sketchage._saveSetting('showRulers', true)
        } else {
          // update setting DOM
          document.getElementById('button-setting-show-rulers').dataset.status =
            'false'

          Sketchage._disableRulers()

          // save to code/LS
          Sketchage._saveSetting('showRulers', false)
        }
      }
      break
  }
}
Sketchage._saveSetting = function (setting, value) {
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

Sketchage._loadImageData = async function () {
  const lsImgData = localStorage.getItem(SKETCHAGE_IMAGE_DATA_KEY)

  if (lsImgData) {
    const isPristine = lsImgData
      .split(';')
      .map((cell) => cell.split(':')[1])
      .every((c) => c == 'rgb(255, 255, 255)')

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

          const colors = lsImgData.split(';')
          let id = ''
          let color = ''

          colors.forEach((c) => {
            c = c.split(':')
            id = c[0]
            color = c[1]

            if (id) {
              document
                .getElementById(id)
                .style.setProperty('background-color', color)
            }
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

Sketchage._attachEventListeners = function () {
  // main input event handlers
  Sketchage.dom.gridInner.addEventListener('mousedown', function () {
    Sketchage.config.mouseIsDown = true
  })

  Sketchage.dom.gridInner.addEventListener('mouseup', function () {
    Sketchage.config.mouseIsDown = false
  })

  // disallow right-clicking on canvas
  Sketchage.dom.gridInner.addEventListener('contextmenu', function (e) {
    e.preventDefault()
  })

  // attach event handlers to header buttons
  Sketchage.dom.interactive.btnNav.addEventListener('click', () => {
    Sketchage.dom.navOverlay.classList.toggle('show')
  })
  Sketchage.dom.interactive.btnNavClose.addEventListener('click', () => {
    Sketchage.dom.navOverlay.classList.toggle('show')
  })
  Sketchage.dom.interactive.btnHelp.addEventListener('click', () =>
    Sketchage.modalOpen('help')
  )
  Sketchage.dom.interactive.btnSettings.addEventListener('click', () =>
    Sketchage.modalOpen('settings')
  )

  Sketchage.dom.interactive.btnGenImage.addEventListener('click', () => {
    Sketchage._generateImage()
  })
  Sketchage.dom.interactive.btnClearGrid.addEventListener('click', async () => {
    const resetImageConfirmed = await new Modal(
      'confirm',
      'Reset Image',
      'Are you sure you want to reset the image?',
      'Yes',
      'No'
    ).question()

    try {
      if (resetImageConfirmed) {
        document.querySelectorAll('.square').forEach((square) => {
          square.style.setProperty(
            'background-color',
            Sketchage.config.colorTransparent
          )
        })

        Sketchage.__clearLocalStorage()
      }
    } catch (err) {
      console.error('could not reset image', err)
    }
  })

  Sketchage.dom.interactive.modes.forEach((mode) => {
    mode.addEventListener('click', function (event) {
      let target = event.target

      if (event.target.tagName == 'IMG') {
        target = event.target.parentElement
      }

      const mode = target.dataset.mode

      document
        .querySelector('#mode-selection button.current')
        .classList.remove('current')
      target.classList.add('current')

      Sketchage._changeMode(mode)
    })
  })

  // gotta use keydown, not keypress, or else Delete/Backspace aren't recognized
  document.addEventListener('keydown', (event) => {
    const modKeys = ['Alt', 'Control', 'Meta', 'Shift']

    // STUB
    if (modKeys.some((key) => event.getModifierState(key))) {
    }
  })
  document.addEventListener('keyup', (event) => {
    switch (event.code) {
      case 'KeyC':
        Sketchage._changeMode('copy')
        break
      case 'KeyD':
        Sketchage._changeMode('draw')
        break
      case 'KeyE':
        Sketchage._changeMode('erase')
        break
      case 'KeyF':
        Sketchage._changeMode('fill')
        break
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

  document
    .querySelector('#mode-selection button.current')
    .classList.remove('current')
  document
    .querySelector(`#mode-selection button[data-mode=${mode}]`)
    .classList.add('current')

  document.querySelector('#grid').classList = ''
  document.querySelector('#grid').classList.add(mode)
}

// handle both clicks and touches outside of modals
Sketchage._handleClickTouch = function (event) {
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

Sketchage._generateImage = async function () {
  Sketchage.dom.gridInner.style.setProperty('float', 'left')

  Sketchage.dom.genImageContainer.style.setProperty('display', 'block')
  Sketchage.dom.genImageContainer.style.setProperty(
    'height',
    `${Sketchage.dom.gridInner.clientHeight}px`
  )

  const genImgId = generateLowResBitmap(5, Sketchage.settings.squareCount)
  const genImgCloseId = `#${genImgId}-x`

  const newest_img = [
    ...Sketchage.dom.genImageContainer.querySelectorAll('img'),
  ][0]
  const newest_img_src = newest_img.getAttribute('src')

  const response = await fetch('assets/php/gd_convert.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      imageConversion: newest_img_src,
    }),
  })

  const json = await response.json()

  if (json.error) {
    console.error(json.error)
  } else {
    const imgPath = json.data
    const html = `
      <div class="file-links">
        <a class="file-link" href="${imgPath}.gif" target="_blank">GIF</a> | <a class="file-link" href="${imgPath}.jpg" target="_blank">JPG</a> | <a class="file-link" href="${imgPath}.png" target="_blank">PNG</a>
      </div>
    `

    newest_img.parentElement.innerHTML += html

    // if any image is closed and there are now 0 generated images
    // close the entire sidebar
    Sketchage.dom.genImageCloseLinks.forEach((img) => {
      img.addEventListener('click', (event) => {
        event.preventDefault()

        if (!Sketchage.dom.genImages.length) {
          Sketchage.dom.gridInner.style.setProperty('float', 'none')
          Sketchage.dom.genImages.style.setProperty('display', 'none')
        }
      })
    })
  }

  document.querySelector(genImgCloseId).addEventListener('click', () => {
    document.getElementById(genImgId).remove()
  })
}

Sketchage._makeGrid = function () {
  // remove any existing squares
  Sketchage.dom.gridInner.querySelectorAll('.square').forEach((square) => {
    square.remove()
  })
  // remove generated images
  Sketchage.dom.genImages.forEach((genImage) => {
    genImage.remove()
  })

  // create squares
  for (var i = 0; i < Sketchage.settings.squareCount; i++) {
    for (var j = 0; j < Sketchage.settings.squareCount - 1; j++) {
      const sq = document.createElement('div')
      sq.classList.add('square')
      sq.id = `${j}_${i}`

      Sketchage.dom.gridInner.appendChild(sq)
    }

    const sq = document.createElement('div')
    sq.classList.add('square')
    sq.id = `${j}_${i}`

    Sketchage.dom.gridInner.appendChild(sq)
  }

  const squareBorder = 1
  const squareWidth =
    Sketchage.settings.gridWidth / Sketchage.settings.squareCount -
    2 * squareBorder

  Sketchage.dom.gridInner.style.setProperty(
    'grid-template-columns',
    `repeat(${Sketchage.settings.squareCount}, 1fr)`
  )
  Sketchage.dom.gridInner.style.setProperty(
    'height',
    `${Sketchage.settings.gridWidth}px`
  )
  Sketchage.dom.gridInner.style.setProperty(
    'width',
    `${Sketchage.settings.gridWidth}px`
  )

  const squares = document.querySelectorAll('.square')

  // for each square, set height, width, color, and attach an event handler
  squares.forEach((square) => {
    square.style.setProperty(
      'background-color',
      Sketchage.config.colorTransparent
    )
    square.style.setProperty('height', `${squareWidth}px`)
    square.style.setProperty('width', `${squareWidth}px`)

    const events = ['mouseenter', 'mousedown', 'touchend', 'touchmove']

    events.forEach((eventName) => {
      square.addEventListener(eventName, (e) => {
        e.preventDefault()

        // choose Sketchage.config.color based on mouse button
        switch (e.which) {
          case 1:
            Sketchage.config.color = Sketchage.config.colorFG
            break
          case 3:
            Sketchage.config.color = Sketchage.config.colorBG
            break
          default:
            Sketchage.config.color = Sketchage.config.colorFG
            break
        }

        if (Sketchage.settings.rainbowMode) {
          Sketchage.config.colorFG = Sketchage.__getRandomColor()
          Sketchage.config.colorBG = Sketchage.__getRandomColor()
        }

        if (Sketchage.settings.clicklessMode) {
          Sketchage._updateSquare(square, Sketchage.config.color)
        } else if (Sketchage.config.mouseIsDown) {
          Sketchage._updateSquare(square, Sketchage.config.color)
        } else {
          square.addEventListener('mousedown', () => {
            Sketchage._updateSquare(square, Sketchage.config.color)
          })
        }
      })
    })
  })

  Sketchage.__updateScreenDims()
  Sketchage.__resizeRulerBackground()
}

// main update function
Sketchage._updateSquare = async function (square, color) {
  let colorToUse = color

  switch (Sketchage.config.mode) {
    case 'erase':
      // erase color back to transparent (this is just BG color right now)
      square.style.setProperty(
        'background-color',
        Sketchage.config.colorTransparent
      )

      break

    case 'copy':
      // grab background-color of current square
      let squareColor = square.style.getPropertyValue('background-color')

      squareColor = Sketchage.__rgb2Hexa(squareColor)

      // set current color and update jscolor
      Sketchage.config.color = squareColor
      document.querySelector('#color-picker-fg').jscolor.fromString(squareColor)

      break

    case 'fill':
      if (!Sketchage.settings.rainbowMode) {
        colorToUse = document
          .querySelector('#color-picker-fg')
          .jscolor.toRGBAString()
        Sketchage.config.color = colorToUse
      }

      // grab reference to current square and its background-color
      Sketchage.__startFill(square, colorToUse)

      break

    case 'draw':
    default:
      if (!Sketchage.settings.rainbowMode) {
        colorToUse = document
          .querySelector('#color-picker-fg')
          .jscolor.toRGBAString()
        Sketchage.config.color = colorToUse
      }

      square.style.setProperty('background-color', colorToUse)

      break
  }

  Sketchage.__saveImageData()
}

Sketchage._getNebyooApps = async function () {
  const response = await fetch(NEBYOOAPPS_SOURCE_URL)
  const json = await response.json()
  const apps = json.body
  const appList = document.querySelector('.nav-list')

  Object.values(apps).forEach((app) => {
    const appLink = document.createElement('a')
    appLink.href = app.url
    appLink.innerText = app.title
    appLink.target = '_blank'
    appList.appendChild(appLink)
  })
}

/*************************************************************************
 * _private __helper methods *
 *************************************************************************/

Sketchage.__updateScreenDims = function () {
  const dims = `
    <span><strong>viewportW</strong>: ${document.body.offsetWidth}</span>
    <span><strong>viewPortH</strong>: ${document.body.offsetHeight}</span>
    <span><strong>contentW</strong>: ${Sketchage.dom.content.clientWidth}</span>
    <span><strong>contentH</strong>: ${Sketchage.dom.content.clientHeight}</span>
    <span><strong>gridW</strong>: ${Sketchage.dom.grid.clientWidth}</span>
    <span><strong>gridH</strong>: ${Sketchage.dom.grid.clientHeight}</span>
  `

  Sketchage.dom.interactive.screenDims.innerHTML = dims
}

Sketchage.__saveImageData = function () {
  let serial_img = ''

  document.querySelectorAll('.square').forEach((square) => {
    const id = square.getAttribute('id')
    const color = square.style.getPropertyValue('background-color')
    const cell = `${id}:${color};`

    if (cell != null) {
      serial_img = serial_img.concat(cell)
    }
  })

  localStorage.setItem(SKETCHAGE_IMAGE_DATA_KEY, serial_img)
}
Sketchage.__saveToLocalStorage = function () {
  localStorage.setItem(
    SKETCHAGE_SETTINGS_KEY,
    JSON.stringify(Sketchage.settings)
  )
}
Sketchage.__clearLocalStorage = function (showModal = true) {
  if (localStorage.getItem(SKETCHAGE_IMAGE_DATA_KEY)) {
    localStorage.removeItem(SKETCHAGE_IMAGE_DATA_KEY)
  }

  if (showModal) {
    Sketchage.modalOpen('cleared-local-storage')
  }
}

Sketchage.__floodFill = async function (square, prevColor, newColor) {
  return new Promise((resolve) => {
    if (square) {
      const [x, y] = square
        .getAttribute('id')
        .split('_')
        .map((coord) => Number(coord))
      const edge = Sketchage.config.squareCount

      // if we have traveled outside the bounds of the grid, exit
      if (x < 0 || x >= edge || y < 0 || y >= edge) {
        return
      }

      if (prevColor) {
        // might be missing alpha channel
        if (prevColor.split(',').length < 4) {
          prevColor = Sketchage.__rgb2Rgba(prevColor)
        }

        let currentColor = square.style.getPropertyValue('background-color')
        currentColor = Sketchage.__rgb2Rgba(currentColor)

        // if the next square we check isn't the same color as the OG, exit
        if (currentColor !== prevColor) {
          return
        }

        // replace the color at current square
        square.style.setProperty('background-color', newColor)

        // recurse for N, E, S, W
        Sketchage.__floodFill(
          document.getElementById(`${x}_${y + 1}`),
          prevColor,
          newColor
        )
        Sketchage.__floodFill(
          document.getElementById(`${x + 1}_${y}`),
          prevColor,
          newColor
        )
        Sketchage.__floodFill(
          document.getElementById(`${x}_${y - 1}`),
          prevColor,
          newColor
        )
        Sketchage.__floodFill(
          document.getElementById(`${x - 1}_${y}`),
          prevColor,
          newColor
        )

        resolve()
      }
    }
  })
}
Sketchage.__startFill = async function (square, newColor) {
  let prevColor = square.style.getPropertyValue('background-color')

  // might be missing alpha channel
  if (prevColor.split(',').length < 4) {
    prevColor = Sketchage.__rgb2Rgba(prevColor)
  }

  // if current color is already the new color, don't do any filling
  if (prevColor == newColor) {
    return
  }

  // change square color to FG/BG color, then recurse over nearby squares
  await Sketchage.__floodFill(square, prevColor, newColor)
}

/* ******************************** *
 * START THE ENGINE                 *
 * ******************************** */

window.onload = Sketchage.initApp
