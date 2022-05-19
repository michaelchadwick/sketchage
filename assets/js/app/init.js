/* init */
/* get the main app object set up */
/* global $, Sketchage */

// Sketchage object init
if ((typeof Sketchage) === 'undefined') var Sketchage = {}

const ENV_PROD_URL = ['https://neb.host/sketchage', 'https://sketchage.neb.host']

const SKETCHAGE_IMAGE_DATA_KEY = 'sketchage-image'
const SKETCHAGE_SETTINGS_KEY = 'sketchage-settings'

const SQUARE_COUNT_DEFAULT = 32;
const GRID_WIDTH_DEFAULT = 640;
const COLOR_FG_DEFAULT = "#000000";
const COLOR_BG_DEFAULT = "#ffffff";
