export interface IResponse {
  statusCode: number;
  message: string;
  data?: { [key: string]: any } | string | null | boolean;
  error?: {
    code?: string;
    message?: string;
  } | null;
}
