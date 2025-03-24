import axios, { AxiosError } from 'axios'

export const serverURL = process.env.REACT_APP_SERVER_DOMAIN || ''

export const api = axios.create({
  baseURL: serverURL,
  withCredentials: true,
})

export const userPhotoURL = (photo: string | null | undefined): string => {
  return photo ? `${serverURL}/img/user/${photo}` : `${serverURL}/img/user/empty.png`
}

export const handleAxiosError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.response) {
      const data = error.response.data as { message?: string; details?: string }
      if (data.message) {
        return data.message
      }
      return `Erro do servidor (${error.response.status}): ${JSON.stringify(data)}`
    }
    if (error.request) {
      return 'Erro no servidor!'
    }
    return `Erro ao configurar requisição: ${error.message}`
  }
  return 'Erro desconhecido!'
}
