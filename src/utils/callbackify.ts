type Callback = (err: any, result?: any) => void

export default function callbackify(func: (...args: any[]) => Promise<any>): Callback {
  return (...args: any[]) => {
    const onlyArgs: any[] = []
    let maybeCallback: Callback | null = null

    for (const arg of args) {
      if (typeof arg === 'function') {
        maybeCallback = arg
        break
      }

      onlyArgs.push(arg)
    }

    if (!maybeCallback) {
      throw new Error('Missing callback parameter!')
    }

    const callback = maybeCallback

    func(...onlyArgs)
      .then((data: any) => callback(null, data))
      .catch((err: any) => callback(err))
  }
}
