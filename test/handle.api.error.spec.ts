import { DEFAULT_ERROR_RESPONSE } from '../src/handle.api.error'
import axios from 'axios'
import { handleApiError } from '../src'

const moxios = require('moxios')

describe('handleApiError', () => {
  beforeEach(() => {
    moxios.install()
  })

  afterEach(() => {
    moxios.uninstall()
  })

  it('should give the response data', done => {
    moxios.stubRequest('/test', {
      status: 400,
      response: {
        error: 'Something went wrong.'
      }
    })

    axios.get('/test').catch(error => {
      const data = handleApiError(error)

      expect(data).toMatchObject({ error: 'Something went wrong.' })

      done()
    })
  })

  it('should provide a default response data', done => {
    moxios.stubRequest('/test', {
      response: null,
      status: 500
    })

    axios.get('/test').catch(error => {
      const data = handleApiError({ ...error, response: null })

      expect(data).toMatchObject(DEFAULT_ERROR_RESPONSE)

      done()
    })
  })
})
