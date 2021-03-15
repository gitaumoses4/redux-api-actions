import {
  ApiActionsDefinition,
  ApiActionTypesDefinition,
  ApiDefinition,
  ApiDefinitionContext,
  ApiEndpointsDefinition,
  ApiGroup,
  ApiReducerDefinition
} from './types'
import reducerBuilder from './reducer.builder'

/**
 * Generates the action creators for an api
 * @param api
 * @param name
 */
function generateActions<A extends ApiDefinition>(api: A, name: string): ApiActionsDefinition<A> {
  const apiActions: any = {}

  const groupNames = Object.keys(api)

  groupNames.forEach(groupName => {
    const group = api[groupName]
    apiActions[groupName] = Object.keys(group).reduce(
      (acc, endpointName) => ({
        ...acc,
        [endpointName]: (...args: any) => ({
          type: `${name}_${groupName}_${endpointName}`,
          payload: args,
          clearErrors: true
        })
      }),
      {}
    )
  })

  return apiActions as ApiActionsDefinition<A>
}

function generateApiActionsGroup(apiGroup: ApiGroup, prefix: string) {
  const endpointNames = Object.keys(apiGroup)

  return endpointNames.reduce((acc, endpointName) => {
    return {
      ...acc,
      [endpointName]: {
        action: prefix + '_' + endpointName,
        api: apiGroup[endpointName]
      }
    }
  }, {}) as any
}

/**
 * Generates a reducer for each group of endpoints
 * @param api
 * @param name
 */
function generateReducers<A extends ApiDefinition>(api: A, name: string): ApiReducerDefinition<A> {
  const groupNames = Object.keys(api)

  return groupNames.reduce((acc, groupName) => {
    return {
      ...acc,
      [groupName]: reducerBuilder(generateApiActionsGroup(api[groupName], `${name}_${groupName}`))
    }
  }, {}) as ApiReducerDefinition<A>
}

/**
 * Generates action types for each endpoint with the format
 *
 * [Api name]_[group name]_[endpoint name]
 * @param api
 * @param name
 */
function generateActionsTypes<A extends ApiDefinition>(api: A, name: string): ApiActionTypesDefinition<A> {
  const groupNames = Object.keys(api)

  return groupNames.reduce((acc, groupName) => {
    return {
      ...acc,
      [groupName]: generateActionTypesForGroup(api[groupName], name + '_' + groupName)
    }
  }, {}) as ApiActionTypesDefinition<A>
}

function generateActionTypesForGroup(apiGroup: ApiGroup, prefix: string) {
  const endpointNames = Object.keys(apiGroup)

  return endpointNames.reduce((acc, endpointName) => {
    return {
      ...acc,
      [endpointName]: prefix + '_' + endpointName
    }
  }, {}) as any
}

/**
 * Generates an object that stores a reference to the group name inside the endpoint.
 * This is used to retrieve the group name majorly for extraction of types.
 *
 * @param api
 */
function generateEndpoints<A extends ApiDefinition>(api: A): ApiEndpointsDefinition<A> {
  const groupNames = Object.keys(api)

  return groupNames.reduce((acc, groupName) => {
    return {
      ...acc,
      [groupName]: generateEndpointsForGroup(api[groupName], groupName)
    }
  }, {}) as ApiEndpointsDefinition<A>
}

function generateEndpointsForGroup(apiGroup: ApiGroup, groupName: string) {
  const endpointNames = Object.keys(apiGroup)

  return endpointNames.reduce((acc, endpointName) => {
    return {
      ...acc,
      [endpointName]: [groupName, endpointName]
    }
  }, {}) as any
}

/**
 * Builds reducers, watchers, actions, types and endpoint definitions from an Api definition.
 *
 * An Api definition contains a group of endpoints.
 *
 * For each endpoint, we generate the corresponding reducer, watcher (saga) and action types.
 * @param api
 * @param name
 */
function buildApiReducer<A extends ApiDefinition>(api: A, name: string): ApiDefinitionContext<A> {
  return {
    actions: generateActions(api, name),
    reducers: generateReducers(api, name),
    types: generateActionsTypes(api, name),
    api: api,
    endpoints: generateEndpoints(api),
    name
  }
}

export default buildApiReducer
