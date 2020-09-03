import { httpClient, fileClient } from 'network/httpClient'
import { AxiosResponse } from 'axios'
import { RootProps, createNoteResponse } from 'model/type'

export const getRootProperties = (): Promise<AxiosResponse<RootProps[]>> =>
  httpClient.get('/record')

export const createNote = (formData: FormData): Promise<AxiosResponse<createNoteResponse>> =>
  fileClient.post('/record', formData)

export const refreshNote = (jobName: string): Promise<AxiosResponse<any>> =>
  httpClient.get(`/record/${jobName}`)
