import { mailGenerator, mailTransport } from 'src/common/configs';

const PasswordResetSuccessMail = class {
  async mail(email: string, name: string) {
    const html = {
      body: {
        signature: false,
        greeting: `Hello ${name}`,
        intro: [
          'Congratulations, your family tree account password has been recovered successfully.',
          'You can now proceed to login with your new credentials.',
        ],

        outro: [
          `If you did not initiate this recovery, proceed to take neccessary actions to protect your account.`,
          `Do not hesitate to contact us at support@familytree.com for further assistance.`,
        ],
      },
    };
    const template = mailGenerator.generate(html);
    const mail = {
      to: email,
      subject: 'Family-Tree | Password Reset',
      from: process.env.SENDING_MAIL,
      html: template,
    };
    return mailTransport(mail.from, mail.to, mail.subject, mail.html);
    // return mailTransport(mail);
  }
};

export const passwordResetSuccessMail = new PasswordResetSuccessMail();
