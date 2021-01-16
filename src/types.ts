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
export type ApiCall<Data, Args extends Array<any> = Array<any>> = (...args: Args) => Promise<Data>

/**
 * A representation of a Generator Function
 */
export type SagaFunction = () => IterableIterator<any>

export type ApiErrorHandler<Error> = (error: AxiosError) => Error
