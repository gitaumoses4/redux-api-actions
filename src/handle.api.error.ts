import { AxiosError } from 'axios'

export const DEFAULT_ERROR_RESPONSE = {
  success: false,
  message: 'Server facing technical issue. Please try again.',
  statusCode: 500
}

function handleApiError<Error>(error: AxiosError): Error {
  let data
  if (error.response) {
    data = error.response.data
  } else {
    data = DEFAULT_ERROR_RESPONSE
  }
  return data
}

export default handleApiError
