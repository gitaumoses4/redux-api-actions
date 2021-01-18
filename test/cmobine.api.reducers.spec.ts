import combineApiReducers from '../src/combine.api.reducers'
import buildApiReducer from '../src/build.api.reducer'
import testApi from './resources/test.api'
import testApi2 from './resources/test.api.2'
import { applyMiddleware, combineReducers, createStore, Store } from 'redux'
import actionTypes from '../src/utils/actionTypes'

const moxios = require('moxios')

describe('combineApiReducers', () => {
  let store: Store
  beforeEach(() => {
    moxios.install()
    const combined = combineApiReducers({
      Test: buildApiReducer(testApi, 'Test'),
      Test2: buildApiReducer(testApi2, 'Test2')
    })

    store = createStore(combineReducers(combined.reducer), applyMiddleware(combined.middleware))
  })

  afterEach(() => {
    moxios.uninstall()
  })

  it('should create the default state with all api reducers.', () => {
    expect(store.getState()).toEqual({
      Test: {
        authentication: { login: { instances: {} }, register: { instances: {} } },
        users: { list: { instances: {} } },
        products: { getProduct: { instances: {} } }
      },
      Test2: { students: { getAll: { instances: {} } }, teachers: { getAll: { instances: {} } } }
    })
  })

  it('should handle api middleware actions', () => {
    store.dispatch({ id: '123', type: actionTypes.INITIALIZE('Test_authentication_login') })
    expect(store.getState().Test.authentication.login).toEqual({
      instances: {
        '123': {
          data: null,
          errors: null,
          failed: false,
          submitting: false,
          submitted: false,
          statusCode: 0
        }
      }
    })
  })

  it('should handle api calls', done => {
    const token = '123123123123'

    store.dispatch({ id: '123', type: actionTypes.INITIALIZE('Test_authentication_login') })

    moxios.stubRequest('/login', {
      status: 200,
      response: {
        token
      }
    })

    store.dispatch({ id: '123', type: 'Test_authentication_login', payload: ['John Doe', 'password'] })

    moxios.wait(() => {
      expect(store.getState().Test.authentication.login).toEqual({
        instances: {
          '123': {
            data: { token },
            errors: null,
            failed: false,
            submitting: false,
            submitted: true,
            statusCode: 200
          }
        }
      })

      done()
    })
  })
})
