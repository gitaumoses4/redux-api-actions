import { ApiAction, ReducerState, WebComponentState } from './types';
/**
 * Generates a reducer for a particular api.
 *
 * @param initialState
 * @param actionType
 */
declare function createReducer<Payload, Data, Error, State extends WebComponentState<Data, Error>>(initialState: State, actionType: string): (state?: ReducerState<Data, Error>, action?: ApiAction<Payload, Data, Error> | undefined) => ReducerState<Data, Error>;
export default createReducer;
