import createSagaMiddleware from 'redux-saga'
import { Reducer } from 'redux'
import { SagaFunction } from '../../src/types'
import { all } from 'redux-saga/effects'
import configureMockStore from 'redux-mock-store'

function createMockStore<S>(reducer: Reducer, middleware: Array<SagaFunction>, initialState?: S) {
  const sagaMiddleware = createSagaMiddleware()

  const mockStore = configureMockStore([sagaMiddleware])

  const store = mockStore((actions: any) =>
    actions.reduce((acc: any, cur: any) => {
      return reducer(acc, cur)
    }, initialState)
  )

  sagaMiddleware.run(function* () {
    yield all(middleware.map(m => m()))
  })

  return store
}

export default createMockStore
