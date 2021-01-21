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
import objectHash from 'object-hash'
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
  const [endpointState, setEndpointState] = useState(initialState as any)
  const instances = useSelector((state: any) => {
    if (state.apis) {
      return state.apis?.[api.name]?.[group]?.[endpoint]?.instances
    }
    throw new Error('Key "apis" is not defined on the root reducer.')
  })

  const [group, endpoint] = getEndpoint(api.endpoints)
  const action = api.actions[group][endpoint]

  useEffect(() => {
    /**
     * Initialize the state for this action
     */
    console.log(instances?.[id])
    if (!instances?.[id]) {
      dispatch({ type: actionTypes.INITIALIZE(api.types[group][endpoint]), id })
    } else {
      setEndpointState(instances?.[id])
    }
  }, [id])

  const clearState = useCallback(
    (actionId?: string) => {
      return dispatch({ id: actionId || id, type: actionTypes.CLEAR(api.types[group][endpoint]) })
    },
    [id]
  )

  const actionCreator = useCallback(
    (...args: Payload) => {
      const argsHash = objectHash(args)
      if (argsHash != id) {
        setId(argsHash)
      }
      return dispatch({ id: argsHash, ...action(...(args as Array<any>)), ...(actionParams || {}) })
    },
    [actionParams, action, id]
  )

  return [actionCreator, endpointState, clearState]
}

export default useApiAction
