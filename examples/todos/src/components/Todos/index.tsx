import React from 'react'
import './Todos.css'
import { Todo } from '../../services/types'

const Todos: React.FunctionComponent<TodosProps> = (props): JSX.Element => {
  return (
    <div>
      {props.todos.map(todo => {
        return (
          <div className="todo card">
            <input type="checkbox" checked={todo.completed} />
            <div>{todo.title}</div>
          </div>
        )
      })}
    </div>
  )
}

export interface TodosProps {
  todos: Array<Todo>
}

export default Todos
