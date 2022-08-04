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
const COLOR_FG_DEFAULT = 'rgba(0, 0, 0, 255)';
const COLOR_BG_DEFAULT = 'rgba(255, 255, 255, 255)';

const SKETCHAGE_DEFAULTS = {
  'config': {
    'mode': 'draw',
    'mouseIsDown': false,
    'color': '',
    // TODO: actually make this transparent somehow (for PNG)
    'colorTransparent': COLOR_BG_DEFAULT,
    'colorFG': COLOR_FG_DEFAULT,
    'colorBG': COLOR_BG_DEFAULT
  },
  'settings': {
    'squareCount': SQUARE_COUNT_DEFAULT,
    'gridWidth': GRID_WIDTH_DEFAULT,
    'clicklessMode': false,
    'rainbowMode': false,
    'showRulers': false
  }
}