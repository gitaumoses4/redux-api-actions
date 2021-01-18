import axios from 'axios'

const testApi2 = {
  students: {
    getAll: () => axios.get<Array<{ name: string }>>('/students')
  },
  teachers: {
    getAll: () => axios.get<Array<{ name: string; course: string }>>('/teachers')
  }
}

export default testApi2
