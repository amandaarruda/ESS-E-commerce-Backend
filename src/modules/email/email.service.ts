import { InternalServerErrorException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { isTestEnviroment } from 'src/utils/environment';
import { MessagesHelperKey, getMessage } from 'src/utils/messages.helper';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  sendEmail = async (
    markup: string,
    subject: string,
    sendToEmail: string,
    optionals?: {
      files?: {
        filename: string;
        contentType: string;
        cid: string;
        content: string;
      }[];
      attachments?: {
        content: string;
        filename: string;
        type: string;
        content_id: string;
        disposition: string;
      }[];
    },
  ): Promise<void> => {
    const mailOptions = {
      from: process.env.EMAIL_OPTIONS_FROM,
      to: sendToEmail,
      subject: subject,
      html: markup,
      ...(optionals?.attachments && {
        attachments: [...optionals?.attachments],
      }),
      mail_settings: {
        sandbox_mode: {
          enable: isTestEnviroment(),
        },
      },
    };

    this.logger.debug(`Sending email to ${sendToEmail}`);

    await sgMail.send(mailOptions).catch(error => {
      if (error) {
        throw new InternalServerErrorException(
          getMessage(MessagesHelperKey.FAIL_SENDING_EMAIL),
        );
      }
    });
  };
}
