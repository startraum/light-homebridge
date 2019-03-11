import LightPlatform, { setup } from './Platform'

export default function(homebridge: any) {
  console.log('SETUP')
  setup(homebridge)
  homebridge.registerPlatform('homebridge-startraumlight', 'StartRaum Light', LightPlatform)
}
