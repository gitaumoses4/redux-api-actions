import { ApiAction, ReducerState, WebComponentState } from './types'
import actions from './utils/actionTypes'

/**
 * Update a single api web component state instance
 *
 * @param initialState
 * @param state
 * @param action
 * @param actionType
 */
function updateInstance<Payload, Data, Error, State extends WebComponentState<Data, Error>>(
  initialState: State,
  state: State = initialState,
  action: ApiAction<Payload, Data, Error>,
  actionType: string
): State | undefined {
  if (action.type === actions.INITIALIZE(actionType) || action.type === actions.CLEAR(actionType)) {
    return initialState
  } else if (action.type === actionType) {
    return {
      ...state,
      data: action.clearData ? null : state.data,
      submitting: true,
      submitted: false,
      fetching: true,
      fetched: false,
      failed: false,
      errors: action.clearErrors ? null : state.errors,
      statusCode: null
    }
  } else if (action.type === actions.SUCCESS(actionType)) {
    return {
      ...state,
      submitted: true,
      submitting: false,
      fetching: false,
      fetched: true,
      data: state.data && action.onNewData ? action.onNewData(state.data, action.payload!) : action.payload,
      errors: action.clearErrors ? null : state.errors,
      failed: false,
      statusCode: action.statusCode
    }
  } else if (action.type === actions.FAILURE(actionType)) {
    return {
      ...state,
      submitted: true,
      fetching: false,
      fetched: false,
      submitting: false,
      errors: action.payload,
      failed: true,
      data: action.clearData ? null : state.data,
      statusCode: action.statusCode
    }
  }
}

/**
 * Generates a reducer for a particular api.
 *
 * @param initialState
 * @param actionType
 */
function createReducer<Payload, Data, Error, State extends WebComponentState<Data, Error>>(
  initialState: State,
  actionType: string
) {
  const initialReducerState = {
    instances: {}
  }

  return (
    state: ReducerState<Data, Error> = initialReducerState,
    action?: ApiAction<Payload, Data, Error>
  ): ReducerState<Data, Error> => {
    if (action?.id) {
      const { id } = action
      const { instances } = state

      const updatedState = updateInstance(initialState, instances[id], action, actionType)

      return updatedState
        ? {
            ...state,
            instances: {
              ...instances,
              [id]: updatedState
            }
          }
        : state
    }
    return state
  }
}

export default createReducer
