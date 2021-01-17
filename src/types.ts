import { Action, Reducer } from 'redux'
import { AxiosError } from 'axios'

/**
 * Return the argument types for a function
 */
export type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never

/**
 * A web component state represents the reducer state for each api call.
 *
 */
export interface WebComponentState<Data, Error> {
  submitting: boolean
  submitted: boolean
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
export interface ReducerState<Data, Error> {
  instances: Record<string, WebComponentState<Data, Error>>
}

/**
 * A callback to an action when the api request is completed.
 */
export type ApiListener<Payload, Response> = (response: Response, request: Payload) => void

/**
 * An action is represented as an object that is passed to the reducer from an api call action.
 */
export interface ApiAction<Payload, Response, Error> extends Action {
  payload?: Payload
  onSuccess?: ApiListener<Payload, Response>
  onError?: ApiListener<Payload, Error>
  statusCode?: number
  id?: string
  clearData?: boolean // clear the existing data when the api call made.
  clearErrors?: boolean // clear the existing errors when the api call is made.
  errorHandler?: ApiErrorHandler<Error>
}

/**
 * An action creator that returns an ApiAction
 */
export type ApiActionCreator<Payload extends Array<any>, Response, Error> = (
  ...args: Payload
) => ApiAction<Payload, Response, Error>

/**
 * A function that represents an API call
 */
export type ApiCall<Response, Error, Args extends Array<any> = Array<any>> = (
  ...args: Args
) => Promise<Response | Error>

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
export type ApiReducer<Payload, Response, Error, State = ReducerState<Response, Error>> = (
  state: State,
  action: ApiAction<Payload, Response, Error>
) => State

/**
 * Definition for a redux API action
 * This gives the type of the action and the api call to be made for this type.
 */
export interface ReduxApiAction<Payload extends Array<any>, Response, Error> {
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
export type ReduxApiActionGroupState<T extends ReduxApiActionGroup> = {
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
export type ApiEndpoint<Response, Error, Args extends Array<any>> = ApiCall<Response, Error, Args>

/**
 * A structure for the definition of a group of api endpoints.
 */
export type ApiGroup = Record<string, ApiEndpoint<any, any, any>>

/**
 * A structure for the definition of api endpoints.
 */
export type ApiDefinition = Record<string, ApiGroup>

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

export type ApiEndpointsDefinition<A extends ApiDefinition> = {
  [Group in keyof A]: {
    [Endpoint in keyof A[Group]]: [Group, Endpoint]
  }
}

export type ApiDefinitionContext<A extends ApiDefinition> = {
  reducers: ApiReducerDefinition<A>
  actions: ApiActionsDefinition<A>
  types: ApiActionTypesDefinition<A>
  name: string
  endpoints: ApiEndpointsDefinition<A>
}
