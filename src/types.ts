import { Action, CombinedState, Reducer } from 'redux'
import { AxiosError, AxiosResponse } from 'axios'
import * as React from 'react'

/**
 * A web component state represents the reducer state for each api call.
 *
 */
export interface WebComponentState<Data = any, Error = any> {
  submitting: boolean
  submitted: boolean
  fetching: boolean
  fetched: boolean
  data: Data
  errors: Error
  failed: boolean
  statusCode: number
}

/**
 * An object to store all api reducer instances for each api call.
 *
 * Since an api may have different request payloads, and responses,
 * we need to keep all these instances in one reducer.
 */
export interface ReducerState<Data = any, Error = any> {
  instances: Record<string, WebComponentState<Data, Error>>
}

/**
 * A callback to an action when the api request is completed.
 */
export type ApiListener<Payload = any, Response = any> = (response: Response, request: Payload) => void

/**
 * An action is represented as an object that is passed to the reducer from an api call action.
 */
export interface ApiAction<Payload = any, Response = any, Error = any> extends Action {
  payload?: Payload
  onSuccess?: ApiListener<Payload, Response>
  onError?: ApiListener<Payload, Error>
  statusCode?: number
  id?: string
  clearData?: boolean // clear the existing data when the api call made.
  clearErrors?: boolean // clear the existing errors when the api call is made.
  errorHandler?: ApiErrorHandler<Error>
  onNewData?: (prevState: Response, newState: Payload) => Payload
}

/**
 * An action creator that returns an ApiAction
 */
export type ApiActionCreator<Payload extends Array<any> = any, Response = any, Error = any> = (
  ...args: Payload
) => ApiAction<Payload, Response, Error>

/**
 * A function that represents an API call
 */
export type ApiCall<Response = any, Error = any, Args extends Array<any> = Array<any>> = (
  ...args: Args
) => Promise<AxiosResponse<Response | Error>>

/**
 * Extracts the response from the api call
 */
export type ExtractResponse<A> = A extends ApiCall<infer Response, any, any> ? Response : never

/**
 * Extracts the error from an api call
 */
export type ExtractError<A> = A extends ApiCall<any, infer Error, any> ? Error : never

/**
 * Extracts the payload from an api call
 */
export type ExtractPayload<A> = A extends ApiCall<any, any, infer Payload> ? Payload : never

/**
 * A representation of a Generator Function
 */
export type SagaFunction = () => IterableIterator<any>

/**
 * Handles API errors
 */
export type ApiErrorHandler<Error> = (error: AxiosError) => Error

/**
 * Definition for an API reducer
 */
export type ApiReducer<Payload = any, Response = any, Error = any, State = ReducerState<Response, Error>> = (
  state: State,
  action: ApiAction<Payload, Response, Error>
) => State

/**
 * Definition for a redux API action
 * This gives the type of the action and the api call to be made for this type.
 */
export interface ReduxApiAction<Payload extends Array<any> = Array<any>, Response = any, Error = any> {
  action: string
  api: ApiCall<Response, Error, Payload>
}

/**
 * An object containing a list of redux api actions
 */
export interface ReduxApiActionGroup {
  [name: string]: ReduxApiAction<any, any, any>
}

type ExtractReducerState<T> = T extends ReduxApiAction<any, infer Response, infer Error>
  ? ReducerState<Response, Error>
  : any

/**
 * Extract the state from a redux api action group
 */
export type ReduxApiActionGroupState<T extends ReduxApiActionGroup = any> = {
  [K in keyof T]: ExtractReducerState<T[K]>
}

/**
 * Definition for a reducer built from an api action group
 */
export type BuiltReducer<T extends ReduxApiActionGroup> = {
  reducer: Reducer<ReduxApiActionGroupState<T>>
  watchers: Array<SagaFunction>
}

/**
 * A structure for the definition of a single api endpoint.
 */
export type ApiEndpoint<Response = any, Error = any, Args extends Array<any> = Array<any>> = ApiCall<
  Response,
  Error,
  Args
>

/**
 * A structure for the definition of a group of api endpoints.
 */
export type ApiGroup = Record<string, ApiEndpoint<any, any, any>>

/**
 * A structure for the definition of api endpoints.
 */
export interface ApiDefinition {
  [group: string]: ApiGroup
}

/**
 * Defines the corresponding Api actions for an api definition
 */
export type ApiActionsDefinition<A extends ApiDefinition> = {
  [Group in keyof A]: {
    [Endpoint in keyof A[Group]]: A[Group][Endpoint] extends ApiCall<infer Response, infer Error, infer Args>
      ? ApiActionCreator<Args, Response, Error>
      : never
  }
}

