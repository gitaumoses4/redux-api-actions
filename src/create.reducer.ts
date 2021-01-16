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
): State {
  if (action.type === actions.INITIALIZE(actionType) || action.type === actions.CLEAR(actionType)) {
    return initialState
  } else if (action.type === actionType) {
    return {
      ...state,
      data: action.clearData ? null : state.data,
      submitting: true,
      submitted: false,
      failed: false,
      errors: action.clearErrors ? null : state.errors,
      statusCode: null
    }
  } else if (action.type === actions.SUCCESS(actionType)) {
    return {
      ...state,
      submitted: true,
      submitting: false,
      data: action.payload,
      errors: action.clearErrors ? null : state.errors,
      failed: false,
      statusCode: action.statusCode
    }
  } else if (action.type === actions.FAILURE(actionType)) {
    return {
      ...state,
      submitted: true,
      submitting: false,
      errors: action.payload,
      failed: true,
      data: action.clearData ? null : state.data,
      statusCode: action.statusCode
    }
  } else {
    return state
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
    action: ApiAction<Payload, Data, Error>
  ): ReducerState<Data, Error> => {
    if (action?.id) {
      const id = action.id

      if (action.type.endsWith('_INIT') && action.type != actions.INITIALIZE(actionType)) {
        return state
      }

      return {
        ...state,
        instances: {
          ...state.instances,
          [id]: updateInstance(initialState, state.instances[id], action, actionType)
        }
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Action (' + JSON.stringify(action) + ') does not have an ID')
      }
    }
    return state
  }
}

export default createReducer
