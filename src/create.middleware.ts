import { ApiAction, ApiCall, SagaFunction } from './types'
import { call, put, takeLatest } from 'redux-saga/effects'
import { AxiosResponse } from 'axios'
import handleApiError from './handle.api.error'

/**
 * Creates a saga middleware that watches for the api call action and performs the call.
 * It's also responsible for dispatching the success and error actions based on the api response.
 *
 * @param actionType
 * @param endpoint
 */
function createMiddleware<Response, Error, Payload extends Array<any>>(
  actionType: string,
  endpoint: ApiCall<Response>
): SagaFunction {
  function* makeApiCall(action: ApiAction<Payload, Response, Error>): IterableIterator<any> {
    const args = (action.payload || []) as Payload
    const id = action.id

    try {
      const response: AxiosResponse<Response> = ((yield call(endpoint, ...args)) as never) as AxiosResponse<Response>
      if (response) {
        const data = response.data

        if (action.onSuccess) {
          action.onSuccess(data, args)
        }

        yield put({
          id,
          type: `${actionType}_SUCCESS`,
          payload: data,
          statusCode: response.status
        })
      }
    } catch (error) {
      const errorHandler = action.errorHandler || handleApiError

      const data = errorHandler(error)

      if (action.onError) {
        action.onError(data, args)
      }

      yield put({
        id,
        type: `${actionType}_FAILURE`,
        payload: data,
        statusCode: error?.response?.status || 500
      })
    }
  }

  function* watchForAction(): IterableIterator<any> {
    yield takeLatest(actionType, makeApiCall)
  }

  return watchForAction
}

export default createMiddleware
