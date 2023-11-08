import { mailGenerator, mailTransport } from 'src/common/configs';

const OtpCodeResend = class {
  async mail(email: string, otp: string) {
    const html = {
      body: {
        signature: false,
        greeting: `Hello there`,
        intro: [`Your family tree otp code is`, '', `<b>OTP:<b/> ${otp}`],
        outro: `Don't be a stranger, feel free to connect with the family tree family via support@familytree.com for any further enquiry`,
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
