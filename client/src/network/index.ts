import { httpClient } from 'network/httpClient'
import { AxiosResponse } from 'axios'
import { RootProps } from 'model/type'

export const getRootProperties = (): Promise<AxiosResponse<RootProps[]>> =>
  httpClient.get('/record')
