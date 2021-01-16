import { ApiAction, ReducerState, WebComponentState } from './types'
import objectHash from 'object-hash'

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
  if (action.type === `${actionType}_INIT` || action.type === `${actionType}_CLEAR`) {
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
  } else if (action.type === `${actionType}_SUCCESS`) {
    return {
      ...state,
      submitted: true,
      submitting: false,
      data: action.payload,
      errors: action.clearErrors ? null : state.errors,
      failed: false,
      statusCode: action.statusCode
    }
  } else if (action.type === `${actionType}_FAILURE`) {
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
    if (action) {
      const id = action.id || objectHash(action.payload)

      return {
        ...state,
        instances: {
          ...state.instances,
          [id]: updateInstance(initialState, state.instances[id], action, actionType)
        }
      }
    }
    return state
  }
}

export default createReducer
