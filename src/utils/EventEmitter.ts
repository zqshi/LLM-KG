/**
 * 浏览器兼容的事件发射器
 * 替代 Node.js 的 events 模块
 */
export class EventEmitter {
  private eventListeners: { [event: string]: Function[] } = {}

  on(event: string, listener: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = []
    }
    this.eventListeners[event].push(listener)
    return this
  }

  emit(event: string, ...args: any[]) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(listener => listener(...args))
    }
    return true
  }

  once(event: string, listener: Function) {
    const wrapper = (...args: any[]) => {
      listener(...args)
      this.off(event, wrapper)
    }
    this.on(event, wrapper)
    return this
  }

  off(event: string, listener: Function) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(l => l !== listener)
    }
    return this
  }

  removeListener(event: string, listener: Function) {
    return this.off(event, listener)
  }

  removeAllListeners(event?: string) {
    if (event) {
      delete this.eventListeners[event]
    } else {
      this.eventListeners = {}
    }
    return this
  }

  listeners(event: string): Function[] {
    return this.eventListeners[event] || []
  }

  listenerCount(event: string): number {
    return this.eventListeners[event]?.length || 0
  }
}