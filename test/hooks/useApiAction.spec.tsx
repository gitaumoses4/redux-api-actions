import useApiAction from '../../src/hooks/useApiAction'
import buildApiReducer from '../../src/build.api.reducer'
import testApi from '../resources/test.api'
import * as React from 'react'
import { act, fireEvent, render, RenderResult, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { applyMiddleware, combineReducers, createStore, Store } from 'redux'
import combineApiReducers from '../../src/combine.api.reducers'

const moxios = require('moxios')

const TestApi = buildApiReducer(testApi, 'test')

function TestComponent() {
  const [login] = useApiAction(TestApi, api => api.authentication.login, {})

  return (
    <div>
      <button onClick={() => login('username', 'password')}>Login</button>
      <button onClick={() => login('username2', 'password2')}>Login2</button>
    </div>
  )
}

describe('useApiAction', () => {
  let tester: RenderResult
  let store: Store
  beforeEach(() => {
    const combined = combineApiReducers({ TestApi })

    store = createStore(
      combineReducers({
        apis: combined.reducer
      }),
      applyMiddleware(combined.middleware)
    )

    tester = render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    )

    moxios.install()
  })

  afterEach(() => {
    moxios.uninstall()
  })
  //
  // it('should initialize the action', async () => {
  //   expect(store.getState().apis.test).toEqual({
  //     authentication: {
  //       login: {
  //         instances: {
  //           __default__action__id__: {
  //             data: null,
  //             errors: null,
  //             failed: false,
  //             submitting: false,
  //             submitted: false,
  //             statusCode: 0
  //           }
  //         }
  //       },
  //       register: { instances: {} }
  //     },
  //     users: { list: { instances: {} } },
  //     products: { getProduct: { instances: {} } }
  //   })
  // })

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
    expect(
      store.getState().apis.test.authentication.login.instances['78af8dddf912e0741076f2d1fe290d1d190de0d2']
    ).toEqual({
      data: { token },
      errors: null,
      failed: false,
      submitting: false,
      submitted: true,
      statusCode: 200
    })
  })
})
