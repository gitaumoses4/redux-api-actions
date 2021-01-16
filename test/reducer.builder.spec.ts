import axios from 'axios'
import createSagaMiddleware from 'redux-saga'
import configureMockStore from 'redux-mock-store'
import reducerBuilder from '../src/reducer.builder'
import { all } from 'redux-saga/effects'
import { applyMiddleware, compose, createStore } from 'redux'
import actions from '../src/utils/actionTypes'

const moxios = require('moxios')

describe('reducerBuilder', () => {
  const register = (username: string) =>
    axios
      .post<{ username: string; message: string }>('/register', { username })
      .then(response => response.data)
  const login = (username: string, password: string) =>
    axios
      .post<{ token: string }>('/login', { username, password })
      .then(response => response.data)

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

  let mockStore
  let sagaMiddleware
  let store

  beforeEach(() => {
    moxios.install()
    sagaMiddleware = createSagaMiddleware()
    mockStore = configureMockStore([sagaMiddleware])

    store = createStore(builtReducer.reducer, compose(applyMiddleware(sagaMiddleware)))

    sagaMiddleware.run(function* () {
      yield all(builtReducer.watchers)
    })
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

    const token = '88883333_token'

    moxios.stubRequest('/login', {
      status: 200,
      response: {
        token
      }
    })

    store.dispatch({ type: 'login', payload: ['John Doe', 'password'], id: '123' })

    moxios.wait(() => {
      console.log(JSON.stringify(store.getState()))

      done()
    })
  })
})
