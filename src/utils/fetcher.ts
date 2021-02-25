import { getReasonPhrase, StatusCodes } from "http-status-codes"

import { ApiErrorResponse } from "@/types"

export class NetworkError extends Error {
  code: number
  data?: unknown

  constructor(code: number, data?: unknown, message = "An error occurred while fetching the data.") {
    super(message)
    this.code = code
    this.data = data
  }
}

export const createErrorResponse = (error: Error): ApiErrorResponse => {
  if (error instanceof NetworkError && typeof error.data == "object") {
    return <ApiErrorResponse>error.data
  } else {
    const code = StatusCodes.INTERNAL_SERVER_ERROR
    return {
      success: false,
      code,
      error: getReasonPhrase(code),
    }
  }
}

const fetcher = async <R = unknown>(url: string, options?: RequestInit): Promise<R> => {
  const response = await fetch(url, options)

  if (!response.ok) {
    const data = await response.json()
    throw new NetworkError(response.status, data, data.error)
  }

  return response.json()
}

export default fetcher
