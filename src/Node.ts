import { debounce } from 'lodash'
import manager, { Light } from './manager'
import callbackify from './utils/callbackify'
import rgb2hsv from './utils/rgb2hsv'
import hsv2rgb from './utils/hsv2rgb'
import { colorTemperature2rgb, rgb2colorTemperature } from './utils/colorTemperature'

let Characteristic: any // tslint:disable-line variable-name
let Service: any // tslint:disable-line variable-name

export function setup(homebridge: any) {
  Characteristic = homebridge.hap.Characteristic
  Service = homebridge.hap.Service
}

export interface ExternalUpdate {
  name: string
  hue: number
  lightness: number
  power: boolean
  intensity: number
}

interface Characteristic {
  on(type: 'get' | 'set', callback: (...args: any[]) => void): Characteristic
}

interface HomebridgeService {
  getCharacteristic(characteristicId: number): Characteristic
  setCharacteristic(characteristicId: number, value: any): HomebridgeService
}

export default class LightNode {
  public name: string
  private light: Light
  private log: (msg: string) => void
  private informationService: HomebridgeService
  private lightbulbService: HomebridgeService
  private update = debounce(() => {
    manager.update(this.light.id, {
      hue: this.light.hue,
      lightness: this.light.lightness,
      intensity: this.light.intensity,
      power: this.light.power,
    })
  }, 100)

  constructor(log: (msg: string) => void, light: Light) {
    this.log = log
    this.light = light
    this.name = light.name

    this.lightbulbService = new Service.Lightbulb(this.light.name)
    this.informationService = new Service.AccessoryInformation()
    this.setupServices()
  }

  public setupServices() {
    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Paul van Laar, Paul Weber & Max Nowack')
      .setCharacteristic(Characteristic.Model, 'StartRaum Light v1')

    this.lightbulbService.getCharacteristic(Characteristic.On)
      .on('get', callbackify(async () => this.light.power))
      .on('set', callbackify((power: boolean) => this.updatePower(power)))

    this.lightbulbService.getCharacteristic(Characteristic.Brightness)
      .on('get', callbackify(async () => this.light.intensity))
      .on('set', callbackify((brightness: number) => this.updateBrightness(brightness)))

    this.lightbulbService.getCharacteristic(Characteristic.Hue)
      .on('get', callbackify(async () => this.light.hue))
      .on('set', callbackify((hue: number) => this.updateHue(hue)))

    this.lightbulbService.getCharacteristic(Characteristic.Saturation)
      .on('get', callbackify(async () => this.light.lightness))
      .on('set', callbackify((saturation: number) => this.updateSaturation(saturation)))

    this.lightbulbService.getCharacteristic(Characteristic.ColorTemperature)
      .on('get', callbackify(async () => {
        const rgb = hsv2rgb({
          hue: this.light.hue,
          saturation: this.light.lightness,
          value: this.light.intensity,
        })
        return rgb2colorTemperature(rgb)
      }))
      .on('set', callbackify((color: number) => this.updateTemperature(color)))
  }

  public getServices() {
    const services = [
      this.informationService,
      this.lightbulbService,
    ]
    return services
  }

  public externalUpdate(update: ExternalUpdate) {
    this.log(`updated light ${this.light.name}: ${JSON.stringify(update)}`)
  }

  private async updatePower(power: boolean) {
    this.light.power = power
    this.update()
  }

  private async updateBrightness(brightness: number) {
    this.light.intensity = brightness
    this.update()
  }

  private async updateHue(hue: number) {
    this.light.hue = hue
    this.update()
  }

  private async updateSaturation(saturation: number) {
    this.light.lightness = saturation
    this.update()
  }

  private async updateTemperature(colorTemperature: number) {
    const rgb = colorTemperature2rgb(colorTemperature)
    const hsv = rgb2hsv(rgb)

    this.light.hue = hsv.hue
    this.light.lightness = hsv.saturation
    this.light.intensity = hsv.value
    this.update()
  }
}
