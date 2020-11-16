
interface Deps {
  [key : string]: any
}

type IHandle = (...args: any[]) => any 

export default class CustomEvent {
  public deps: Deps = {
  };
  constructor() {
  }

  on(eventName: string, handle: IHandle ): IHandle {
    if( !this.deps[eventName]) this.deps[eventName] = []
    this.deps[eventName].push(handle)

    return () => this.remove(eventName, handle)
  }

  emit(eventName: string, ...args: any[]): void {
    if( Array.isArray(this.deps[eventName]) ) {
      this.deps[eventName].forEach((fn: IHandle) => fn.apply(null, args))
    }
  }

  remove(eventName: string, fn: IHandle) {
    this.deps[eventName] = this.deps[eventName].filter((fnItem: IHandle) => fnItem !== fn )
  }
  
}


