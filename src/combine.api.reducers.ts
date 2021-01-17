import { Middleware, MiddlewareAPI } from 'redux'
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga'
import { all } from 'redux-saga/effects'

const registerMiddleware = (middleware: Array<IterableIterator<any>>): Middleware => (api: MiddlewareAPI) => {
  const sagaMiddleware = createSagaMiddleware()

  const created = sagaMiddleware(api)

  sagaMiddleware.run(function* () {
    yield all(middleware)
  })

  return created
}

function combineApiReducers() {

}

export default combineApiReducers
