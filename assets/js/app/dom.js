/* dom */
/* grab references to dom elements */
/* global $, Sketchage */

// DOM > main divs/elements
Sketchage.dom = {
  "body": $('body'),
  "title": $('header'),
  "navOverlay": $('#nav-overlay'),
  "navContent": ('$nav-content'),
  "grid": $('#grid'),
  "genImages": $("#generated-images")
}

// DOM > interactive elements
Sketchage.dom.interactive = {
  "btnNav": $('#button-nav'),
  "btnNavClose": $('#button-nav-close'),
  "btnHelp": $('#button-help'),
  "btnSettings": $('#button-settings'),
  "btnGenImage": $('#button-generate-image'),
  "btnClearGrid": $('#button-clear-grid')
}

// DOM > settings modal elements
Sketchage.dom.settings = {
// TODO
}
