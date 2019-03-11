import Color from 'color'

function fmod(a: number, b: number) {
  return Number((a - (Math.floor(a / b) * b)).toPrecision(8))
}

export default ({ hue, saturation, value  }: { hue: number, saturation: number, value: number }) => {
  const h = fmod(hue, 360)
  const s = 100 - ((saturation * 2) - 100)
  const v = value
  const c = Color({ h, s, v })

  return {
    red: c.red(),
    green: c.green(),
    blue: c.blue(),
  }
}
