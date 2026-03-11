/**
 * WebSocket 封装 — 自动重连 + 事件订阅
 */
export class WsClient {
  constructor (url, options = {}) {
    this.url = url
    this.options = {
      reconnectDelay: 3000,
      maxReconnectAttempts: 10,
      ...options
    }
    this.ws = null
    this.reconnectAttempts = 0
    this.reconnectTimer = null
    this.listeners = {}
    this.closed = false
  }

  connect () {
    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log('[WS] Connected:', this.url)
        this.reconnectAttempts = 0
        this._emit('open')
      }

      this.ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          this._emit('message', data)
          if (data.type) this._emit(data.type, data)
        } catch {
          this._emit('message', e.data)
        }
      }

      this.ws.onerror = (e) => {
        console.warn('[WS] Error:', e)
        this._emit('error', e)
      }

      this.ws.onclose = () => {
        console.log('[WS] Closed')
        this._emit('close')
        if (!this.closed) this._scheduleReconnect()
      }
    } catch (e) {
      console.error('[WS] Connect failed:', e)
      this._scheduleReconnect()
    }
  }

  _scheduleReconnect () {
    if (this.closed) return
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.warn('[WS] Max reconnect attempts reached')
      return
    }
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      console.log(`[WS] Reconnecting... attempt ${this.reconnectAttempts}`)
      this.connect()
    }, this.options.reconnectDelay)
  }

  on (event, handler) {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event].push(handler)
    return () => this.off(event, handler)
  }

  off (event, handler) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(h => h !== handler)
    }
  }

  _emit (event, data) {
    (this.listeners[event] || []).forEach(h => h(data))
  }

  send (data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data))
    }
  }

  disconnect () {
    this.closed = true
    clearTimeout(this.reconnectTimer)
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// 单例工厂
let _instance = null
export function getWsClient (url) {
  if (_instance) _instance.disconnect()
  _instance = new WsClient(url)
  return _instance
}