/**
 * Defines the corresponding api action types for an api definition
 */
export type ApiActionTypesDefinition<A extends ApiDefinition> = {
  [Group in keyof A]: {
    [Endpoint in keyof A[Group]]: string
  }
}

export type ApiReducerDefinition<A extends ApiDefinition> = {
  [Group in keyof A]: BuiltReducer<
    {
      [Endpoint in keyof A[Group]]: A[Group][Endpoint] extends ApiCall<infer Response, infer Error, infer Args>
        ? ReduxApiAction<Args, Response, Error>
        : never
    }
  >
}

type ExtractBuiltReducerState<T> = T extends { reducer: Reducer<infer U> } ? U : never

export type ApiEndpointsDefinition<A extends ApiDefinition> = {
  [Group in keyof A]: {
    [Endpoint in keyof A[Group]]: [Group, Endpoint]
  }
}

/**
 * Constructed from building an Api. It provides the reducers for each group, actions for each endpoint and types for each endpoint.
 */
export type ApiDefinitionContext<A extends ApiDefinition> = {
  reducers: ApiReducerDefinition<A>
  actions: ApiActionsDefinition<A>
  types: ApiActionTypesDefinition<A>
  api: A
  name: string
  endpoints: ApiEndpointsDefinition<A>
}

type ExtractReducers<A extends ApiDefinitionContext<any>> = A extends { reducers: infer U } ? U : never

type ExtractApiReducerDefinitionState<A extends ApiDefinitionContext<any>, R = ExtractReducers<A>> = {
  [Group in keyof R]: ExtractBuiltReducerState<R[Group]>
}

/**
 * An object containing multiple api definition contexts.
 */
export interface MultipleApiReducers {
  [name: string]: ApiDefinitionContext<any>
}

/**
 * Creates a ReducerMapObject from multiple api reducers.
 */
export type CombinedApiReducers<M extends MultipleApiReducers, api extends keyof M = keyof M> = {
  [name: string]: Reducer<CombinedState<ExtractApiReducerDefinitionState<M[api]>>>
}

/**
 * Creates a WebComponentState from an ApiCall definition
 */
export type WebComponentStateFromEndpoint<T> = T extends ApiCall<infer Response, infer Error>
  ? WebComponentState<Response, Error>
  : never

/**
 * return type for the useApiAction hook.
 *
 * It returns an array with two items:
 * -> The api action creator
 * -> The redux state for that api action.
 */
export type UseApiAction<
  Response = any,
  Error = any,
  Payload extends Array<any> = Array<any>,
  A extends ApiCall<Response, Error, Payload> = ApiCall<Response, Error, Payload>,
  State = any
> = [(...args: Parameters<A>) => ApiAction<Payload, Response, Error>, State, (id?: string) => Action]

/**
 * Actions to be mapped to a component's props
 */
export type MapActions<A extends ApiDefinition> = (api: ApiEndpointsDefinition<A>) => Record<string, [any, any]>

type ExtractGroup<T> = T extends [infer Group, any] ? Group : never

type ExtractEndpoint<T> = T extends [any, infer Endpoint] ? Endpoint : never

/**
 * The props generated after connecting a component to an API
 */
export type CreateApiActions<
  A extends ApiDefinition = any,
  Actions extends MapActions<A> = MapActions<any>,
  MappedActions extends ReturnType<Actions> = ReturnType<Actions>,
  K extends keyof MappedActions = keyof MappedActions,
  Group extends ExtractGroup<MappedActions[K]> = ExtractGroup<MappedActions[K]>,
  Endpoint extends ExtractEndpoint<MappedActions[K]> = ExtractEndpoint<MappedActions[K]>,
  Response extends ExtractResponse<A[Group][Endpoint]> = ExtractResponse<A[Group][Endpoint]>,
  Error extends ExtractError<A[Group][Endpoint]> = ExtractError<A[Group][Endpoint]>,
  Payload extends ExtractPayload<A[Group][Endpoint]> = ExtractPayload<A[Group][Endpoint]>,
  TSelected extends WebComponentStateFromEndpoint<A[Group][Endpoint]> = WebComponentStateFromEndpoint<
    A[Group][Endpoint]
  >
> = Record<
  K,
  (
    actionParams?: { [n in keyof ApiAction<any, any, any>]?: ApiAction<any, any, any>[n] }
  ) => UseApiAction<Response, Error, Payload, A[Group][Endpoint], TSelected>
>

export type ApiConnectedProps<T> = T extends (Comp: React.ComponentType<infer U>) => any ? U : never
