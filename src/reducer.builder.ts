import { ReduxApiActionGroup, ReduxApiActionGroupState, SagaFunction } from './types'
import { combineReducers, Reducer, ReducersMapObject } from 'redux'
import createReducer from './create.reducer'
import createMiddleware from './create.middleware'
import initialState from './utils/initialState'

function reducerBuilder<T extends ReduxApiActionGroup>(
  apiActionGroup: T
): {
  reducer: Reducer<ReduxApiActionGroupState<T>>
  watchers: Array<SagaFunction>
} {
  const reducers: ReducersMapObject = {}

  const watchers: Array<SagaFunction> = []

  Object.keys(apiActionGroup).forEach((name: any) => {
    const apiAction = apiActionGroup[name]

    reducers[name] = createReducer(initialState, apiAction.action)

    watchers.push(createMiddleware(apiAction.action, apiAction.api))
  })

  return {
    reducer: combineReducers(reducers),
    watchers
  }
}

export default reducerBuilder
