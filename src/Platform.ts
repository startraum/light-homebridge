import { debounce } from 'lodash'
import LightNode from './Node'
import manager, { Light } from './manager'

export { setup } from './Node'

interface Config {} // tslint:disable-line no-empty-interface

export default class LightPlatform {
  private log: (msg: string) => void
  private config: Config
  private lights: { [key: string]: LightNode } = {}
  private newLightPromise?: Promise<void>
  private newLightsReceived?: () => void
  private initLights = debounce(() => {
    if (this.newLightsReceived) this.newLightsReceived()
  }, 100)

  constructor(log: (msg: string) => void, config: Config) {
    this.log = log
    this.config = config

    manager.getLights().map(light => this.addLight(light))
    manager.on('update', (light: Light) => {
      this.addLight(light)
    })
  }

  public async accessories(callback: (lights: LightNode[]) => void) {
    if (!this.newLightPromise) {
      this.newLightPromise = new Promise(resolve => {
        this.newLightsReceived = resolve
      })
    }
    await this.newLightPromise
    const lights = Object.keys(this.lights).map(id => this.lights[id])
    console.log('get accessories', lights.length)
    callback(lights)
  }

  private addLight(light: Light) {
    if (!this.lights[light.id]) {
      this.lights[light.id] = new LightNode(this.log, light)
    }
    this.lights[light.id].externalUpdate({
      name: light.name,
      hue: light.hue,
      lightness: light.lightness,
      power: light.power,
      intensity: light.intensity,
    })
    this.initLights()
  }
}
