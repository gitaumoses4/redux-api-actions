import { ApiCall, SagaFunction } from './types';
/**
 * Creates a saga middleware that watches for the api call action and performs the call.
 * It's also responsible for dispatching the success and error actions based on the api response.
 *
 * @param actionType
 * @param endpoint
 */
declare function createMiddleware<Response, Error, Payload extends Array<any>>(actionType: string, endpoint: ApiCall<Response, Error, Payload>): SagaFunction;
export default createMiddleware;
