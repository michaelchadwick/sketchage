/* dom */
/* grab references to dom elements */
/* global $, Sketchage */

// DOM > main divs/elements
Sketchage.dom = {
  'body': $('body'),
  'title': $('header'),
  'navOverlay': $('#nav-overlay'),
  'navContent': ('$nav-content'),
  'grid': $('#grid'),
  'gridInner': $('#grid-inner'),
  'genImageContainer': $('#generated-images'),
  'genImages': $('#generated-images .gen-img'),
  'rulerX': $('.ruler-x'),
  'rulerY': $('.ruler-y'),
}

// DOM > interactive elements
Sketchage.dom.interactive = {
  'btnNav': $('#button-nav'),
  'btnNavClose': $('#button-nav-close'),
  'btnHelp': $('#button-help'),
  'btnSettings': $('#button-settings'),
  'colorFG': $('#color-picker-fg'),
  'colorBG': $('#color-picker-bg'),
  'btnGenImage': $('#button-export-image'),
  'btnClearGrid': $('#button-clear-grid')
}
