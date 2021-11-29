const Resh = require('@ppzp/resh')
const Context = require('./context')

const app = new Resh({
  Context
})

app.controller.get('/test', function(ctx) {
  const session = ctx.session()
  if(session.index)
    session.index ++
  else
    session.index = 1
  return session
})

app.start(8080)