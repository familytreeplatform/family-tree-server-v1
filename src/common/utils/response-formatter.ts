import { HttpException } from '@nestjs/common';
import { IResponse } from 'src/interfaces';

export const formatResponse = (response: IResponse) => {
  if (response.statusCode >= 300) {
    throw new HttpException(
      {
        message: response.message,
        data: response.data || response.data === false ? response.data : null,
        error: response.error,
      },
      response.statusCode,
    );
  }
  return {
    message: response.message,
    data: response.data,
    errors: null,
  };
};
