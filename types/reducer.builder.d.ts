import { ReduxApiActionGroup, ReduxApiActionGroupState, SagaFunction } from './types';
import { Reducer } from 'redux';
declare function reducerBuilder<T extends ReduxApiActionGroup>(apiActionGroup: T): {
    reducer: Reducer<ReduxApiActionGroupState<T>>;
    watchers: Array<SagaFunction>;
};
export default reducerBuilder;
