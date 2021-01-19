import {
  ActionFromReducersMapObject,
  CombinedState,
  combineReducers,
  Middleware,
  MiddlewareAPI,
  Reducer,
  StateFromReducersMapObject
} from 'redux'
import createSagaMiddleware from 'redux-saga'
import { all } from 'redux-saga/effects'
import { ApiDefinition, ApiDefinitionContext, CombinedApiReducers } from './types'

const registerMiddleware = (middleware: Array<IterableIterator<any>>): Middleware => (api: MiddlewareAPI) => {
  const sagaMiddleware = createSagaMiddleware()

  const created = sagaMiddleware(api)

  sagaMiddleware.run(function* () {
    yield all(middleware)
  })

  return created
}

function prepareApiContext<A extends ApiDefinition>(apiContext: ApiDefinitionContext<A>) {
  const reducers: any = {}
  const sagas: IterableIterator<any>[] = []

  Object.keys(apiContext.reducers).forEach((reducerName: any) => {
    const reducer = apiContext.reducers[reducerName]

    reducers[reducerName] = reducer.reducer

    reducer.watchers.forEach(watcher => sagas.push(watcher()))
  })

  return { reducers, sagas }
}

/**
 * Combines multiple Api reducers into  a single middleware and a single reducer.
 *
 * The reducer can now be passed to the store with combineReducers()
 * The middleware can be registered with applyMiddleware()
 *
 * @param apiReducers
 */
function combineApiReducers<R extends Record<string, ApiDefinitionContext<any>>>(
  apiReducers: R
): {
  reducer: Reducer<
    CombinedState<StateFromReducersMapObject<CombinedApiReducers<R>>>,
    ActionFromReducersMapObject<CombinedApiReducers<R>>
  >
  middleware: Middleware<any>
} {
  const combinedReducer: any = {}
  const allSagas: IterableIterator<any>[] = []
  Object.keys(apiReducers).forEach((api: any) => {
    const apiContext = apiReducers[api]

    const { reducers, sagas } = prepareApiContext(apiContext)

    combinedReducer[apiContext.name] = combineReducers(reducers)

    allSagas.push(...sagas)
  })

  return {
    middleware: registerMiddleware(allSagas),
    reducer: combineReducers(combinedReducer as CombinedApiReducers<R>)
  }
}

export default combineApiReducers
