import axios from 'axios'

const DEFAULT_CONTENT_TYPE = 'application/json'
const FILE_CONTENT_TYPE = 'multipart/form-data'

export const httpClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: { 'Content-Type': DEFAULT_CONTENT_TYPE },
})

export const fileClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: { 'Content-Type': FILE_CONTENT_TYPE },
})
