export type OutputFormat = 'png' | 'jpg' | 'webp'
export type QueueStatus = 'Ready' | 'Converting' | 'Done' | 'Error'
export type ProcessingMode = 'convert' | 'compress'

export type QueueItem = {
  id: string
  file: File
  status: QueueStatus
  progress: number
  message?: string
  output?: Blob
  outputName?: string
}
