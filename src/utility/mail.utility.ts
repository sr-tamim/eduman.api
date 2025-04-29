import * as nodemailer from 'nodemailer';

// send mail function
export const sendEmail = (
  to: string,
  subject: string,
  body: {
    html: string;
    text: string;
  },
) => {
  const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: true,
    auth: {
      user: process.env.MAIL_SENDER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'SR Tamim <saifur.tamim@gmail.com>',
    to,
    subject,
    text: body.text,
    html: body.html,
  };

  return transporter.sendMail(mailOptions);
};
