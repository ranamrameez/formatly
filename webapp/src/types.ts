export type OutputFormat = 'png' | 'jpg'
export type QueueStatus = 'Ready' | 'Converting' | 'Done' | 'Error'

export type QueueItem = {
  id: string
  file: File
  status: QueueStatus
  progress: number
  message?: string
  output?: Blob
}
