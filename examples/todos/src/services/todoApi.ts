import { buildApiReducer } from 'use-api-action'
import axios from 'axios'
import { Todo } from './types'

const instance = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

const TodoApi = buildApiReducer(
  {
    todos: {
      getAll: (userId: number) => instance.get<Array<Todo>>('/todos?userId=' + userId)
    }
  },
  'TodoApi'
)

export default TodoApi
