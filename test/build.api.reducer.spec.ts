import buildApiReducer from '../src/build.api.reducer'
import testApi from './resources/test.api'

describe('buildApiReducer', () => {
  beforeEach(() => {})

  afterEach(() => {})
  it('should generate the corresponding action types', () => {
    const apiContext = buildApiReducer(testApi, 'Test')

    expect(apiContext.types).toMatchObject({
      authentication: {
        login: 'Test_authentication_login',
        register: 'Test_authentication_register'
      },
      users: { list: 'Test_users_list' },
      products: { getProduct: 'Test_products_getProduct' }
    })
  })

  it('should generate the corresponding action creators', () => {
    const apiContext = buildApiReducer(testApi, 'Test')

    const actions = apiContext.actions

    expect(actions.authentication.login('username', 'password')).toEqual({
      type: 'Test_authentication_login',
      payload: ['username', 'password']
    })

    expect(actions.authentication.register('username', 'password')).toEqual({
      type: 'Test_authentication_register',
      payload: ['username', 'password']
    })

    expect(actions.products.getProduct('123')).toEqual({
      type: 'Test_products_getProduct',
      payload: ['123']
    })

    expect(actions.users.list()).toEqual({
      type: 'Test_users_list',
      payload: []
    })
  })

  it('should provide the raw api endpoints', () => {
    const apiContext = buildApiReducer(testApi, 'Test')

    expect(apiContext.api).toEqual(testApi)
  })

  it('should generate the corresponding reducers', () => {
    const { reducers } = buildApiReducer(testApi, 'Test')

    expect(reducers.authentication.reducer).toBeDefined()
    expect(reducers.authentication.watchers).toHaveLength(2)

    expect(reducers.products.reducer).toBeDefined()
    expect(reducers.products.watchers).toHaveLength(1)

    expect(reducers.users.reducer).toBeDefined()
    expect(reducers.users.watchers).toHaveLength(1)
  })

  it('should generate the corresponding endpoint definitions', () => {
    const { endpoints } = buildApiReducer(testApi, 'Test')

    expect(endpoints).toMatchObject({
      authentication: {
        login: ['authentication', 'login'],
        register: ['authentication', 'register']
      },
      users: { list: ['users', 'list'] },
      products: { getProduct: ['products', 'getProduct'] }
    })
  })

  it('should show the api name', () => {
    const { name } = buildApiReducer(testApi, 'Test')

    expect(name).toEqual('Test')
  })
})
