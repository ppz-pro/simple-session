const Cookie = require('cookie')

module.exports = function({
  duration = 2 * 60 * 60 * 1000,
  log = console
} = {}) {
  log.debug('会话过期时间为', duration, 'ms')
  const map = {}
  return {
    get(req, res) {
      const token = getToken(req)
      const session = map[token]
      if(!session) return

      writeToken(res, token) // 更新给前端
      log.debug('删除定时器')
      clearTimeout(session.timer) // 删除老的定时器
      session.timer = getTimer(token) // 设置新的定时器
      return session.data
    },
    set(req, res) {
      let token = getToken(req)
      if(token && map[token]) {
        log.debug('删除定时器')
        clearTimeout(map[token].timer)
        delete map[token]
      }

      token = new Date().getTime + Math.random()
      const data = {}
      map[token] = {
        timer: getTimer(token),
        data
      }
      writeToken(res, token) // 更新给前端
      return data
    },
    debug() {
      log.debug('simple session debug', ...(Object.values(map).map( item => item.data )))
    }
  }

  function writeToken(response, token) {
    log.debug('写入 token')
    const expireAt = new Date(new Date().getTime() + duration).toUTCString()
    response.setHeader('Set-Cookie', `token=${token};path=/;httpOnly;expires=${expireAt}`)
  }
  
  function getTimer(token) {
    log.debug('新定时器')
    return setTimeout(function(){
      delete map[token]
    }, duration)
  }

  function getToken(req) {
    return req && req.headers && req.headers.cookie && Cookie.parse(req.headers.cookie).token
  }
}
