import { ApiDefinition, ApiDefinitionContext, CreateApiActions, MapActions } from './types'
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
): CreateApiActions<A, Actions> {
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
  Comp: React.ComponentType<OuterProps & CreateApiActions<A, Actions>>,
  api: ApiDefinitionContext<A>,
  mapActions: Actions
) {
  return function (props: OuterProps) {
    return <Comp {...props} {...createApiActions(api, mapActions)} />
  }
}

function apiConnector<A extends ApiDefinition, Actions extends MapActions<A>>(
  api: ApiDefinitionContext<A>,
  mapActions: Actions
) {
  return function <OuterProps>(Comp: React.ComponentType<OuterProps & CreateApiActions<A, Actions>>) {
    return connectApi<OuterProps, A, Actions>(Comp, api, mapActions)
  }
}

export default apiConnector
