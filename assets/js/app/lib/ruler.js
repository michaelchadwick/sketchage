/* ruler */
/* screen measurement */
/* global $, Sketchage */

Sketchage._enableRulers = function() {
  // show background-image (ruler ticks)
  Sketchage.dom.body.style.setProperty('background-image', 'linear-gradient(90deg, var(--ruler1-c) 0 var(--ruler1-bdw), transparent 0), linear-gradient(90deg, var(--ruler2-c) 0 var(--ruler2-bdw), transparent 0), linear-gradient(0deg, var(--ruler1-c) 0 var(--ruler1-bdw), transparent 0), linear-gradient(0deg, var(--ruler2-c) 0 var(--ruler2-bdw), transparent 0)')
  // show ruler numbers
  Sketchage.dom.rulerX.style.setProperty('display', 'flex')
  Sketchage.dom.rulerY.style.setProperty('display', 'flex')
}
Sketchage._disableRulers = function() {
  // hide background-image (ruler ticks)
  Sketchage.dom.body.style.setProperty('background-image', 'none')
  // hide ruler numbers
  Sketchage.dom.rulerX.style.setProperty('display', 'none')
  Sketchage.dom.rulerY.style.setProperty('display', 'none')
}

// TODO: remove jQuery
Sketchage.__resizeRulerBackground = function() {
  const clientW = document.documentElement.clientWidth
  const headerHeight = 121
  const adjustRulerXLeft = ((clientW - Sketchage.settings.gridWidth) / 2) - 1
  const adjustRulerXTop = headerHeight
  const adjustRulerYLeft = ((clientW - Sketchage.settings.gridWidth) / 2) - 20
  const adjustRulerYTop = headerHeight

  $(".ruler-x").transition({
    width: `${Sketchage.settings.gridWidth}px`,
    x: adjustRulerXLeft,
    y: adjustRulerXTop,
    duration: 0
  })

  $(".ruler-y").transition({
    height: `${Sketchage.settings.gridWidth}px`,
    x: adjustRulerYLeft,
    y: adjustRulerYTop,
    duration: 0
  })

  document.querySelector("body").style.setProperty('background-position', `${adjustRulerXLeft + 1}px ${adjustRulerXTop}px`)
}