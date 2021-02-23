export class NetworkError extends Error {
  code: number
  data?: unknown
  constructor(code: number, data?: unknown) {
    super("An error occurred while fetching the data.")
    this.code = code
    this.data = data
  }
}

const fetcher = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, options)

  if (!response.ok) {
    const data = await response.json()
    throw new NetworkError(response.status, data)
  }

  return response.json()
}

export default fetcher
