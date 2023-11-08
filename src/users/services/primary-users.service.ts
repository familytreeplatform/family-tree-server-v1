import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PrimaryUser,
  PrimaryUserDocument,
  PrimaryUserProfile,
  PrimaryUserProfileDocument,
} from '../schemas';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { IResponse } from 'src/interfaces';
import { CreatePrimaryUserDto } from '../dto';
import { welcomeMail } from 'src/templates/mails';

@Injectable()
export class PrimaryUserService {
  private readonly logger = new Logger(PrimaryUserService.name);
  constructor(
    @InjectModel(PrimaryUser.name)
    private primaryUser: Model<PrimaryUserDocument>,
    @InjectModel(PrimaryUserProfile.name)
    private primaryUserProfile: Model<PrimaryUserProfileDocument>,
  ) {}

  async findUserByEmail(email: string): Promise<IResponse> {
    this.logger.log(`lookup user with email: [${email}]...`);
    let response: IResponse;

    try {
      const user = await this.primaryUser.findOne({ email });

      if (!user) {
        return (response = {
          statusCode: 404,
          message: `no user found with email`,
          data: null,
          error: {
            code: 'user_not_found',
            message: `user with email ${email} not found`,
          },
        });
      } else {
        return (response = {
          statusCode: 200,
          message: `user fetched successfully`,
          data: user,
          error: null,
        });
      }
    } catch (err) {
      this.logger.error(
        `an error occur fetching user with email: [${email}]` +
          JSON.stringify(err, null, 2),
      );

      return (response = {
        statusCode: 400,
        message: `error fetching user with email: [${email}]`,
        data: null,
        error: {
          code: 'user_by_email_fetch_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      });
    }
  }

  async getUserById(userId: any): Promise<IResponse> {
    this.logger.log(`lookup user with id: [${userId}]...`);
    let response: IResponse;

    try {
      const user = await this.primaryUser
        .findOne({ _id: userId })
        .populate(['profile']);

      if (!user) {
        return (response = {
          statusCode: 404,
          message: `invalid id: user does not exist`,
          data: null,
          error: {
            code: 'user_not_found',
            message: `user with id ${userId} not found`,
          },
        });
      } else {
        user.password = null;
        return (response = {
          statusCode: 200,
          message: `user fetched successfully`,
          data: user,
          error: null,
        });
      }
    } catch (err) {
      console.log(err);

      this.logger.error(
        `an error occur fetching user with id: [${userId}]` +
          JSON.stringify(err, null, 2),
      );

      return (response = {
        statusCode: 400,
        message: `error fetching user with id: [${userId}]`,
        data: null,
        error: {
          code: 'user_by_id_fetch_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      });
    }
  }

  async signup(createPrimaryUserDto: CreatePrimaryUserDto): Promise<IResponse> {
    let response: IResponse;
    const { email, password, fullName } = createPrimaryUserDto;
    const isUniqueUser = await this.findUserByEmail(email);

    if (isUniqueUser.data) {
      return (response = {
        statusCode: 400,
        message: `user with this mail already exist`,
        data: null,
        error: {
          code: 'mail_already_exist',
          message: `user with email ${email} already exist`,
        },
      });
    } else {
      // TODO: Handle file upload to DO spaces here
      // TODO: Generate OTP and send via mail or SMS

      try {
        this.logger.log(`creating new user...`);
        const newUser = await this.primaryUser.create({
          ...createPrimaryUserDto,
          password: await argon2.hash(password),
        });

        await welcomeMail.mail(email, fullName);

        return (response = {
          statusCode: 201,
          message: 'user created successfully',
          data: newUser,
          error: null,
        });
      } catch (err) {
        console.log(err);

        this.logger.error(
          `error creating new user: ` + JSON.stringify(err, null, 2),
        );

        return (response = {
          statusCode: 400,
          message: 'user creation failed',
          data: null,
          error: {
            code: 'user_create_failed',
            message:
              `an unexpected error occurred while processing the request: error ` +
              JSON.stringify(err, null, 2),
          },
        });
      }
    }
  }

  async validateUserName(userName: string): Promise<Boolean> {
    const isValidUserName = await this.primaryUser.findOne({ userName });

    if (!isValidUserName) return true;
    return false;
  }
}
