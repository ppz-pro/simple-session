const Cookie = require('cookie')
const { v4: UUID } = require('uuid')
const Events = require('events')

module.exports = function SessionManager(duration = 2 * 60 * 60 * 1000) {
  if(typeof duration != 'number')
    throw Error("参数 duration 格式不正确，需满足 typeof duration == 'number'")
  
  /** @type {Record<string, Session} */
  const data = {}

  return function(req, res) {
    // 取出 id
    if(!req || !req.headers)
      throw Error('req 对象不合法')
    if(req.headers.cookie)
      var id = Cookie.parse(req.headers.cookie).id
    // 找到对应 session
    const session = data[id]
    // 没有 id 或 session 就创建
    if(!id || !session) {
      const session = new Session(duration, res)
      data[session.id] = session
      session.on('expired', () => {
        delete data[session.id]
      })
      return session.data
    }
    
    session.refresh(res)
    return session.data
  }
}

class Session extends Events {
  constructor(duration, res) {
    super()
    this.duration = duration
    this.data = {}
    this.id = UUID()
    this.refresh(res)
  }
  
  refresh(res) {
    this.lastRefresh = new Date()
    clearTimeout(this.timer)
    // 让前端定时
    const expireAt = new Date(this.lastRefresh.getTime() + this.duration).toUTCString()
    res.setHeader('Set-Cookie', `id=${this.id};path=/;httpOnly;expires=${expireAt}`)
    // 保证自己的定时
    this.timer = setTimeout(() => {
      this.emit('expired')
    }, this.duration)
  }
}