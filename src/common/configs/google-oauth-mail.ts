import * as dotenv from 'dotenv';
dotenv.config();

import { createTransport } from 'nodemailer';
import { google } from 'googleapis';
import { Logger } from '@nestjs/common';
const OAuth2 = google.auth.OAuth2;
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN, SENDING_MAIL } =
  process.env;

const logger = new Logger(`GoogleMailConfig`);

const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN,
});
const accessToken = oauth2Client.getAccessToken();

const smtpTransport = createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: SENDING_MAIL,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    refreshToken: REFRESH_TOKEN,
    accessToken: accessToken,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const mailTransport = async (
  from: string,
  to: string,
  subject: string,
  html,
  attachments?,
) => {
  logger.log(`sending mail to user with email: [${to}]`);
  const mailOptions = { from, to, subject, html, attachments };
  return new Promise((resolve, reject) => {
    smtpTransport.sendMail(mailOptions, (err, info) => {
      if (err) {
        return reject(err);
      }
      resolve(info);
    });
  });
};
