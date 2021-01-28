import useApiAction from '../../src/hooks/useApiAction'
import buildApiReducer from '../../src/build.api.reducer'
import testApi from '../resources/test.api'
import * as React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { applyMiddleware, combineReducers, createStore, Store } from 'redux'
import combineApiReducers from '../../src/combine.api.reducers'
import { DEFAULT_ACTION_ID } from '../../src/utils/actions'

const moxios = require('moxios')

const TestApi = buildApiReducer(testApi, 'test')

function TestComponent() {
  const [login, state, clearLogin] = useApiAction(TestApi, api => api.authentication.login, {})
  const [login2, state2] = useApiAction(TestApi, api => api.authentication.login, { id: 'login2' })

  return (
    <div>
      <button onClick={() => login('username', 'password')}>Login</button>
      <button
        onClick={() => {
          login2('username2', 'password2')
        }}
      >
        Login2
      </button>
      <button onClick={() => clearLogin()}>Clear</button>
      {state.data && <span className="token">{state.data.token}</span>}
      {state2.data && <span className="token">{state2.data.token}</span>}
    </div>
  )
}

describe('useApiAction', () => {
  let store: Store
  beforeEach(() => {
    const combined = combineApiReducers({ TestApi })

    store = createStore(
      combineReducers({
        apis: combined.reducer
      }),
      applyMiddleware(combined.middleware)
    )

    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    )

    moxios.install()
  })

  afterEach(() => {
    moxios.uninstall()
  })

  it('should initialize the action', async () => {
    expect(store.getState().apis.test).toEqual({
      authentication: {
        login: {
          instances: {
            login2: {
              data: null,
              errors: null,
              failed: false,
              fetching: false,
              fetched: false,
              submitting: false,
              submitted: false,
              statusCode: 0
            },
            [DEFAULT_ACTION_ID]: {
              data: null,
              errors: null,
              failed: false,
              fetching: false,
              fetched: false,
              submitting: false,
              submitted: false,
              statusCode: 0
            }
          }
        },
        register: { instances: {} }
      },
      users: { list: { instances: {} } },
      products: { getProduct: { instances: {} } }
    })
  })

  it('should perform the action and update the state', async () => {
    const token = 'token123'

    fireEvent.click(screen.getByText('Login'))

    await moxios.wait(jest.fn)

    await act(async () => {
      const request = moxios.requests.mostRecent()
      await request.respondWith({
        status: 200,
        response: { token }
      })
    })
    expect(store.getState().apis.test.authentication.login.instances[DEFAULT_ACTION_ID]).toEqual({
      data: { token },
      errors: null,
      failed: false,
      fetching: false,
      fetched: true,
      submitting: false,
      submitted: true,
      statusCode: 200
    })

    fireEvent.click(screen.getByText('Login2'))

    await moxios.wait(jest.fn)

    await act(async () => {
      const request = moxios.requests.mostRecent()
      request.respondWith({
        status: 200,
        response: { token: 'token56789' }
      })
    })

    expect(store.getState().apis.test.authentication.login.instances['login2']).toEqual({
      errors: null,
      data: {
        token: 'token56789'
      },
      failed: false,
      submitting: false,
      submitted: true,
      fetching: false,
      fetched: true,
      statusCode: 200
    })

    expect(screen.getByText('token56789')).toBeDefined()

    // clear the previous action

    fireEvent.click(screen.getByText('Clear'))

    expect(store.getState().apis.test.authentication.login.instances[DEFAULT_ACTION_ID]).toEqual({
      errors: null,
      data: null,
      fetching: false,
      fetched: false,
      failed: false,
      submitting: false,
      submitted: false,
      statusCode: 0
    })
  })
})
