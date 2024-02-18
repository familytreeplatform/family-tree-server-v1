import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId, Types } from 'mongoose';
import {
  Family,
  FamilyDocument,
  FamilyMember,
  FamilyMemberDocument,
  FamilyWiki,
  FamilyWikiDocument,
} from '../schemas';
import { PrimaryUser, PrimaryUserDocument } from 'src/users/schemas';
import {
  CreateFamilyDto,
  CreateFamilyWikiDto,
  FamilyTypeUiqueValidateDto,
  JoinFamilyDto,
  LinkToRootDto,
  MemberSearchDto,
  QueryFamiliesDto,
  SearchFamilyDto,
  UpdateFamilyMemberDto,
} from '../dto';
import { IResponse } from 'src/interfaces';
import { generateJoinLink } from 'src/common/utils';
import { HelperFn } from 'src/common/helpers/helper-fn';
import { zeroToFirstGenerationFamilyRelations } from '../types';
import { FamilyRelationshipValidateDto } from '../dto/family-relationship-validate.dto';

@Injectable()
export class FamilyService {
  private readonly logger = new Logger(FamilyService.name);
  constructor(
    @InjectModel(Family.name)
    private familyModel: Model<FamilyDocument>,
    @InjectModel(PrimaryUser.name)
    private primaryUserModel: Model<PrimaryUserDocument>,
    @InjectModel(FamilyMember.name)
    private familyMemberModel: Model<FamilyMemberDocument>,
    @InjectModel(FamilyWiki.name)
    private familyWikiModel: Model<FamilyWikiDocument>,
  ) {}

