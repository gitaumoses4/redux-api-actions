import combineApiReducers from '../src/combine.api.reducers'
import buildApiReducer from '../src/build.api.reducer'
import testApi from './resources/test.api'
import testApi2 from './resources/test.api.2'

describe('combineApiReducers', () => {
  it('should combine multiple api reducers', () => {
    const combined = combineApiReducers({
      Test: buildApiReducer(testApi, 'Test'),
      Test2: buildApiReducer(testApi2, 'Test2')
    })
  })
})
