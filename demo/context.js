const Context = require('@ppzp/resh/context')
const Session = require('../index')

const get = Session(10000)

module.exports = class extends Context {
  session() {
    return get(this.req, this.res)
  }
}