import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { PrimaryUser, PrimaryUserDocument } from 'src/users/schemas';
import { DefaultSignInDto, ForgotPasswordDto, PasswordResetDto } from './dto';
import { IResponse } from 'src/interfaces';
import { HelperFn } from 'src/common/helpers/helper-fn';
import { getRandomDigits } from 'src/common/utils';
import { otpCodeResend, passwordResetMail } from 'src/templates/mails';
import { PrimaryUserService } from 'src/users/services';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(PrimaryUser.name)
    private primaryUser: Model<PrimaryUserDocument>,
    private readonly primaryUserService: PrimaryUserService,
  ) {}

  async signin(dto: DefaultSignInDto): Promise<IResponse> {
    let response: IResponse;
    const { email, password } = dto;
    this.logger.log(`checking user in primary users collections...`);
    let user = await this.primaryUser.findOne({ email });
    // TODO: check user in admin collection

    if (user === undefined || user === null) {
      return (response = {
        statusCode: 404,
        message: 'user with this mail does not exist',
        data: null,
        error: {
          code: 'user_not_found',
          message: `no user with email ${email} was found`,
        },
      });
    } else {
      const passMatches = await argon2.verify(user.password, password);

      if (!passMatches) {
        return (response = {
          statusCode: 400,
          message: 'invalid login credentials',
          data: null,
          error: {
            code: 'incorrect_password',
            message: `invalid login credentials`,
          },
        });
      } else {
        const tokens = HelperFn.signJwtToken(user._id);
        // this.logger.log(`updating refresh...`);
        // await this.updateRefreshToken(user._id, tokens.refreshToken);

        return (response = {
          statusCode: 200,
          message: 'signed in successfully',
          data: tokens,
          error: null,
        });
      }
    }
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<IResponse> {
    let response: IResponse;
    const { email } = forgotPasswordDto;
    try {
      const user = await this.primaryUser.findOne({
        email,
      });

      if (!user)
        return (response = {
          statusCode: 404,
          message: 'user with this mail does not exist',
          data: null,
          error: {
            code: 'user_not_found',
            message: `no user with email ${email} was found`,
          },
        });

      const otp = getRandomDigits(6);
      const secretTokenExpiration = HelperFn.signJwtToken(user._id, '10min');

      await passwordResetMail.mail(email, otp, user.fullName);

      if ('token' in secretTokenExpiration) {
        await this.primaryUser.updateOne(
          { _id: user._id },
          {
            $set: {
              secretToken: otp,
              secretTokenExpiration: secretTokenExpiration.token,
            },
          },
          { new: true },
        );
      }

      return (response = {
        statusCode: 200,
        message: 'password reset mail sent successfully',
        data: null,
        error: null,
      });
    } catch (err) {
      console.log(err);

      this.logger.error(
        `error updating user record with password reset details: ` +
          JSON.stringify(err, null, 2),
      );

      return (response = {
        statusCode: 400,
        message: 'password mail sending failed',
        data: null,
        error: {
          code: 'pasword_reset_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      });
    }
  }

  async resetPassword(passwordResetDto: PasswordResetDto) {
    let response: IResponse;
    const { otp, password } = passwordResetDto;

    try {
      let userWithOtp;
      userWithOtp = await this.primaryUser.findOne({ secretToken: otp });
      if (!userWithOtp) {
        return (response = {
          statusCode: 404,
          message: 'invalid otp code',
          data: null,
          error: null,
        });
      }

      if (userWithOtp.role === 'primaryuser') {
        await this.primaryUser.updateOne(
          { _id: userWithOtp._id },
          {
            $set: { password: await argon2.hash(password), secretToken: null },
          },
          { new: true },
        );
      }

      return {
        statusCode: 200,
        message: 'Password reset successfully',
        data: userWithOtp,
        error: null,
      };
    } catch (err) {
      console.log(err);

      this.logger.error(`error resetting password: ` + JSON.stringify(err));

      return {
        statusCode: 400,
        message: 'password reset failed',
        data: null,
        error: {
          code: 'password_reset_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            err,
        },
      };
    }
  }

  async resendOtp(forgotPasswordDto: ForgotPasswordDto) {
    let response: IResponse;
    let userWithMail;

    const { email } = forgotPasswordDto;

    userWithMail = await this.primaryUserService.findUserByEmail(
      forgotPasswordDto.email,
    );

    if (!userWithMail.data) {
      return {
        statusCode: 404,
        message: `invalid email address`,
        data: null,
        error: {
          code: 'user_not_found',
          message: `user with email ${email} not found`,
        },
      };
    }

    if (userWithMail.data.secretToken == null) {
      return (response = {
        statusCode: 400,
        message: `user has no otp set`,
        data: null,
        error: {
          code: 'user_no_otp',
          message: `user has not requested any otp service`,
        },
      });
    }

    this.logger.log(`generating user otp...`);
    const otp = getRandomDigits(6);

    this.logger.log(`resending otp to user [${email}]...`);
    await otpCodeResend.mail(email, otp);

    try {
      this.logger.log(`updating user with new code...`);
      if (userWithMail.role === 'primaryuser') {
        await this.primaryUser.findOneAndUpdate(
          { _id: userWithMail.data._id },
          { $set: { secretToken: otp } },
          { new: true },
        );
      }

      return {
        statusCode: 200,
        message: 'otp code resent successfully',
        data: null,
        error: null,
      };
    } catch (err) {
      this.logger.error(
        `error resending otp code: ` + JSON.stringify(err, null, 2),
      );

      return {
        statusCode: 400,
        message: 'OTP code resend failed',
        data: null,
        error: {
          code: 'token_resend_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      };
    }
  }

  async validateOtp(otp: string): Promise<IResponse> {
    let response: IResponse;

    try {
      const userWithOtp = await this.primaryUser.findOne({ secretToken: otp });

      if (!userWithOtp) {
        return (response = {
          statusCode: 400,
          message: `invalid otp, request for a new one`,
          data: false,
          error: null,
        });
      }
      const isNotExpiredOtp = HelperFn.verifyTokenExpiration(
        userWithOtp.secretTokenExpiration,
      );

      if ('data' in isNotExpiredOtp && isNotExpiredOtp.data === false) {
        return (response = {
          statusCode: 400,
          message: `expired otp, request for a new one`,
          data: false,
          error: null,
        });
      }

      return (response = {
        statusCode: 200,
        message: `otp valid`,
        data: true,
        error: null,
      });
    } catch (err) {
      console.log(err);

      this.logger.error(
        `an error occur while verifying otp: [${otp}]` +
          JSON.stringify(err, null, 2),
      );

      return (response = {
        statusCode: 400,
        message: `error validating otp: [${otp}]`,
        data: null,
        error: {
          code: 'otp_verify_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      });
    }
  }
}
