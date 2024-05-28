/* color */
/* color modification functions */
/* global Sketchage */

Sketchage.__getRandomColor = function() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16)
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
Sketchage.__dec2Hex = function(dec) {
  const hex = parseInt(dec).toString(16);

  return hex.length == 1 ? `0${hex}` : hex;
}