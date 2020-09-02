import axios from 'axios'

const DEFAULT_CONTENT_TYPE = 'application/json'

export const httpClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: { 'Content-Type': DEFAULT_CONTENT_TYPE },
})
