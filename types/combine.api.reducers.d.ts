import { ActionFromReducersMapObject, CombinedState, Middleware, Reducer, StateFromReducersMapObject } from 'redux';
import { ApiDefinitionContext, CombinedApiReducers } from './types';
/**
 * Combines multiple Api reducers into  a single middleware and a single reducer.
 *
 * The reducer can now be passed to the store with combineReducers()
 * The middleware can be registered with applyMiddleware()
 *
 * @param apiReducers
 */
declare function combineApiReducers<R extends Record<string, ApiDefinitionContext<any>>>(apiReducers: R): {
    reducer: Reducer<CombinedState<StateFromReducersMapObject<CombinedApiReducers<R>>>, ActionFromReducersMapObject<CombinedApiReducers<R>>>;
    middleware: Middleware<any>;
};
export default combineApiReducers;
