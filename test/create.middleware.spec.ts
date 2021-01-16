import createMiddleware from '../src/create.middleware'
import axios from 'axios'
import createSagaMiddleware from 'redux-saga'
import configureMockStore from 'redux-mock-store'
import actions from '../src/utils/actionTypes'

const moxios = require('moxios')

describe('createMiddleware', () => {
  const apiCall = (username: string) => axios.post('/register', { username })
  let mockStore
  let sagaMiddleware
  let store

  beforeEach(() => {
    moxios.install()
    sagaMiddleware = createSagaMiddleware()
    mockStore = configureMockStore([sagaMiddleware])
    store = mockStore({})
  })

  afterEach(() => {
    moxios.uninstall()
    jest.resetAllMocks()
  })

  it('should make an api call with the specified args', done => {
    const watcher = createMiddleware('createAccount', apiCall)

    moxios.stubRequest('/register', {
      status: 201,
      response: { username: 'John Doe', message: 'Account has been created.' }
    })

    sagaMiddleware.run(watcher)

    store.dispatch({ type: 'createAccount', payload: ['John Doe'] })

    moxios.wait(() => {
      expect(moxios.requests.mostRecent().config.data).toEqual(JSON.stringify({ username: 'John Doe' }))

      done()
    })
  })

  it('should handle failure with custom error handler', done => {
    const watcher = createMiddleware('createAccount', apiCall)

    const response = { error: 'Username is already in use.' }

    moxios.stubRequest('/register', { status: 400, response })

    sagaMiddleware.run(watcher)

    const onError = jest.fn()

    const errorHandler = jest.fn().mockImplementation(() => ({ error: 'Something went wrong' }))

    store.dispatch({ type: 'createAccount', payload: ['John Doe'], onError, errorHandler })

    moxios.wait(() => {
      expect(moxios.requests.mostRecent().config.data).toEqual(JSON.stringify({ username: 'John Doe' }))

      expect(onError).toHaveBeenCalledWith({ error: 'Something went wrong' }, ['John Doe'])
      expect(onError).toHaveBeenCalledTimes(1)

      expect(store.getActions()[1]).toMatchObject({
        id: undefined,
        type: actions.FAILURE('createAccount'),
        payload: { error: 'Something went wrong' },
        statusCode: 400
      })
      done()
    })
  })

  it('should handle failure', done => {
    const watcher = createMiddleware('createAccount', apiCall)

    const response = { error: 'Username is already in use.' }

    moxios.stubRequest('/register', { status: 400, response })

    sagaMiddleware.run(watcher)

    const onError = jest.fn()

    store.dispatch({ type: 'createAccount', payload: ['John Doe'], onError })

    moxios.wait(() => {
      expect(moxios.requests.mostRecent().config.data).toEqual(JSON.stringify({ username: 'John Doe' }))

      expect(onError).toHaveBeenCalledWith(response, ['John Doe'])
      expect(onError).toHaveBeenCalledTimes(1)

      expect(store.getActions()[1]).toMatchObject({
        id: undefined,
        type: actions.FAILURE('createAccount'),
        payload: response,
        statusCode: 400
      })
      done()
    })
  })

  it('should handle success', done => {
    const watcher = createMiddleware('createAccount', apiCall)

    const response = { username: 'John Doe', message: 'Account has been created.' }

    moxios.stubRequest('/register', {
      status: 201,
      response
    })

    sagaMiddleware.run(watcher)

    const onSuccess = jest.fn()

    store.dispatch({ type: 'createAccount', payload: ['John Doe'], onSuccess })

    moxios.wait(() => {
      expect(moxios.requests.mostRecent().config.data).toEqual(JSON.stringify({ username: 'John Doe' }))

      expect(onSuccess).toHaveBeenCalledWith(response, ['John Doe'])
      expect(onSuccess).toHaveBeenCalledTimes(1)

      expect(store.getActions()[1]).toMatchObject({
        id: undefined,
        type: actions.SUCCESS('createAccount'),
        payload: response,
        statusCode: 201
      })
      done()
    })
  })
})
