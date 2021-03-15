import { ApiDefinition, ApiDefinitionContext, CreateApiActions, MapActions } from './types';
import * as React from 'react';
declare function apiConnector<A extends ApiDefinition, Actions extends MapActions<A>>(api: ApiDefinitionContext<A>, mapActions: Actions): <OuterProps>(Comp: React.ComponentType<OuterProps & Record<keyof ReturnType<Actions>, (actionParams?: {
    payload?: any;
    onSuccess?: import("./types").ApiListener<any, any> | undefined;
    onError?: import("./types").ApiListener<any, any> | undefined;
    statusCode?: number | undefined;
    id?: string | undefined;
    clearData?: boolean | undefined;
    clearErrors?: boolean | undefined;
    errorHandler?: import("./types").ApiErrorHandler<any> | undefined;
    type?: any;
} | undefined) => import("./types").UseApiAction<import("./types").ExtractResponse<A[ReturnType<Actions>[keyof ReturnType<Actions>] extends [infer Group, any] ? Group : never][ReturnType<Actions>[keyof ReturnType<Actions>] extends [any, infer Endpoint] ? Endpoint : never]>, import("./types").ExtractError<A[ReturnType<Actions>[keyof ReturnType<Actions>] extends [infer Group, any] ? Group : never][ReturnType<Actions>[keyof ReturnType<Actions>] extends [any, infer Endpoint] ? Endpoint : never]>, import("./types").ExtractPayload<A[ReturnType<Actions>[keyof ReturnType<Actions>] extends [infer Group, any] ? Group : never][ReturnType<Actions>[keyof ReturnType<Actions>] extends [any, infer Endpoint] ? Endpoint : never]>, A[ReturnType<Actions>[keyof ReturnType<Actions>] extends [infer Group, any] ? Group : never][ReturnType<Actions>[keyof ReturnType<Actions>] extends [any, infer Endpoint] ? Endpoint : never], import("./types").WebComponentStateFromEndpoint<A[ReturnType<Actions>[keyof ReturnType<Actions>] extends [infer Group, any] ? Group : never][ReturnType<Actions>[keyof ReturnType<Actions>] extends [any, infer Endpoint] ? Endpoint : never]>>>>) => (props: OuterProps) => JSX.Element;
export default apiConnector;
