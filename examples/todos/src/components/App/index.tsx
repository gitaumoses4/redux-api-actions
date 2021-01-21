import React, { useEffect, useState } from 'react'
import './App.css'
import { useApiAction } from 'use-api-action'
import UsersApi from '../../services/usersApi'
import Users from '../Users'
import { User } from '../../services/types'
import TodoApi from '../../services/todoApi'
import Todos from '../Todos'

function App() {
  const [getUsers, state] = useApiAction(UsersApi, api => api.users.getAll)
  const [getTodos, todosState] = useApiAction(TodoApi, api => api.todos.getAll, { clearData: false })
  const [selectedUser, setSelectedUser] = useState<User>()

  useEffect(() => {
    getUsers()
  }, [])

  useEffect(() => {
    if (selectedUser?.id) {
      getTodos(selectedUser.id)
    }
  }, [selectedUser])

  return (
    <div className="app">
      {state.data ? (
        <div className="content">
          <div className="content__users">
            <h1>Users</h1>
            <Users users={state.data} selected={selectedUser} onClickUser={setSelectedUser} />
          </div>
          <div className="content__todos">
            <h1>Todos</h1>
            {todosState.data ? (
              <Todos todos={todosState.data} />
            ) : todosState.submitting ? (
              <div>Loading...</div>
            ) : (
              <div>There are no todos.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="loading">Loading...</div>
      )}
    </div>
  )
}

export default App
