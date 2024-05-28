/* dom */
/* grab references to dom elements */
/* global Sketchage */

// DOM > main divs/elements
Sketchage.dom = {
  'body': document.getElementsByTagName('body')[0],
  'title': document.getElementsByTagName('header')[0],
  'navOverlay': document.getElementById('nav-overlay'),
  'navContent': document.getElementById('nav-content'),
  'content': document.getElementById('content'),
  'grid': document.getElementById('grid'),
  'gridInner': document.getElementById('grid-inner'),
  'genImageContainer': document.getElementById('generated-images'),
  'genImages': document.querySelectorAll('#generated-images .gen-img'),
  'genImageCloseLinks': document.querySelectorAll('#generated-images .gen-img a.gen-img-x'),
  'rulerX': document.querySelector('.ruler-x'),
  'rulerY': document.querySelector('.ruler-y'),
}

// DOM > interactive elements
Sketchage.dom.interactive = {
  'btnNav': document.getElementById('button-nav'),
  'btnNavClose': document.getElementById('button-nav-close'),
  'btnHelp': document.getElementById('button-help'),
  'btnSettings': document.getElementById('button-settings'),
  'colorFG': document.getElementById('color-picker-fg'),
  'colorBG': document.getElementById('color-picker-bg'),
  'modes': document.querySelectorAll('#mode-selection button'),
  'btnGenImage': document.getElementById('button-export-image'),
  'btnClearGrid': document.getElementById('button-reset-image'),
  'screenDims': document.getElementById('screen-dims')
}
