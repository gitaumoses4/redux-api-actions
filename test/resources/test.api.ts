import axios from 'axios'

const testApi = {
  authentication: {
    login: (username: string, password: string) => axios.post<{ token: string }>('/login', { username, password }),
    register: (username: string, password: string) =>
      axios.post<{ username: string }>('/register', { username, password })
  },
  users: {
    list: () => axios.get<Array<{ name: string }>>('/users')
  },
  products: {
    getProduct: (productId: string) => axios.get<{ name: string; price: number }>('/products/' + productId)
  }
}

export default testApi
