# Redux API Actions

Consume APIs with react/redux without the pain of writing actions and reducers as simple as:

```typescript jsx
const [login, loginState] = useApiAction(Api, api => api.authentication.login)
```

## Features

- Redux
- Multiple APIs support
- Typescript support
- React Hooks and Class components

## Installation

### NPM

```bash
npm install --save redux-api-actions
```

### Yarn

```bash
yarn add redux-api-actions
```

## Basic Usage Guide

### Step 1: Create an API definition with the following structure.

An API definition should have groups. Within each group, define the endpoints as shown below.
Axios is required for this, as the underlying functionality depends on the AxiosResponse object.

> You can use Typescript to define the argument types as you wish.

```javascript
const testApi = {
  authentication: {
    login: (username, password) => axios.post('/login', { username, password }),
    register: (username, password) => axios.post('/register', { username, password })
  },
  users: {
    list: () => axios.get('/users')
  },
  products: {
    getProduct: productId => axios.get('/products/' + productId)
  }
}
```

### Step 2: Attaching to redux.

Provide the API definition and a name for the API. This name should be unique when defining multiple APIs.

```javascript
const Api = buildApiReducer(testApi, 'Test')
const Api2 = buildApiReducer(productsApi, 'Products')
```

Combine your APis into one reducer.

```javascript
const apis = combineApiReducers({ Api, Api2 })
```

Register the APIs to your store.

```javascript
const rootReducer = combineReducers({
  //... your other reducers here. You have to pass apiReducer under 'apis' key
  apis: apis.reducer
})

// Ensure you have registered apis.middleware as well.

const store = createStore(rootReducer, applyMiddleware(apis.middleware))
```

### Step 3: Usage on your component.

You can either use the hook or use Higher Order Components.

#### 1. React Hooks.

```typescript jsx
const LoginPage = props => {
  const [login, loginState] = useApiAction(Api, api => api.authentication.login)

  return <div></div>
}
```

#### 2. Class components

```typescript jsx
class LoginPage extends React.Component {
  render() {
    const [login, loginState] = this.props.login
  }
}

export default connectApi(Api, api => {
  return {
    login: api.authentication.login // Maps "login" to the props.
  }
})(LoginPage)
```

### Step 4: Make use of the actions / states.

```typescript jsx
class LoginPage extends React.Component {
  render() {
    const [login, loginState] = this.props.login()

    const onSubmit = (username, password) => {
      // Invoking this will automatically pass the arguments to the api definition endpoint.
      login(username, password)
    }

    return loginState.submitting ? <div>Logging in...</div> : <LoginForm onSubmit={onSubmit} />
  }
}
```

## The API action

The api action returns an array with the same structure as the `useState` react hook. With the following structure.

```typescript jsx
const [login, loginState, clearLogin] = useApiAction(Api, api => api.authentication.login)
// For class components
const [login, loginState, clearLogin] = props.state.login()
```

1.  The first element is the `actionCreator`. It is used to make the api call specified. In this example, you will invoke it with the `username` and `password` arguments.
    ```typescript jsx
    login('username', 'password')
    ```
    It returns the following.
    ```
    {
      payload: [],
      onSuccess: (response, payload) => {}
      onError: (error, payload) => {}
      statusCode: 500
      id: "" // The id is automatically generated and is used to clear the action state
      clearData: boolean // clear the existing data when the api call made.
      clearErrors: boolean // clear the existing errors when the api call is made.
      errorHandler: (error) => {}
    }
    ```
2.  The second argument is the `state` of the action. It is defined as follows:
    ```json
    {
      "data": null,
      "errors": null,
      "failed": false,
      "submitting": false,
      "submitted": false,
      "statusCode": 200
    }
    ```
    | Field      | Description                                                                  |
    | :--------- | :--------------------------------------------------------------------------- |
    | data       | The response data returned by your API after a success                       |
    | errors     | The response errors returned by your API after an error                      |
    | failed     | The failure status. It is true if there was an error when fetching data      |
    | submitting | Set to true when the data is being fetched                                   |
    | submitted  | Set to true when the data has been fetched whether there was an error or not |
    | statusCode | Updated after every successful / failed request                              |
3.  The third argument is the `clear` action. It is used to clear the state `(data, errors, statusCode etc.)` and restore it to the initial state.

    ```typescript jsx
    useEffect(() => {
      const { id } = login('username', 'password')

      return () => clearLogin(id)
    }, [])
    ```

## Response Handlers.

You can pass response handlers for both `onSuccess` and `onError` to the api action.

```typescript jsx
// hooks
const [login, loginState] = useApiAction(Api, api => api.authentication.login, {
  onSuccess: (response, payload) => {
    // do something with the response / payload
  },
  onError: (error, payload) => {}
})

// class components
const [login, loginState] = this.props.login({
  onSuccess: (response, payload) => {},
  onError: (error, payload) => {}
})

```

## Handling Data
### Clear data before making a new request
You can clear data before making a new api call. By default, the existing data is kept until the api request is successful. 
```typescript jsx
// hooks
const [login, loginState] = useApiAction(Api, api => api.authentication.login, {
  clearData: true
})


// class components
const [login, loginState] = this.props.login({ clearData: true })
```

### Clear errors before making a new request
You can clear the existing errors before making a new api call. By default the existing errors are kept until there are new errors.

```typescript jsx
// hooks
const [login, loginState] = useApiAction(Api, api => api.authentication.login, {
  clearErrors: true
})


// class components
const [login, loginState] = this.props.login({ clearErrors: true })
```