  async createFamily(createFamilyDto: CreateFamilyDto): Promise<IResponse> {
    const familyUserName = `${
      createFamilyDto.familyName
    }${HelperFn.generateRandomNumber(3)}`;

    // const familyCoverImageURL = createFamilyDto.familyCoverImage
    //   ? await this.defaultService.uploadFile(
    //       createFamilyDto.familyCoverImage,
    //       'family-cover-image',
    //     )
    //   : undefined;

    try {
      if (createFamilyDto.root) {
        return await this.createFamilyWithExistingRoot(
          createFamilyDto,
          familyUserName,
          createFamilyDto.familyCoverImageURL,
        );
      } else {
        return await this.createFamilyWithNewRoot(
          createFamilyDto,
          familyUserName,
          createFamilyDto.familyCoverImageURL,
        );
      }
    } catch (err) {
      console.log(err);

      this.logger.error(
        `error creating new family: ` + JSON.stringify(err, null, 2),
      );

      return <IResponse>{
        statusCode: 400,
        message: 'family creation failed',
        data: null,
        error: {
          code: 'family_create_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      };
    }
  }

  async joinFamily(joinFamilyDto: JoinFamilyDto): Promise<IResponse> {
    let response: IResponse;

    // Edge case: validating family exist
    const isFamilyExist = await this.getFamilyById(joinFamilyDto.familyId);

    if (!isFamilyExist.data || isFamilyExist.data === null) {
      return (response = {
        statusCode: 404,
        message: `this family does not exist`,
        data: null,
        error: {
          code: 'family_not_found',
          message: `family with id ${joinFamilyDto.familyId} not found`,
        },
      });
    }

    // const isUserAlreadyInSameFamilyType = await this.familyMemberModel.findOne({
    //   user: new mongoose.Types.ObjectId(joinFamilyDto.user),
    //   family: new mongoose.Types.ObjectId(joinFamilyDto.familyId),
    //   familyType: joinFamilyDto.familyType,
    // });

    // if (isUserAlreadyInSameFamilyType) {
    //   return (response = {
    //     statusCode: 400,
    //     message: `you're already a member of this family`,
    //     data: null,
    //   });
    // }

    try {
      // create a family member record for user joining a family
      const createFamilyMember = await this.familyMemberModel.create({
        ...joinFamilyDto,
        family: joinFamilyDto.familyId,
        familyUsername: isFamilyExist.data.familyUsername,
        familyType: isFamilyExist.data.familyType,
        parent: zeroToFirstGenerationFamilyRelations.includes(
          joinFamilyDto.relationshipToRoot,
        )
          ? isFamilyExist.data.root
          : null,
      });

      await this.familyModel.findByIdAndUpdate(
        { _id: joinFamilyDto.familyId },
        { $push: { members: createFamilyMember._id } },
        { new: true },
      );

      await this.primaryUserModel.findByIdAndUpdate(
        { _id: new mongoose.Types.ObjectId(joinFamilyDto.user) },
        {
          $push: {
            families: new mongoose.Types.ObjectId(joinFamilyDto.familyId),
          },
        },
        { new: true },
      );

      await this.familyWikiModel.findOneAndUpdate(
        { family: new mongoose.Types.ObjectId(joinFamilyDto.familyId) },
        { $push: { editors: new mongoose.Types.ObjectId(joinFamilyDto.user) } },
        { new: true },
      );

      if (
        !zeroToFirstGenerationFamilyRelations.includes(
          joinFamilyDto.relationshipToRoot,
        )
      ) {
        /**
         * the $match stage currently include all relationshipToRoot values
         * not including root, spouse and the relationshipToRoot the new mamber selected.
         * TODO: make this to return only records of relationships higher than that of the new member.
         */
        const potentialLinksToRoot = await this.familyMemberModel.aggregate([
          {
            $match: {
              family: new mongoose.Types.ObjectId(joinFamilyDto.familyId),
              relationshipToRoot: {
                $nin: ['root', 'spouse', joinFamilyDto.relationshipToRoot],
              },
            },
          },
          {
            $sort: {
              relationshipToRoot: 1,
            },
          },
          {
            $limit: 20,
          },
          {
            $lookup: {
              from: 'primaryusers',
              localField: 'parent',
              foreignField: '_id',
              as: 'parentInfo',
            },
          },
          {
            $unwind: '$parentInfo',
          },
          {
            $project: {
              _id: 1,
              family: 1,
              relationshipToRoot: 1,
              user: 1,
              familyUsername: 1,
              parentInfo: {
                _id: 1,
                userName: 1,
                fullName: 1,
                profilePic: 1,
                creator: 1,
                isActive: 1,
                gender: 'male',
              },
            },
          },
        ]);

        return (response = {
          statusCode: 200,
          message: `relationship is disconnected from root, create or select your parent who link you to the root`,
          data: potentialLinksToRoot,
        });
      }

      return (response = {
        statusCode: 200,
        message: `you've successfully joined ${isFamilyExist.data.familyName} family as a first generation member`,
        data: null,
        error: null,
      });
    } catch (err) {
      console.log(err);

      this.logger.error(
        `error adding new member to ${isFamilyExist.data.familyName} family ` +
          JSON.stringify(err, null, 3),
      );

      return (response = {
        statusCode: 400,
        message: 'family join failed',
        data: null,
        error: {
          code: 'family_join_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      });
    }
  }

  async getFamilyById(familyId: any): Promise<IResponse> {
    this.logger.log(`lookup user with id: [${familyId}]...`);

    try {
      const family = await this.familyModel
        .findOne({ _id: familyId })
        .populate('wiki')
        .populate('branches')
        .populate({
          path: 'members',
          populate: {
            path: 'user',
            model: 'PrimaryUser',
            select: '_id, fullName gender',
          },
        });

      if (!family) {
        return <IResponse>{
          statusCode: 404,
          message: `invalid id: family does not exist`,
          data: null,
          error: {
            code: 'family_not_found',
            message: `family with id ${familyId} not found`,
          },
        };
      } else {
        return <IResponse>{
          statusCode: 200,
          message: `family fetched successfully`,
          data: family,
          error: null,
        };
      }
    } catch (err) {
      console.log(err);

      this.logger.error(
        `an error occur fetching family with id: [${familyId}]` +
          JSON.stringify(err, null, 2),
      );

      return <IResponse>{
        statusCode: 400,
        message: `error fetching family with id: [${familyId}]`,
        data: null,
        error: {
          code: 'family_by_id_fetch_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      };
    }
  }

  async validateFamilyTypeUniqueness(
    familyTypeUiqueValidateDto: FamilyTypeUiqueValidateDto,
  ) {
    this.logger.log(
      `validating user doesn't already belong to a family of same type [MATERNAL or PATERNAL]`,
    );
    try {
      const userFamilyTypeUnique = await this.familyMemberModel
        .findOne({
          user: familyTypeUiqueValidateDto.userId,
          familyType: {
            $regex: new RegExp(familyTypeUiqueValidateDto.familyType, 'i'),
          },
        })
        .select('relationshipToRoot')
        .populate({
          path: 'family',
          select: 'familyName',
        });

      console.log('UNIQUE', userFamilyTypeUnique);
      if (!userFamilyTypeUnique) {
        this.logger.log(`family type not found`);
        return <IResponse>{
          statusCode: 200,
          message: `user does not belong to any family of same type`,
          data: false,
        };
      } else {
        this.logger.log(`family type found`);
        return <IResponse>{
          statusCode: 400,
          message: `you already belong to [${familyTypeUiqueValidateDto?.familyType} family ${userFamilyTypeUnique?.family?.familyName}]: to create or join a family of same type, first exit the one you're on first`,
          data: true,
        };
      }
    } catch (err) {
      console.log(err);

      this.logger.error(
        `an error occur while verifying family uniqueness` +
          JSON.stringify(err, null, 2),
      );

      return <IResponse>{
        statusCode: 400,
        message: `error verifying family uniqueness`,
        data: null,
        error: {
          code: 'family_uniqueness_verify_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      };
    }
  }

  async validateRelationshipToRoot(dto: FamilyRelationshipValidateDto) {
    let response: IResponse;
    if (
      !zeroToFirstGenerationFamilyRelations.includes(dto.relationshipToRoot)
    ) {
      return (response = {
        statusCode: 200,
        message: `relationship is disconnected from root, create or select your parent who link you to the root`,
        data: false,
      });
    }

    return (response = {
      statusCode: 200,
      message: `relationship is directly related to root, skip parent create`,
      data: true,
    });
  }


  //The code I worked on
  async searchMembers(dto: MemberSearchDto): Promise<IResponse> {
    const memberLink = await this.familyMemberModel
      .find({ family: dto.familyId })
      .populate({
        path: 'user',
        select: '_id fullName profilePic gender'
      });
    const userArray = [];
    const filteredArray = [];
    const regex = new RegExp(dto.search, 'i');

    memberLink.map((member) => userArray.push(member.user));

    userArray
      .filter((user) => regex.test(user.fullName))
      .map((user) =>
        filteredArray.push(user),
      );

    return {
      statusCode: 200,
      message: `search result successful`,
      data: filteredArray
    } 
  }

  async searchFamily(searchFamilyDto: SearchFamilyDto) {
    let response: IResponse;
    const { searchText } = searchFamilyDto;

    try {
      const families = await this.familyModel
        .find({
          $or: [
            {
              familyName: { $regex: new RegExp(searchText, 'i') },
            },
            {
              familyUsername: {
                $regex: new RegExp(searchText, 'i'),
              },
            },
            { country: new RegExp(searchText, 'i') },
            { state: { $regex: new RegExp(searchText, 'i') } },
          ],
        })
        .select(
          'root members familyName familyUsername familyCoverImage familyJoinLink',
        )
        .populate({
          path: 'root',
          select: 'fullName role profilePic',
        })
        .populate({
          path: 'members',
          select: '-family',
          options: { limit: 6 },
          populate: {
            path: 'user',
            select: 'relationshipToRoot userName fullName profilePic',
          },
        });

      if (families.length === 0) {
        return (response = {
          statusCode: 404,
          message: `no family found with ${searchText}`,
          data: null,
          error: null,
        });
      }

      return (response = {
        statusCode: 200,
        message: `families with [${searchText}] retrieved successfully`,
        data: families,
        error: null,
      });
    } catch (err) {
      console.log(err);

      this.logger.error(
        `an error occur searching family` + JSON.stringify(err, null, 2),
      );

      return (response = {
        statusCode: 400,
        message: `error searching family`,
        data: null,
        error: {
          code: 'family_search_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      });
    }
  }

  async queryFamilies(queryFamiliesDto: QueryFamiliesDto) {
    let response: IResponse;
    const { familyName, country, state, tribe } = queryFamiliesDto;

    try {
      const families = await this.familyModel
        .find({
          $and: [
            { familyName: { $regex: new RegExp(familyName, 'i') } },
            { country: { $regex: new RegExp(country, 'i') } },
            { state: { $regex: new RegExp(state, 'i') } },
            { tribe: { $regex: new RegExp(tribe, 'i') } },
          ],
        })
        .select(
          'root members familyName familyUsername familyCoverImage familyJoinLink',
        )
        .populate({
          path: 'root',
          select: 'fullName role profilePic',
        })
        .populate({
          path: 'members',
          select: '-family',
          options: { limit: 6 },
          populate: {
            path: 'user',
            select: 'relationshipToRoot userName fullName profilePic',
          },
        });

      if (families.length === 0) {
        return (response = {
          statusCode: 404,
          message: `no family found with these records`,
          data: null,
          error: null,
        });
      }

      return (response = {
        statusCode: 200,
        message: `families found with this record are`,
        data: families,
        error: null,
      });
    } catch (err) {
      console.log(err);

      this.logger.error(
        `an error occur querying family` + JSON.stringify(err, null, 2),
      );

      return (response = {
        statusCode: 400,
        message: `error querying family`,
        data: null,
        error: {
          code: 'family_querying_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      });
    }
  }

  /* 
  Get back to this, family members can all update family bio/wikipedia but 
  who's got the right to update other family records. THE CREATOR?
  */
  async updateFamily(
    userId: Types.ObjectId,
    familyId: Types.ObjectId,
    updateFamilyDto: Partial<CreateFamilyDto>,
  ) {
    try {
      const family = await this.getFamilyById(familyId);
      if (!family.data || family.data === null) {
        return family;
      }

      this.logger.log(`testing req.body for family wiki...`);
      if (updateFamilyDto.familyBio) {
        await this.updateFamilyWiki(userId, {
          familyId,
          wiki: updateFamilyDto.familyBio,
        });
      }

      const updated = await this.familyModel.findOneAndUpdate(
        { _id: familyId },
        { $set: updateFamilyDto },
        { new: true },
      );

      return <IResponse>{
        statusCode: 200,
        message: 'family updated successfully',
        data: updated,
        error: null,
      };
    } catch (err) {
      console.log(err);

      this.logger.error(
        `error updating family: ` + JSON.stringify(err, null, 2),
      );

      return <IResponse>{
        statusCode: 400,
        message: 'family update failed',
        data: null,
        error: {
          code: 'family_update_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      };
    }
  }

  async updateFamilyMember(updateFamilyMemberDto: UpdateFamilyMemberDto) {
    let response: IResponse;

    const requiredParentFields = [
      'newParentFullName',
      'newParentRelationshipToRoot',
      'newParentGender',
    ];

    // Edge case: validating family exist
    const isFamilyExist = await this.getFamilyById(
      updateFamilyMemberDto.familyId,
    );

    if (!isFamilyExist.data || isFamilyExist.data === null) {
      return (response = {
        statusCode: 404,
        message: `this family does not exist`,
        data: null,
        error: {
          code: 'family_not_found',
          message: `family with id ${updateFamilyMemberDto.familyId} not found`,
        },
      });
    }

    try {
      if (
        !requiredParentFields.every((element) =>
          Object.keys(updateFamilyMemberDto).includes(element),
        )
      ) {
        this.logger.log(`updating member with an existing user as parent`);
        await this.familyMemberModel.findOneAndUpdate(
          {
            user: new mongoose.Types.ObjectId(updateFamilyMemberDto.userId),
            family: new mongoose.Types.ObjectId(updateFamilyMemberDto.familyId),
          },
          {
            $set: {
              updateFamilyMemberDto,
              parent: new mongoose.Types.ObjectId(
                updateFamilyMemberDto.parentId,
              ),
            },
          },
          { new: true },
        );

        return (response = {
          statusCode: 200,
          message: 'record updated successfully',
          data: null,
          error: null,
        });
      }

      this.logger.log(
        `updating member with a newly created inactive user as parent`,
      );
      const newInActiveParent = await this.primaryUserModel.create({
        creator: new mongoose.Types.ObjectId(updateFamilyMemberDto.userId),
        fullName: updateFamilyMemberDto.newParentFullName,
        gender: updateFamilyMemberDto.newParentGender,
        userName: `${updateFamilyMemberDto.newParentFullName
          .replace(/\s+/g, '')
          .substring(0, 4)}${HelperFn.generateRandomNumber(3)}`,
        isActive: false,
        profilePic: updateFamilyMemberDto.newParentProfilePicUrl,
      });

      // create a family member record for new inactive parent
      const createFamilyMember = await this.familyMemberModel.create({
        relationshipToRoot: updateFamilyMemberDto.newParentRelationshipToRoot,
        family: updateFamilyMemberDto.familyId,
        familyUsername: isFamilyExist.data.familyUsername,
        familyType: isFamilyExist.data.familyType,
        user: newInActiveParent._id,
        parent: zeroToFirstGenerationFamilyRelations.includes(
          updateFamilyMemberDto.newParentRelationshipToRoot,
        )
          ? isFamilyExist.data.root
          : null,
      });

      // update the family with new parent as member
      await this.familyModel.findByIdAndUpdate(
        { _id: updateFamilyMemberDto.familyId },
        { $push: { members: createFamilyMember._id } },
        { new: true },
      );

      // update current user family document for famulyId with newly created parent
      await this.familyMemberModel.findOneAndUpdate(
        {
          user: new mongoose.Types.ObjectId(updateFamilyMemberDto.userId),
          family: new mongoose.Types.ObjectId(updateFamilyMemberDto.familyId),
        },
        {
          $set: {
            updateFamilyMemberDto,
            parent: new mongoose.Types.ObjectId(newInActiveParent._id),
          },
        },
        { new: true },
      );

      return (response = {
        statusCode: 200,
        message: 'your parental link to root has been updated successfully',
        data: null,
        error: null,
      });
    } catch (err) {
      console.log(err);

      this.logger.error(
        `error updating family member: ` + JSON.stringify(err, null, 2),
      );
      return (response = {
        statusCode: 400,
        message: 'family member update failed',
        data: null,
        error: {
          code: 'family_member_update_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      });
    }
  }

  async getPotentialRootLink(linkToRootDto: LinkToRootDto) {
    let response: IResponse;

    try {
      const potentialLinksToRoot = await this.familyMemberModel.aggregate([
        {
          $match: {
            family: new mongoose.Types.ObjectId(linkToRootDto.familyId),
            relationshipToRoot: {
              $nin: ['root', 'spouse', linkToRootDto.relationshipToRoot],
            },
          },
        },
        {
          $sort: {
            relationshipToRoot: 1,
          },
        },
        {
          $limit: 20,
        },
        {
          $lookup: {
            from: 'primaryusers',
            localField: 'parent',
            foreignField: '_id',
            as: 'parentInfo',
          },
        },
        {
          $unwind: '$parentInfo',
        },
        {
          $project: {
            _id: 1,
            family: 1,
            relationshipToRoot: 1,
            user: 1,
            familyUsername: 1,
            parentInfo: {
              _id: 1,
              userName: 1,
              fullName: 1,
              profilePic: 1,
              creator: 1,
              isActive: 1,
              gender: 'male',
            },
          },
        },
      ]);

      return (response = {
        statusCode: 200,
        message: `your potential links to your family root`,
        data: potentialLinksToRoot,
      });
    } catch (err) {
      console.log(err);

      return (response = {
        statusCode: 400,
        message:
          `an unexpected error occurred while processing your request ` + err,
      });
    }
  }

  private async createFamilyWithExistingRoot(
    createFamilyDto: CreateFamilyDto,
    familyUserName: string,
    familyCoverImageURL: string,
  ): Promise<IResponse> {
    try {
      this.logger.log(`CASE_ONE: existing user root`);

      /* 
      TODO?:Edge Case:
        if creator is root in say family A, check to make sure the person they're selecting as root 
        isn't already a member of thesame family A, if so, let them know this.
        PS: should probably be the first thing to do.
       */

      this.logger.log(
        `validating user selected as root isn't already root on another family...`,
      );
      const isSelectedRootAlreadyRooted = await this.primaryUserModel
        .findOne({ _id: createFamilyDto.root, role: 'root' })
        .populate({
          path: 'familyRootedTo',
          select: 'familyName familyUsername',
        });

      if (
        isSelectedRootAlreadyRooted &&
        isSelectedRootAlreadyRooted.familyRootedTo
      ) {
        return <IResponse>{
          statusCode: 400,
          message: `user selectd as root is already a root in ${isSelectedRootAlreadyRooted.familyRootedTo?.familyName} family, consider joining the family instead`,
          data: {
            familyUserName:
              isSelectedRootAlreadyRooted.familyRootedTo.familyUsername,
          },
          error: null,
        };
      }

      const newInActiveParent =
        await this.createInactiveParent(createFamilyDto);

      this.logger.log(
        `creating new family members document for root, possible inactive parent and creator`,
      );
      const initFamilyMembers = await this.familyMemberModel.insertMany([
        {
          relationshipToRoot: 'root',
          familyUsername: familyUserName,
          familyType: createFamilyDto.familyType,
          user: createFamilyDto.root,
        },
        ...(newInActiveParent
          ? [
              {
                relationshipToRoot: createFamilyDto.newParentRelationshipToRoot,
                familyUsername: familyUserName,
                familyType: createFamilyDto.familyType,
                user: newInActiveParent._id,
              },
            ]
          : []),
        {
          relationshipToRoot: createFamilyDto.relationshipToRoot,
          familyUsername: familyUserName,
          familyType: createFamilyDto.familyType,
          user: createFamilyDto.creator,
          parent: zeroToFirstGenerationFamilyRelations.includes(
            createFamilyDto.relationshipToRoot,
          )
            ? createFamilyDto.root
            : newInActiveParent
            ? newInActiveParent._id
            : null,
        },
      ]);

      this.logger.log(
        `creating new family with an existing family tree user as root...`,
      );
      const newFamily: FamilyDocument = await this.familyModel.create({
        ...createFamilyDto,
        familyCoverImage: familyCoverImageURL,
        familyUsername: familyUserName,
        members: [
          new mongoose.Types.ObjectId(initFamilyMembers[0]._id),
          ...(newInActiveParent
            ? [new mongoose.Types.ObjectId(initFamilyMembers[1]._id)]
            : []),
          ...(newInActiveParent
            ? [new mongoose.Types.ObjectId(initFamilyMembers[2]._id)]
            : [new mongoose.Types.ObjectId(initFamilyMembers[1]._id)]),
        ],
        familyJoinLink: generateJoinLink(familyUserName, createFamilyDto.state),
      });

      this.logger.log(
        `updating created family members with newly created family id`,
      );
      await this.familyMemberModel.updateMany(
        { familyUsername: familyUserName },
        { $set: { family: newFamily._id } },
      );

      this.logger.log(
        `updating all primary users involved with newly created family id`,
      );
      const userUpdates = [
        {
          updateOne: {
            filter: {
              _id: new mongoose.Types.ObjectId(createFamilyDto.root),
            },
            update: {
              $set: {
                role: 'root',
                families: [new mongoose.Types.ObjectId(newFamily._id)],
                familyRootedTo: newFamily._id,
              },
            },
          },
        },
        ...(newInActiveParent
          ? [
              {
                updateOne: {
                  filter: {
                    _id: new mongoose.Types.ObjectId(newInActiveParent._id),
                  },
                  update: {
                    $set: {
                      families: [new mongoose.Types.ObjectId(newFamily._id)],
                    },
                  },
                },
              },
            ]
          : []),
        {
          updateOne: {
            filter: {
              _id: new mongoose.Types.ObjectId(createFamilyDto.creator),
            },
            update: {
              $set: {
                families: [new mongoose.Types.ObjectId(newFamily._id)],
              },
            },
          },
        },
      ];
      await this.primaryUserModel.bulkWrite(userUpdates);

      this.logger.log(`creating wiki details for new family...`);
      const canEdit = [
        new Types.ObjectId(createFamilyDto.root),
        new Types.ObjectId(createFamilyDto.creator),
        newInActiveParent
          ? new Types.ObjectId(newInActiveParent._id)
          : undefined,
      ].filter(Boolean); // Remove undefined values

      await this.createFamilyWiki({
        familyId: newFamily._id,
        wiki: createFamilyDto.familyBio,
        editors: canEdit,
      });

      this.logger.log(`populating all family collections...`);
      const familyPopulated = await this.getFamilyById(newFamily._id);

      return <IResponse>{
        statusCode: 201,
        message: `${createFamilyDto.familyName} family created successfully`,
        data: familyPopulated,
        error: null,
      };
    } catch (err) {
      console.log(err);

      this.logger.error(
        `Error creating family with existing user as Root: ` +
          JSON.stringify(err, null, 2),
      );

      return <IResponse>{
        statusCode: 500,
        message: 'family creation failed',
        data: null,
        error: {
          code: 'family_creation_failed',
          message:
            `error occurred while trying to create family with an existing user as root: ` +
            JSON.stringify(err, null, 2),
        },
      };
    }
  }

  private async createFamilyWithNewRoot(
    createFamilyDto: CreateFamilyDto,
    familyUserName: string,
    familyCoverImageURL: string,
  ): Promise<IResponse> {
    try {
      this.logger.log(`CASE_TWO: new root`);

      const newInActiveParent =
        await this.createInactiveParent(createFamilyDto);

      this.logger.log(`creating the root...`);
      const newRoot = await this.primaryUserModel.create({
        creator: new mongoose.Types.ObjectId(createFamilyDto.creator),
        fullName: createFamilyDto.newRootFullName,
        profilePic: createFamilyDto.familyCoverImageURL,
        userName: `${createFamilyDto.newRootFullName
          .replace(/\s+/g, '')
          .substring(0, 4)}${HelperFn.generateRandomNumber(3)}`,
        role: 'root',
        isActive: false,
      });

      this.logger.log(
        `create new family members document for both root and creator`,
      );
      const initFamilyMembers = await this.familyMemberModel.insertMany([
        {
          relationshipToRoot: 'root',
          familyUsername: familyUserName,
          familyType: createFamilyDto.familyType,
          user: newRoot._id,
        },
        ...(newInActiveParent
          ? [
              {
                relationshipToRoot: createFamilyDto.newParentRelationshipToRoot,
                familyUsername: familyUserName,
                familyType: createFamilyDto.familyType,
                user: newInActiveParent._id,
                parent: zeroToFirstGenerationFamilyRelations.includes(
                  createFamilyDto.newParentRelationshipToRoot,
                )
                  ? newRoot._id
                  : null,
              },
            ]
          : []),
        {
          relationshipToRoot: createFamilyDto.relationshipToRoot,
          familyUsername: familyUserName,
          familyType: createFamilyDto.familyType,
          user: createFamilyDto.creator,
          parent: newRoot._id,
        },
      ]);

      console.log('INACTIVE', initFamilyMembers);

      this.logger.log(`creating new family with a new user as root`);
      const newFamily: FamilyDocument = await this.familyModel.create({
        ...createFamilyDto,
        familyCoverImage: familyCoverImageURL,
        root: newRoot._id,
        familyUsername: familyUserName,
        members: [
          initFamilyMembers[0]._id,
          ...(newInActiveParent ? [initFamilyMembers[1]._id] : []),
          ...(newInActiveParent
            ? [initFamilyMembers[2]._id]
            : [initFamilyMembers[1]._id]),
        ],
        familyJoinLink: generateJoinLink(familyUserName, createFamilyDto.state),
      });

      this.logger.log(
        `updating created family members with newly created family id`,
      );
      await this.familyMemberModel.updateMany(
        { familyUsername: familyUserName },
        { $set: { family: newFamily._id } },
      );

      this.logger.log(
        `updating all primary users involved with newly created family id`,
      );
      const userUpdates = [
        {
          updateOne: {
            filter: {
              _id: new mongoose.Types.ObjectId(newRoot._id),
            },
            update: {
              $set: {
                families: [newFamily._id],
                familyRootedTo: newFamily._id,
              },
            },
          },
        },
        ...(newInActiveParent
          ? [
              {
                updateOne: {
                  filter: {
                    _id: new mongoose.Types.ObjectId(newInActiveParent._id),
                  },
                  update: {
                    $set: {
                      families: [new mongoose.Types.ObjectId(newFamily._id)],
                    },
                  },
                },
              },
            ]
          : []),
        {
          updateOne: {
            filter: {
              _id: new mongoose.Types.ObjectId(createFamilyDto.creator),
            },
            update: {
              $set: {
                families: [newFamily._id],
              },
            },
          },
        },
      ];
      await this.primaryUserModel.bulkWrite(userUpdates);

      this.logger.log(`creating wiki details for new family...`);
      const canEdit = [
        new Types.ObjectId(newRoot._id),
        new Types.ObjectId(createFamilyDto.creator),
        newInActiveParent
          ? new Types.ObjectId(newInActiveParent._id)
          : undefined,
      ].filter(Boolean); // Remove undefined values

      await this.createFamilyWiki({
        familyId: newFamily._id,
        wiki: createFamilyDto.familyBio,
        editors: canEdit,
      });

      this.logger.log(`populating all family collections...`);
      const familyPopulated = await this.getFamilyById(newFamily._id);

      return <IResponse>{
        statusCode: 201,
        message: `${createFamilyDto.familyName} family created successfully`,
        data: familyPopulated,
        error: null,
      };
    } catch (err) {
      console.log(err);

      this.logger.error(
        `Error creating family with new Root: ` + JSON.stringify(err, null, 2),
      );

      return <IResponse>{
        statusCode: 500,
        message: 'family creation failed',
        data: null,
        error: {
          code: 'family_creation_failed',
          message:
            `error occurred while trying to create family with a new root: ` +
            JSON.stringify(err, null, 2),
        },
      };
    }
  }

  private async createInactiveParent(createFamilyDto: CreateFamilyDto) {
    const expectedParentKeys = [
      'newParentRelationshipToRoot',
      'newParentFullName',
      'newParentGender',
      // 'newParentDob',
    ];

    if (
      expectedParentKeys.every((element) =>
        Object.keys(createFamilyDto).includes(element),
      )
    ) {
      this.logger.log(
        `Creating new inactive parent record for non-first generational family member`,
      );

      return await this.primaryUserModel.create({
        creator: new mongoose.Types.ObjectId(createFamilyDto.creator),
        fullName: createFamilyDto.newParentFullName,
        gender: createFamilyDto.newParentGender,
        dob: createFamilyDto.newParentDob,
        profilePic: createFamilyDto.newParentProfileURL,
        userName: `${createFamilyDto.newParentFullName
          .replace(/\s+/g, '')
          .substring(0, 4)}${HelperFn.generateRandomNumber(3)}`,
        isActive: false,
      });
    }

    return null;
  }

  private async createFamilyWiki(dto: CreateFamilyWikiDto) {
    try {
      const newWiki = await this.familyWikiModel.create({
        family: new mongoose.Types.ObjectId(dto.familyId),
        wiki: dto.wiki,
        editors: [...dto.editors],
      });

      if (!newWiki) return null;
      await this.familyModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(dto.familyId) },
        { $set: { wiki: newWiki._id } },
        { new: true },
      );
    } catch (err) {
      console.error(
        `Error creating family wiki for family with ID [${dto.familyId}]: ` +
          err,
      );

      throw err;
    }
  }

  private async updateFamilyWiki(
    userId: Types.ObjectId,
    dto: Partial<CreateFamilyWikiDto>,
  ) {
    try {
      this.logger.log(`updating family wiki...`);
      await this.familyWikiModel.findOneAndUpdate(
        { family: new mongoose.Types.ObjectId(dto.familyId) },
        { $set: { wiki: dto.wiki, latestEditor: userId } },
        { new: true },
      );
      this.logger.log(`family wiki updated successfully`);
    } catch (err) {
      console.error(
        `Error editing family wiki for family with ID [${dto.familyId}]: ` +
          err,
      );

      throw err;
    }
  }
}
