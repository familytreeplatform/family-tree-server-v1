export interface IResponse {
  statusCode: number;
  message: string;
  data?: { [key: string]: any } | string | null | boolean | any;
  error?: {
    code?: string;
    message?: string;
    error?: any;
  } | null;
}
