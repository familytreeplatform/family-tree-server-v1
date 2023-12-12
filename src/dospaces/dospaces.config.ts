require('aws-sdk/lib/maintenance_mode_message').suppress = true;

import * as AWS from 'aws-sdk';
import { Provider } from '@nestjs/common';

export const DoSpacesServiceLib = 'lib:do-spaces-service';

const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACE_ENDPOINT);
const S3 = new AWS.S3({
  endpoint: spacesEndpoint,
  region: 'nyc3',
  credentials: new AWS.Credentials({
    accessKeyId: process.env.DO_SPACE_KEY,
    secretAccessKey: process.env.DO_SPACE_SECRET,
  }),
});

export const DoSpacesServiceProvider: Provider<AWS.S3> = {
  provide: DoSpacesServiceLib,
  useValue: S3,
};
