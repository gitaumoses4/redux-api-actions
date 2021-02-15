import createReducer from '../src/create.reducer'
import initialState from '../src/utils/initialState'
import actions from '../src/utils/actionTypes'

describe('createReducer', () => {
  it('should initialize with empty instances', () => {
    const reducer = createReducer(initialState, 'createAccount')
    const state = reducer()

    expect(state).toMatchObject({ instances: {} })
  })

  it('should initialize an action with the initialState', () => {
    const reducer = createReducer(initialState, 'createAccount')

    const action = {
      id: '123',
      type: actions.INITIALIZE('createAccount')
    }

    const state = reducer(undefined, action)

    expect(state.instances['123']).toMatchObject(initialState)
  })

  it('should handle the api call ', () => {
    const reducer = createReducer(initialState, 'createAccount')

    const action = {
      id: '123',
      type: 'createAccount'
    }

    const state = reducer(undefined, action)
    expect(state.instances['123']).toMatchObject({
      ...initialState,
      submitting: true,
      submitted: false,
      fetching: true,
      fetched: false,
      failed: false,
      statusCode: null,
      errors: null,
      data: null
    })
  })

  it('should clear the data and errors during an api call', () => {
    const reducer = createReducer(initialState, 'createAccount')

    const id = '123'

    let state = reducer(undefined, { id, type: 'createAccount' })
    state = reducer(state, { id, type: actions.SUCCESS('createAccount'), payload: { username: 'John Doe' } })
    expect(state.instances[id].data).toMatchObject({ username: 'John Doe' })

    state = reducer(state, { id, type: 'createAccount' })

    expect(state.instances[id].data).toMatchObject({ username: 'John Doe' })

    state = reducer(state, { id, type: 'createAccount', clearData: true })
    expect(state.instances[id].data).toBeNull()

    state = reducer(state, {
      id,
      type: actions.FAILURE('createAccount'),
      payload: { error: 'The username already exists.' }
    })
    expect(state.instances[id].errors).toMatchObject({ error: 'The username already exists.' })

    state = reducer(state, { id, type: 'createAccount' })
    expect(state.instances[id].errors).toMatchObject({ error: 'The username already exists.' })

    state = reducer(state, { id, type: 'createAccount', clearData: true })
    expect(state.instances[id].errors).toMatchObject({ error: 'The username already exists.' })

    state = reducer(state, { id, type: 'createAccount', clearErrors: true })
    expect(state.instances[id].errors).toBeNull()
  })

  it('should update the data on success', () => {
    const reducer = createReducer(initialState, 'createAccount')

    const id = '123'

    let state = reducer(undefined, { id, type: 'createAccount' })

    state = reducer(state, {
      id,
      type: actions.FAILURE('createAccount'),
      payload: { error: 'This username already exists' },
      statusCode: 400
    })
    state = reducer(state, {
      id,
      type: actions.SUCCESS('createAccount'),
      payload: { username: 'John Doe' },
      statusCode: 201
    })

    expect(state.instances[id]).toMatchObject({
      ...initialState,
      submitting: false,
      submitted: true,
      fetching: false,
      fetched: true,
      failed: false,
      statusCode: 201,
      errors: {
        error: 'This username already exists'
      },
      data: { username: 'John Doe' }
    })

    state = reducer(state, {
      id,
      type: actions.SUCCESS('createAccount'),
      payload: { username: 'John Doe' },
      clearErrors: true,
      statusCode: 201
    })

    expect(state.instances[id]).toMatchObject({
      ...initialState,
      submitting: false,
      submitted: true,
      fetching: false,
      fetched: true,
      failed: false,
      statusCode: 201,
      data: { username: 'John Doe' }
    })
  })

  it('should update on failure', () => {
    const reducer = createReducer(initialState, 'createAccount')

    const id = '123'

    let state = reducer(undefined, { id, type: 'createAccount' })

    state = reducer(state, {
      id,
      type: actions.SUCCESS('createAccount'),
      payload: { username: 'John Doe' },
      statusCode: 201
    })
    state = reducer(state, {
      id,
      type: actions.FAILURE('createAccount'),
      payload: { error: 'This username already exists' },
      statusCode: 400
    })

    expect(state.instances[id]).toMatchObject({
      ...initialState,
      submitting: false,
      submitted: true,
      failed: true,
      fetching: false,
      fetched: false,
      statusCode: 400,
      errors: {
        error: 'This username already exists'
      },
      data: {
        username: 'John Doe'
      }
    })

    state = reducer(state, {
      id,
      type: actions.FAILURE('createAccount'),
      payload: { error: 'This username already exists' },
      clearData: true,
      statusCode: 400
    })

    expect(state.instances[id]).toMatchObject({
      ...initialState,
      submitting: false,
      submitted: true,
      failed: true,
      fetching: false,
      fetched: false,
      statusCode: 400,
      errors: {
        error: 'This username already exists'
      },
      data: null
    })
  })

  it('should clear the state', () => {
    const reducer = createReducer(initialState, 'createAccount')

    const id = '123'

    let state = reducer(undefined, { id, type: 'createAccount' })

    state = reducer(state, {
      id,
      type: actions.SUCCESS('createAccount'),
      payload: { username: 'John Doe' },
      statusCode: 201
    })
    state = reducer(state, {
      id,
      type: actions.CLEAR('createAccount')
    })

    expect(state.instances[id]).toMatchObject(initialState)
  })

  it('should return the current state', () => {
    const reducer = createReducer(initialState, 'createAccount')

    const id = '123'

    let state = reducer(undefined, { id, type: 'createAccount' })

    state = reducer(state, {
      id,
      type: actions.SUCCESS('createAccount'),
      payload: { username: 'John Doe' },
      statusCode: 201
    })

    const prevState = { ...state }

    state = reducer(state, {
      id,
      type: 'anActionThatDoesNotExist'
    })

    expect(state).toMatchObject(prevState)
  })

  it('should update the state with the set onNewData', () => {
    const reducer = createReducer(initialState, 'fetchAccounts')

    const id = '123'
    let state = reducer(undefined, { id, type: 'fetchAccounts' })

    state = reducer(state, {
      id,
      type: actions.SUCCESS('fetchAccounts'),
      payload: [{ username: 'John Doe' }],
      statusCode: 200
    })

    state = reducer(state, {
      id,
      type: actions.SUCCESS('fetchAccounts'),
      payload: [{ username: 'Jane Doe' }],
      statusCode: 200,
      onNewData: (prevState: any, newState: any) => {
        if (prevState?.length) {
          return [...prevState, ...newState]
        }
        return newState
      }
    })

    expect(state).toEqual({
      instances: {
        '123': {
          data: [{ username: 'John Doe' }, { username: 'Jane Doe' }],
          errors: null,
          failed: false,
          fetched: true,
          fetching: false,
          statusCode: 200,
          submitted: true,
          submitting: false
        }
      }
    })
  })
})
