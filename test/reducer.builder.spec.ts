import axios from 'axios'
import reducerBuilder from '../src/reducer.builder'
import actions from '../src/utils/actionTypes'
import { MockStoreEnhanced } from 'redux-mock-store'
import createMockStore from './utils/create.mock.store'

const moxios = require('moxios')

describe('reducerBuilder', () => {
  const register = (username: string) => axios.post<{ username: string }>('/register', { username })
  const login = (username: string, password: string) => axios.post<{ token: string }>('/login', { username, password })

  const builtReducer = reducerBuilder({
    login: {
      action: 'login',
      api: login
    },
    register: {
      action: 'createAccount',
      api: register
    }
  })

  let store: MockStoreEnhanced<any>

  beforeEach(() => {
    moxios.install()
    store = createMockStore(builtReducer.reducer, builtReducer.watchers)
  })

  afterEach(() => {
    moxios.uninstall()
    jest.resetAllMocks()
  })

  it('should build a reducer from a collection of api reducers', done => {
    store.dispatch({ type: actions.INITIALIZE('login'), id: '123' })

    expect(store.getState()).toMatchObject({
      login: { instances: { '123': {} } },
      register: { instances: {} }
    })

    store.dispatch({ type: actions.INITIALIZE('createAccount'), id: '456' })

    expect(store.getState()).toMatchObject({
      login: { instances: { '123': {} } },
      register: { instances: { '456': {} } }
    })

    store.dispatch({ type: actions.INITIALIZE('login'), id: '456' })

    expect(store.getState()).toMatchObject({
      login: { instances: { '123': {}, '456': {} } },
      register: { instances: { '456': {} } }
    })

    store.dispatch({ type: actions.INITIALIZE('createAccount'), id: '123' })

    expect(store.getState()).toMatchObject({
      login: { instances: { '123': {}, '456': {} } },
      register: { instances: { '123': {}, '456': {} } }
    })

    const token = '88883333_token'

    moxios.stubRequest('/login', { status: 200, response: { token } })

    moxios.stubRequest('/register', { status: 200, response: { username: 'John Doe' } })

    store.dispatch({ type: 'login', payload: ['John Doe', 'password'], id: '456' })
    store.dispatch({ type: 'createAccount', payload: ['John Doe'], id: '123' })

    moxios.wait(() => {
      expect(store.getState().login.instances['456'].data).toMatchObject({
        token
      })

      // Ensure no other state was affected.
      expect(store.getState().register.instances['456'].data).toBeNull()

      expect(store.getState().register.instances['123'].data).toMatchObject({
        username: 'John Doe'
      })

      done()
    })
  })
})
