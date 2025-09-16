export interface ApiResponse<T> {
  status: number;
  data?: T;
  message?: string;
  error?: string;
}

export const successResponse = <T>(
  data: T,
  message: string = "Success",
  status: number = 200
): ApiResponse<T> => ({
  status,
  data,
  message,
});

export const errorResponse = (
  message: string = "An error occurred",
  errorDetails?: any,
  status: number = 500
): ApiResponse<any> => ({
  status,
  message,
  error: errorDetails ? JSON.stringify(errorDetails) : message,
});