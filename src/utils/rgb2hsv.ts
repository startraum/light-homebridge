import Color from 'color'

export interface RGB {
  red: number
  green: number
  blue: number
}

export default ({ red, green, blue  }: RGB) => {
  const color = Color({ r: red, g: green, b: blue })
  const hsv = color.hsv()

  return {
    hue: Math.round(hsv.hue()),
    saturation: Math.round(50 - ((hsv.saturationv() / 2) - 50)),
    value: Math.round(hsv.value()),
  }
}
