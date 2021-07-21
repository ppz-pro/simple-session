const Router = require('@ppzp/http-router')
const Resh = require('@ppzp/resh')

const router = Router()
const resh = Resh({ router })

// =========================
const SessionMng = require('@ppzp/simple-session')
const sessionMng = SessionMng({
  duration: 10 * 1000
})

router.add('GET', '/session', function({ response }) {
  sessionMng.debug()
  response.end('session')
})

router.add('GET', '/check', function({ request, response }) {
  const session = sessionMng.get(request, response)
  response.end(session? 'yes':'no')
})

router.add('POST', '/login', async function({ request, response, getJson }) {
  const session = sessionMng.set(request, response)
  session.data = await getJson()
  response.end('login')
})

resh.listen(3000)