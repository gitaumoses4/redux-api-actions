import {
  ApiAction,
  ApiDefinition,
  ApiDefinitionContext,
  ApiEndpointsDefinition,
  ExtractError,
  ExtractPayload,
  ExtractResponse,
  UseApiAction,
  WebComponentStateFromEndpoint
} from '../types'
import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useEffect, useState } from 'react'
import actionTypes from '../utils/actionTypes'
import { DEFAULT_ACTION_ID } from '../utils/actions'
import initialState from '../utils/initialState'

function useApiAction<
  A extends ApiDefinition,
  Group extends keyof A,
  Endpoint extends keyof A[Group],
  TSelected extends WebComponentStateFromEndpoint<A[Group][Endpoint]> = WebComponentStateFromEndpoint<
    A[Group][Endpoint]
  >,
  Response extends ExtractResponse<A[Group][Endpoint]> = ExtractResponse<A[Group][Endpoint]>,
  Error extends ExtractError<A[Group][Endpoint]> = ExtractError<A[Group][Endpoint]>,
  Payload extends ExtractPayload<A[Group][Endpoint]> = ExtractPayload<A[Group][Endpoint]>
>(
  api: ApiDefinitionContext<A>,
  getEndpoint: (api: ApiEndpointsDefinition<A>) => [Group, Endpoint],
  actionParams?: { [n in keyof ApiAction<any, any, any>]?: any }
): UseApiAction<Response, Error, Payload, A[Group][Endpoint], TSelected> {
  const dispatch = useDispatch()
  const [id, setId] = useState(DEFAULT_ACTION_ID)

  const [group, endpoint] = getEndpoint(api.endpoints)
  const action = api.actions[group][endpoint]

  useEffect(() => {
    if (actionParams?.id) {
      setId(actionParams.id)
    }
  }, [actionParams])

  const clearState = useCallback(
    (actionId?: string) => {
      return dispatch({ id: actionId || id, type: actionTypes.CLEAR(api.types[group][endpoint]) })
    },
    [id]
  )

  const actionCreator: any = useCallback(
    (...args: Payload) => {
      return dispatch({ id, ...action(...(args as Array<any>)), ...(actionParams || {}) })
    },
    [actionParams, action, id]
  )

  const endpointState = useSelector((state: any) => {
    if (state.apis) {
      const instanceState = state.apis?.[api.name]?.[group]?.[endpoint]?.instances?.[id]
      if (instanceState) {
        return instanceState
      } else {
        dispatch({ type: actionTypes.INITIALIZE(api.types[group][endpoint]), id })
        return initialState
      }
    }
    throw new Error('Key "apis" is not defined on the root reducer.')
  })

  return [actionCreator, endpointState, clearState]
}

export default useApiAction
