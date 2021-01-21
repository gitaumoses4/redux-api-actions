import { buildApiReducer } from 'use-api-action'
import axios from 'axios'
import { User } from './types'

const instance = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

const UsersApi = buildApiReducer(
  {
    users: {
      getAll: () => instance.get<Array<User>>('/users')
    }
  },
  'UsersApi'
)

export default UsersApi
