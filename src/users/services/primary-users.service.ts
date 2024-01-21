import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PrimaryUser,
  PrimaryUserDocument,
  PrimaryUserWiki,
  PrimaryuserWikiDocument,
} from '../schemas';
import { Model, Types } from 'mongoose';
import * as argon2 from 'argon2';
import { IResponse } from 'src/interfaces';
import {
  CreatePrimaryUserDto,
  CreatePrimaryUserWikiDto,
  UpdatePrimaryUserDto,
  searchUserDto,
} from '../dto';
import { welcomeMail } from 'src/templates/mails';
import { Throttle } from '@nestjs/throttler';
import { HelperFn } from 'src/common/helpers/helper-fn';

@Throttle({ default: { limit: 5, ttl: 60000 } })
@Injectable()
export class PrimaryUserService {
  private readonly logger = new Logger(PrimaryUserService.name);
  constructor(
    @InjectModel(PrimaryUser.name)
    private primaryUserModel: Model<PrimaryUserDocument>,
    @InjectModel(PrimaryUserWiki.name)
    private primaryUserWikiModel: Model<PrimaryuserWikiDocument>,
  ) {}

  async findUserByEmail(email: string): Promise<IResponse> {
    this.logger.log(`lookup user with email: [${email}]...`);

    try {
      const user = await (
        await this.primaryUserModel.findOne({ email })
      ).populate('wiki');

      if (!user) {
        return <IResponse>{
          statusCode: 404,
          message: `no user found with this email`,
          data: null,
          error: {
            code: 'user_not_found',
            message: `user with email ${email} not found`,
          },
        };
      } else {
        return <IResponse>{
          statusCode: 200,
          message: `user fetched successfully`,
          data: user,
          error: null,
        };
      }
    } catch (err) {
      this.logger.error(
        `an error occur fetching user with email: [${email}]` +
          JSON.stringify(err, null, 2),
      );

      return <IResponse>{
        statusCode: 400,
        message: `error fetching user with email: [${email}]`,
        data: null,
        error: {
          code: 'user_by_email_fetch_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      };
    }
  }

  async getUserById(userId: any): Promise<IResponse> {
    this.logger.log(`lookup user with id: [${userId}]...`);

    try {
      const user = await this.primaryUserModel
        .findOne({ _id: userId })
        .select('families')
        .populate({
          path: 'families',
          select: 'familyName familyUsername familyCoverImage members wiki',
          populate: [
            {
              path: 'members',
              select: 'relationshipToRoot familyType user',
              populate: {
                path: 'user',
                select: 'fullName gender profilePic wiki',
                populate: {
                  path: 'wiki',
                },
              },
            },
            { path: 'wiki' },
          ],
        });

      if (!user) {
        return <IResponse>{
          statusCode: 404,
          message: `invalid id: user does not exist`,
          data: null,
          error: {
            code: 'user_not_found',
            message: `user with id [${userId}] not found`,
          },
        };
      } else {
        user.password = undefined;

        user.families.map((family) => {
          return (family.membersCount = family.members.length);
        });

        return <IResponse>{
          statusCode: 200,
          message: `user fetched successfully`,
          data: user,
          error: null,
        };
      }
    } catch (err) {
      console.log(err);

      this.logger.error(
        `an error occur fetching user with id: [${userId}]` +
          JSON.stringify(err, null, 2),
      );

      return <IResponse>{
        statusCode: 400,
        message: `error fetching user with id: [${userId}]`,
        data: null,
        error: {
          code: 'user_by_id_fetch_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      };
    }
  }

  async searchUser(searchUserDto: searchUserDto) {
    const { searchText } = searchUserDto;

    try {
      const user = await this.primaryUserModel.find({
        $or: [{ email: searchText }, { userName: searchText }],
      });

      if (user.length === 0) {
        return <IResponse>{
          statusCode: 404,
          message: `no user found with this record: ${searchText}`,
          data: null,
          error: {
            code: 'user_not_found',
            message: `user with [${searchText}] not found`,
          },
        };
      }

      const { _id, fullName, userName, profilePic, phone } = user[0];
      const safeUser = { _id, fullName, userName, profilePic, phone };
      return <IResponse>{
        statusCode: 200,
        message: `user with [${searchText}] retrived successfully`,
        data: safeUser,
        error: null,
      };
    } catch (err) {
      console.log(err);

      this.logger.error(
        `an error occur searching user` + JSON.stringify(err, null, 2),
      );

      return <IResponse>{
        statusCode: 400,
        message: `error searching user`,
        data: null,
        error: {
          code: 'user_search_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      };
    }
  }

  async signup(createPrimaryUserDto: CreatePrimaryUserDto): Promise<IResponse> {
    const { email, password, fullName } = createPrimaryUserDto;
    let userWithPhone: IResponse;

    if (createPrimaryUserDto.phone) {
      userWithPhone = await this.validatePhone(createPrimaryUserDto.phone);
    }

    if (!userWithPhone.data) {
      return <IResponse>{
        statusCode: 400,
        message: `user with this phone number already exist`,
        data: null,
        error: {
          code: 'phone_already_exist',
          message: `user with phone ${createPrimaryUserDto.phone} already exist`,
        },
      };
    } else {
      // TODO: Generate OTP and send via mail or SMS (if this is enabled, then stop login token generation)

      try {
        this.logger.log(`creating new user...`);
        const newUser = await this.primaryUserModel.create({
          ...createPrimaryUserDto,
          password: await argon2.hash(password),
        });

        await welcomeMail.mail(email, fullName);
        const tokens = HelperFn.signJwtToken(newUser._id);

        newUser.password = undefined;
        return <IResponse>{
          statusCode: 201,
          message: 'user created successfully',
          data: tokens,
          error: null,
        };
      } catch (err) {
        console.log(err);

        this.logger.error(
          `error creating new user: ` + JSON.stringify(err, null, 2),
        );

        return <IResponse>{
          statusCode: 400,
          message: 'user creation failed',
          data: null,
          error: {
            code: 'user_create_failed',
            message:
              `an unexpected error occurred while processing the request: error ` +
              JSON.stringify(err, null, 2),
          },
        };
      }
    }
  }

  async updateUser(userId: any, updatePrimaryUserDto: UpdatePrimaryUserDto) {
    let validatePhoneUnique: IResponse;

    this.logger.log(`testing and validating req.body phone number uniqueness`);
    if (updatePrimaryUserDto.phone) {
      validatePhoneUnique = await this.validatePhone(
        updatePrimaryUserDto.phone,
      );
    }

    if (!validatePhoneUnique.data) {
      return <IResponse>{
        statusCode: 400,
        message: 'phone number already exists',
        data: null,
        error: null,
      };
    }

    this.logger.log(`testing req.body for password field... `);
    if (updatePrimaryUserDto.password) {
      updatePrimaryUserDto.password = await argon2.hash(
        updatePrimaryUserDto.password,
      );
    }

    this.logger.log(`testing req.body for wiki field...`);
    if (updatePrimaryUserDto.wiki) {
      await this.createUserWiki({
        userId: userId.toString(),
        wiki: updatePrimaryUserDto.wiki,
      });
    }
    delete updatePrimaryUserDto.wiki;

    try {
      this.logger.log(`updating user document...`);
      const updated = await this.primaryUserModel
        .findOneAndUpdate(
          { _id: userId },
          { $set: updatePrimaryUserDto },
          { new: true },
        )
        .populate('wiki');

      updated.password = null;
      return <IResponse>{
        statusCode: 200,
        message: 'user updated successfully',
        data: updated,
        error: null,
      };
    } catch (err) {
      console.log(err);

      this.logger.error(`error updating user: ` + JSON.stringify(err, null, 2));

      return <IResponse>{
        statusCode: 400,
        message: 'user update failed',
        data: null,
        error: {
          code: 'user_update_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      };
    }
  }

  async validateEmail(email: string): Promise<IResponse> {
    this.logger.log(`validating email is unique: [${email}]...`);

    try {
      const isUniqueMail = await this.primaryUserModel.findOne({ email });

      if (!isUniqueMail) {
        return <IResponse>{
          statusCode: 200,
          message: `email valid`,
          data: true,
          error: null,
        };
      } else {
        return <IResponse>{
          statusCode: 409,
          message: `user with this mail already exists`,
          data: false,
          error: null,
        };
      }
    } catch (err) {
      this.logger.error(
        `an error occur validating email: [${email}]` +
          JSON.stringify(err, null, 2),
      );

      return <IResponse>{
        statusCode: 400,
        message: `error validating email: [${email}]`,
        data: null,
        error: {
          code: 'email_validation_failed',
          message: `an unexpected error occurred while processing the request`,
          error: JSON.stringify(err, null, 2),
        },
      };
    }
  }

  private async validatePhone(phone: string): Promise<IResponse> {
    this.logger.log(`validating phone is unique: [${phone}]...`);

    try {
      const isUniquePhone = await this.primaryUserModel.findOne({ phone });

      if (!isUniquePhone) {
        return <IResponse>{
          statusCode: 200,
          message: `phone valid`,
          data: true,
          error: null,
        };
      } else {
        return <IResponse>{
          statusCode: 409,
          message: `user with this phone already exists`,
          data: false,
          error: null,
        };
      }
    } catch (err) {
      this.logger.error(
        `an error occur validating phone number: [${phone}]` +
          JSON.stringify(err, null, 2),
      );

      return <IResponse>{
        statusCode: 400,
        message: `error validating phone number: [${phone}]`,
        data: null,
        error: {
          code: 'phone_validation_failed',
          message: `an unexpected error occurred while processing the request`,
          error: JSON.stringify(err, null, 2),
        },
      };
    }
  }

  async validateUserName(userName: string): Promise<IResponse> {
    try {
      const isValidUserName = await this.primaryUserModel.findOne({ userName });

      if (!isValidUserName) {
        return <IResponse>{
          statusCode: 200,
          message: `username available`,
          data: true,
          error: null,
        };
      }
      return <IResponse>{
        statusCode: 409,
        message: `username ${userName} is taken`,
        data: false,
        error: null,
      };
    } catch (err) {
      console.log(err);

      this.logger.error(
        `an error occur while verifying username: [${userName}]` +
          JSON.stringify(err, null, 2),
      );

      return <IResponse>{
        statusCode: 400,
        message: `error validating username: [${userName}]`,
        data: null,
        error: {
          code: 'username_verify_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      };
    }
  }

  private async createUserWiki(dto: CreatePrimaryUserWikiDto) {
    console.log('WIKI', dto);

    try {
      const newWiki = await this.primaryUserWikiModel.create({
        user: new Types.ObjectId(dto.userId),
        wiki: dto.wiki,
      });

      if (!newWiki) return null;
      await this.primaryUserModel.findOneAndUpdate(
        { _id: new Types.ObjectId(dto.userId) },
        { $set: { wiki: newWiki._id } },
        { new: true },
      );
    } catch (err) {
      console.error(
        `Error creating user wiki for family with ID [${dto.userId}]: ` + err,
      );

      throw err;
    }
  }
}
