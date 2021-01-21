import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import { combineApiReducers } from 'use-api-action'
import TodoApi from '../services/todoApi'
import UsersApi from '../services/usersApi'

const apis = combineApiReducers({ TodoApi, UsersApi })

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(
  combineReducers({
    apis: apis.reducer
  }),
  composeEnhancers(applyMiddleware(apis.middleware))
)

export default store
