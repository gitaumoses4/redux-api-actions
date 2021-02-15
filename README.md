# Redux API Actions

[![Tests](https://github.com/gitaumoses4/redux-api-actions/workflows/Tests/badge.svg)](https://github.com/gitaumoses4/redux-api-actions/actions)
[![GitHub issues](https://img.shields.io/github/issues/gitaumoses4/redux-api-actions)](https://github.com/gitaumoses4/redux-api-actions/issues)
[![GitHub stars](https://img.shields.io/github/stars/gitaumoses4/redux-api-actions)](https://github.com/gitaumoses4/redux-api-actions/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/gitaumoses4/redux-api-actions)](https://github.com/gitaumoses4/redux-api-actions/network)
[![GitHub license](https://img.shields.io/github/license/gitaumoses4/redux-api-actions)](https://github.com/gitaumoses4/redux-api-actions/blob/master/LICENSE.md)
[![npm](https://img.shields.io/npm/dt/use-api-action)](https://nodei.co/npm/use-api-action)
[![npm](https://img.shields.io/npm/v/use-api-action)](https://nodei.co/npm/use-api-action)
![npm type definitions](https://img.shields.io/npm/types/use-api-action)
<br />
<br />
[![NPM](https://nodei.co/npm/use-api-action.png)](https://nodei.co/npm/use-api-action/) <br /> 

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
npm install --save use-api-action
```

### Yarn

```bash
yarn add use-api-action
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
      id: "default" // The id can be used to distinguish two separate states to the same API cal 
      clearData: boolean // clear the existing data when the api call made.
      clearErrors: boolean // clear the existing errors when the api call is made.
      errorHandler: (error) => {},
      onNewData?: (prevState, newState) => State
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
      "fetching": false,
      "fetched": false,
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
    | fetched    | Set to true when the data has been fetched only when there was no error.     |
    | fetching   | Similar to submitting, to show when data is being fetched.                   |
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


### Modifying the existing data after a new response.

You can modify the existing state after making a new request

```typescript jsx
// hooks

const [getStudents, studentList] = useApiAction(Api, api => api.students.list, {
  onNewData: (prevStudents, students) => ([...prevStudents, ...students])
})

const [getStudents, studentList] = this.props.students({
  onNewData: (prevStudents, students) => ([...prevStudents, ...students])
})
```

# License (MIT)

Copyright &copy; Moses Gitau
All rights reserved.

Find a copy of the License [here](https://github.com/redux-api-actions/blob/master/LICENSE.md)

<a href="https://www.buymeacoffee.com/gitaumoses4" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
