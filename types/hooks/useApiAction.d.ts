import { ApiAction, ApiDefinition, ApiDefinitionContext, ApiEndpointsDefinition, ExtractError, ExtractPayload, ExtractResponse, UseApiAction, WebComponentStateFromEndpoint } from '../types';
declare function useApiAction<A extends ApiDefinition, Group extends keyof A, Endpoint extends keyof A[Group], TSelected extends WebComponentStateFromEndpoint<A[Group][Endpoint]> = WebComponentStateFromEndpoint<A[Group][Endpoint]>, Response extends ExtractResponse<A[Group][Endpoint]> = ExtractResponse<A[Group][Endpoint]>, Error extends ExtractError<A[Group][Endpoint]> = ExtractError<A[Group][Endpoint]>, Payload extends ExtractPayload<A[Group][Endpoint]> = ExtractPayload<A[Group][Endpoint]>>(api: ApiDefinitionContext<A>, getEndpoint: (api: ApiEndpointsDefinition<A>) => [Group, Endpoint], actionParams?: {
    [n in keyof ApiAction<any, any, any>]?: any;
}): UseApiAction<Response, Error, Payload, A[Group][Endpoint], TSelected>;
export default useApiAction;
