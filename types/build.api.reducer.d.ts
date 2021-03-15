import { ApiDefinition, ApiDefinitionContext } from './types';
/**
 * Builds reducers, watchers, actions, types and endpoint definitions from an Api definition.
 *
 * An Api definition contains a group of endpoints.
 *
 * For each endpoint, we generate the corresponding reducer, watcher (saga) and action types.
 * @param api
 * @param name
 */
declare function buildApiReducer<A extends ApiDefinition>(api: A, name: string): ApiDefinitionContext<A>;
export default buildApiReducer;
