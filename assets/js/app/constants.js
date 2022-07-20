/* constants */
/* set any global constants */

const SKETCHAGE_ENV_PROD_URL = [
  'neb.host/sketchage',
  'sketchage.neb.host'
]

const SKETCHAGE_IMAGE_DATA_KEY = 'sketchage-image'
const SKETCHAGE_SETTINGS_KEY = 'sketchage-settings'

const SQUARE_COUNT_DEFAULT = 32;
const GRID_WIDTH_DEFAULT = 640;
const COLOR_FG_DEFAULT = "#000000";
const COLOR_BG_DEFAULT = "#ffffff";

const SKETCHAGE_DEFAULTS = {
  "config": {
    "mouseIsDown": false,
    "altIsDown": false, // erase
    "ctrlIsDown": false, // eyedropper
    "shiftIsDown": false, // paint bucket
    "color": "",
    // TODO: actually make this transparent somehow (for PNG)
    "colorTransparent": COLOR_BG_DEFAULT,
    "colorFG": COLOR_FG_DEFAULT,
    "colorBG": COLOR_BG_DEFAULT
  },
  "settings": {
    "squareCount": SQUARE_COUNT_DEFAULT,
    "gridWidth": GRID_WIDTH_DEFAULT,
    "clicklessMode": false,
    "rainbowMode": false,
    "showRulers": false
  }
}