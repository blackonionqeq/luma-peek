export type EventHandler = (...args: any[]) => void

export class Emitter {
  private listeners = new Map<string, Set<EventHandler>>()

  on(event: string, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)
    return () => this.off(event, handler)
  }

  off(event: string, handler: EventHandler): void {
    this.listeners.get(event)?.delete(handler)
  }

  emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach((handler) => handler(...args))
  }

  clear(): void {
    this.listeners.clear()
  }
}
