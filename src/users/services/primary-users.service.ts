import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PrimaryUser, PrimaryUserDocument } from '../schemas';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { IResponse } from 'src/interfaces';
import {
  CreatePrimaryUserDto,
  UpdatePrimaryUserDto,
  searchUserDto,
} from '../dto';
import { welcomeMail } from 'src/templates/mails';
import { DospacesService } from 'src/dospaces/dospaces.service';

@Injectable()
export class PrimaryUserService {
  private readonly logger = new Logger(PrimaryUserService.name);
  constructor(
    @InjectModel(PrimaryUser.name)
    private primaryUserModel: Model<PrimaryUserDocument>,
    private readonly doSpacesService: DospacesService,
  ) {}

  async findUserByEmail(email: string): Promise<IResponse> {
    this.logger.log(`lookup user with email: [${email}]...`);
    let response: IResponse;

    try {
      const user = await this.primaryUserModel.findOne({ email });

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
      const user = await this.primaryUserModel.findOne({ _id: userId });

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

  async searchUser(searchUserDto: searchUserDto) {
    let response: IResponse;

    try {
      const user = await this.primaryUserModel.find({
        $or: [
          { email: searchUserDto.email },
          { userName: searchUserDto.userName },
        ],
      });

      const key = searchUserDto.email ? 'email' : 'username';
      const value = searchUserDto.email
        ? searchUserDto.email
        : searchUserDto.userName;

      if (user.length === 0) {
        return (response = {
          statusCode: 404,
          message: `no user found with this ${key}`,
          data: null,
          error: {
            code: 'user_not_found',
            message: `user with ${key}: ${value} not found`,
          },
        });
      }

      return (response = {
        statusCode: 200,
        message: `user with ${key}: ${value} retrived successfully`,
        data: user[0],
        error: null,
      });
    } catch (err) {
      console.log(err);

      this.logger.error(
        `an error occur searching user` + JSON.stringify(err, null, 2),
      );

      return (response = {
        statusCode: 400,
        message: `error searching user`,
        data: null,
        error: {
          code: 'user_search_failed',
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
      let profilePicURL: string;
      if (createPrimaryUserDto.profilePic) {
        const fileUploadResult = await this.doSpacesService.uploadFile(
          createPrimaryUserDto.profilePic,
          'profile-pictures',
        );
        profilePicURL = fileUploadResult;
      } else if (
        !createPrimaryUserDto.profilePic &&
        createPrimaryUserDto.gender === 'male'
      ) {
        profilePicURL =
          'https://familytreeapp-bucket.nyc3.cdn.digitaloceanspaces.com/defaults/male-avatar.png';
      } else {
        profilePicURL =
          'https://familytreeapp-bucket.nyc3.cdn.digitaloceanspaces.com/defaults/female-avatar.png';
      }

      // TODO: Generate OTP and send via mail or SMS

      try {
        this.logger.log(`creating new user...`);
        const newUser = await this.primaryUserModel.create({
          ...createPrimaryUserDto,
          profilePic: profilePicURL,
          password: await argon2.hash(password),
        });

        // await welcomeMail.mail(email, fullName);

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

  async updateUser(userId: any, updatePrimaryUserDto: UpdatePrimaryUserDto) {
    let response: IResponse;

    let validatePhoneUnique: PrimaryUserDocument;
    if (updatePrimaryUserDto.phone) {
      validatePhoneUnique = await this.primaryUserModel.findOne({
        phone: updatePrimaryUserDto.phone,
      });
    }

    if (validatePhoneUnique) {
      return (response = {
        statusCode: 400,
        message: 'phone number already exists',
        data: null,
        error: null,
      });
    }

    try {
      const user = await this.getUserById(userId);
      if (!user.data || user.data === null) {
        return (response = user);
      }

      if (updatePrimaryUserDto.password) {
        updatePrimaryUserDto.password = await argon2.hash(
          updatePrimaryUserDto.password,
        );
      }

      const updated = await this.primaryUserModel.findOneAndUpdate(
        { _id: userId },
        { $set: updatePrimaryUserDto },
        { new: true },
      );

      updated.password = null;
      return (response = {
        statusCode: 200,
        message: 'user updated successfully',
        data: updated,
        error: null,
      });
    } catch (err) {
      console.log(err);

      this.logger.error(`error updating user: ` + JSON.stringify(err, null, 2));

      return (response = {
        statusCode: 400,
        message: 'user update failed',
        data: null,
        error: {
          code: 'user_update_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      });
    }
  }

  async validateEmail(email: string): Promise<IResponse> {
    this.logger.log(`validating email is unique: [${email}]...`);
    let response: IResponse;

    try {
      const isUniqueMail = await this.primaryUserModel.findOne({ email });

      if (!isUniqueMail) {
        return (response = {
          statusCode: 200,
          message: `email valid`,
          data: true,
          error: null,
        });
      } else {
        return (response = {
          statusCode: 409,
          message: `user with this mail already exists`,
          data: false,
          error: null,
        });
      }
    } catch (err) {
      this.logger.error(
        `an error occur fetching validating email: [${email}]` +
          JSON.stringify(err, null, 2),
      );

      return (response = {
        statusCode: 400,
        message: `error validating email: [${email}]`,
        data: null,
        error: {
          code: 'email_validation_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      });
    }
  }

  async validateUserName(userName: string): Promise<IResponse> {
    let response: IResponse;

    try {
      const isValidUserName = await this.primaryUserModel.findOne({ userName });

      if (!isValidUserName) {
        return (response = {
          statusCode: 200,
          message: `username valid`,
          data: true,
          error: null,
        });
      }
      return (response = {
        statusCode: 409,
        message: `a user with this username already exist`,
        data: false,
        error: null,
      });
    } catch (err) {
      console.log(err);

      this.logger.error(
        `an error occur while verifying username: [${userName}]` +
          JSON.stringify(err, null, 2),
      );

      return (response = {
        statusCode: 400,
        message: `error validating username: [${userName}]`,
        data: null,
        error: {
          code: 'username_verify_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      });
    }
  }
}
