import type { NextApiResponse } from "next"

export interface ApiSuccessResponse<D> {
  success: true
  data: D
}

export interface ApiErrorResponse {
  success: false
  statusCode: number
  message: string
}

export type ApiResponse<D> = ApiSuccessResponse<D> | ApiErrorResponse

export function success<D>(data: D): ApiSuccessResponse<D> {
  return {
    success: true,
    data,
  }
}

export function error(statusCode: number, message: string): ApiErrorResponse {
  return {
    success: false,
    statusCode,
    message,
  }
}

export function internalServerError() {
  return error(500, "Internal Server Error")
}

export function notFound() {
  return error(404, "Not Found")
}

export function methodNotAllowed() {
  return error(405, "Method Not Allowed")
}

export function badRequest(message = "Bad Request") {
  return error(400, message)
}

export function unauthorized() {
  return error(401, "Unauthorized")
}

export function respondWithSuccess<D>(res: NextApiResponse<ApiResponse<D>>, data: D, statusCode = 200) {
  res.status(statusCode).json(success(data))
}

export function respondWithError(res: NextApiResponse<ApiErrorResponse>, error: ApiErrorResponse) {
  res.status(error.statusCode).json(error)
}
