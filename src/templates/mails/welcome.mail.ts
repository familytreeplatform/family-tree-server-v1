import { mailGenerator, mailTransport } from 'src/common/configs';

const WelcomeMail = class {
  async mail(email: string, name?: string) {
    const html = {
      body: {
        signature: false,
        greeting: `Hello ${name}`,
        intro: [
          `Welcome to the family tree app platform, we're glad to have you`,
          `While you're here, meet, connect and interact with all your immediate, faraway and long lost family members`,
        ],
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

export const welcomeMail = new WelcomeMail();
