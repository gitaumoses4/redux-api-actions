import { Action } from 'redux'
import { AxiosError } from 'axios'
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
