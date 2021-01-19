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

const DEFAULT_ACTION_ID = '__default__action__id__'

function useApiAction<
  A extends ApiDefinition,
  Group extends keyof A,
  Endpoint extends keyof A[Group],
  TSelected extends WebComponentStateFromEndpoint<A[Group][Endpoint]>,
  Response extends ExtractResponse<A[Group][Endpoint]>,
  Error extends ExtractError<A[Group][Endpoint]>,
  Payload extends ExtractPayload<A[Group][Endpoint]>
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
    /**
     * Initialize the state for this action
     */
    dispatch({ type: actionTypes.INITIALIZE(api.types[group][endpoint]), id })
  }, [id])

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

  const endpointState: TSelected = useSelector((state: any) => {
    if (state.apis) {
      return state.apis?.[api.name]?.[group]?.[endpoint]?.instances?.[id]
    }
    throw new Error('Key "apis" is not defined on the root reducer.')
  })

  return [actionCreator, endpointState]
}

export default useApiAction
