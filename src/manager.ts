import { EventEmitter } from 'events'
import { Publisher, Subscriber } from 'cote'

export interface Color {
  hue: number
  lightness: number
  intensity?: number
  colorCode?: string
}

export interface Light {
  id: string
  name: string
  hue: number
  lightness: number
  power: boolean
  intensity: number
  animation: boolean
}

export interface LightUpdate {
  hue?: number
  lightness?: number
  power?: boolean
  intensity?: number
}

interface LightEvent extends Event {
  light: Light
}

interface LightUpdateEvent extends Event {
  id: string
  update: LightUpdate
}

const lights: { [key: string]: Light } = {}
if (process.env.NODE_ENV !== 'production') {
  lights.default = {
    name: 'default',
    id: 'default',
    hue: 0,
    lightness: 0,
    intensity: 0,
    power: true,
    animation: false,
  }
}

class LightManager extends EventEmitter {
  private lights: { [key: string]: Light } = {}
  private subscriber = new Subscriber({ name: 'lightsBroadcast' })
  private publisher = new Publisher({ name: 'lightsBroadcast' })

  constructor() {
    super()
    this.subscriber.on('light', (event: LightEvent) => {
      this.lights[event.light.id] = event.light
      console.log('receive', event.light)
      this.emit('update', event.light)
    })
  }

  public update(id: string, lightUpdate: LightUpdate, updateNode = true) {
    lights[id] = { ...lights[id], ...lightUpdate }
    if (!updateNode) return

    console.log('send', id, lightUpdate)

    // @ts-ignore
    this.publisher.publish<LightUpdateEvent>('update', { id, update: lightUpdate })
  }

  public getLights() {
    return Object.keys(lights).reduce((arr: Light[], id) => [...arr, lights[id]], [])
  }

  public getLight(id: string) {
    return lights[id]
  }
}

export default new LightManager()
