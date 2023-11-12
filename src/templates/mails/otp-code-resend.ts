import { mailGenerator, mailTransport } from 'src/common/configs';

const OtpCodeResend = class {
  async mail(email: string, otp: string) {
    const html = {
      body: {
        signature: false,
        greeting: `Hello there`,
        intro: [`Your family tree otp code is`, '', `<b>OTP:<b/> ${otp}`],
        outro: [
          `For security reasons this otp will expire in 10 minutes, make sure to use it before then or you'll have to request for a new one.`,
          `If you encounter any issues or need further assistance, please do not hesitate to contact us at support@familytree.com`,
        ],
      },
    };
    const template = mailGenerator.generate(html);

    // mail object created for sendgrid use case
    const mail = {
      to: email,
      subject: 'Family-Tree | Welcome',
      from: process.env.SENDING_MAIL,
      html: template,
    };
    return mailTransport(mail.from, mail.to, mail.subject, mail.html);
  }
};

export const otpCodeResend = new OtpCodeResend();
