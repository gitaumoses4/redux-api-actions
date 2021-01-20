import { ApiDefinition, ApiDefinitionContext, ConnectedApiProps, MapActions } from './types'
import * as React from 'react'
import useApiAction from './hooks/useApiAction'

function createApiAction<A extends ApiDefinition, Group extends keyof A, Endpoint extends keyof A[Group]>(
  api: ApiDefinitionContext<A>,
  group: Group,
  endpoint: Endpoint
) {
  return (actionParams: any) => useApiAction(api, () => [group, endpoint], actionParams)
}

function createApiActions<A extends ApiDefinition, Actions extends MapActions<A>>(
  api: ApiDefinitionContext<A>,
  mapActions: Actions
): ConnectedApiProps<A> {
  const actions = mapActions(api.endpoints)
  return Object.keys(actions).reduce((acc, action: any) => {
    const [group, endpoint] = actions[action]
    return {
      ...acc,
      [action]: createApiAction(api, group, endpoint)
    }
  }, {}) as any
}

function connectApi<OuterProps, A extends ApiDefinition, Actions extends MapActions<A>>(
  Comp: React.ComponentType<OuterProps>,
  api: ApiDefinitionContext<A>,
  mapActions: Actions
) {
  return (props: OuterProps) => <Comp {...props} {...createApiActions(api, mapActions)} />
}

export default connectApi
