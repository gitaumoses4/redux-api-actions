# Redux API Actions

Consume APIs with react/redux without the pain of writing actions and reducers as simple as:

```typescript jsx
const [login, loginState] = useApiAction(Api, api => api.authentication.login)
```

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
const LoginPage = (props) => {
  const [login, loginState] = useApiAction(Api, api => api.authentication.login)
  
  return <div></div>
}
```

#### 2. Class components
```typescript jsx
class LoginPage extends React.Component{
  
  render(){
    const [login, loginState] = this.props.login;
  }
}

export default connectApi(Api, api => {
  return {
    login: api.authentication.login // Maps "login" to the props.
  }
})(LoginPage);
```

### Step 4: Make use of the actions / states.
```typescript jsx
class LoginPage extends React.Component{
  render(){
    const [login, loginState] = this.props.login;
    
    const onSubmit = (username, password) => {
      // Invoking this will automatically pass the arguments to the api definition endpoint.
      login(username, password);
    }
    
    return loginState.submitting ? (
      <div>Logging in...</div>
    ): (
      <LoginForm onSubmit={onSubmit} />
    )
  }
}
```


