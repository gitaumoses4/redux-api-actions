import React from 'react'
import './Users.css'
import { User } from '../../services/types'

const Users: React.FunctionComponent<UsersProps> = (props): JSX.Element => {
  return (
    <div className="users">
      {props.users.map(user => {
        return (
          <div
            key={user.id}
            className={`card user ${user.id === props.selected?.id ? 'selected' : ''}`}
            onClick={() => props.onClickUser(user)}
          >
            <h1>{user.name}</h1>
            <div>{user.username}</div>
            <div>{user.email}</div>
          </div>
        )
      })}
    </div>
  )
}

export interface UsersProps {
  users: Array<User>
  onClickUser: (user: User) => void
  selected?: User
}

export default Users
