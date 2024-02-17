import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FamilyService } from '../services';
import {
  CreateFamilyDto,
  FamilyTypeUiqueValidateDto,
  JoinFamilyDto,
  LinkToRootDto,
  MemberSearchDto,
  QueryFamiliesDto,
  SearchFamilyDto,
  UpdateFamilyMemberDto,
} from '../dto';
import { JwtGuard } from 'src/common/guards';
import { GetUser } from 'src/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { formatResponse } from 'src/common/utils';
import { FamilyRelationshipValidateDto } from '../dto/family-relationship-validate.dto';
import { ObjectId } from 'mongoose';

@UseGuards(JwtGuard)
@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post('create')
  async createFamily(
    @GetUser('_id') userId: any,
    @Body() createFamilyDto: CreateFamilyDto,
  ) {
    console.log('FAMILY_CREATE_BODY', createFamilyDto);

    if (!createFamilyDto.familyCoverImageURL) {
      throw new HttpException(
        {
          message: `a valid display picture is required`,
          error: 'Bad Request',
          statusCode: 400,
        },
        400,
      );
    }

    const createdFamilyResponse = await this.familyService.createFamily({
      ...createFamilyDto,
      creator: userId,
    });

    return formatResponse(createdFamilyResponse);
  }

  @HttpCode(200)
  @Post('join')
  async joinFamily(
    @GetUser('_id') userId: any,
    @Body() joinFamilyDto: JoinFamilyDto,
  ) {
    const joinFamilyResponse = await this.familyService.joinFamily({
      ...joinFamilyDto,
      user: userId,
    });

    return formatResponse(joinFamilyResponse);
  }

  @Get('get-by-id/:id')
  async getFamilyById(@Param('id') familyId: any) {
    const familyProfileResponse =
      await this.familyService.getFamilyById(familyId);

    return formatResponse(familyProfileResponse);
  }

  @HttpCode(200)
  @Get('validate-family-type-unique')
  async validateFamilyTypeUniqueness(
    @Query() familyTypeUiqueValidateDto: FamilyTypeUiqueValidateDto,
    @GetUser('_id') userId: any,
  ) {
    const familyTypeUniqueResponse =
      await this.familyService.validateFamilyTypeUniqueness({
        ...familyTypeUiqueValidateDto,
        userId,
      });

    return formatResponse(familyTypeUniqueResponse);
  }

  @Get('validate-relation-to-root')
  async validateRelationshipToRoot(
    @Query() dto: FamilyRelationshipValidateDto,
  ) {
    const relationshipToRootValidateResponse =
      await this.familyService.validateRelationshipToRoot(dto);
    return formatResponse(relationshipToRootValidateResponse);
  }

  @HttpCode(200)
  @Post('search')
  async searchFamily(@Body() searchFamilyDto: SearchFamilyDto) {
    const familySearchResponse =
      await this.familyService.searchFamily(searchFamilyDto);

    return formatResponse(familySearchResponse);
  }

  @HttpCode(200)
  @Get('query-search')
  async queryFamilies(@Query() queryFamiliesDto: QueryFamiliesDto) {
    const familiesQueryResponse =
      await this.familyService.queryFamilies(queryFamiliesDto);

    return formatResponse(familiesQueryResponse);
  }

  @HttpCode(200)
  @Get('member-search')
  async searchMembers(@Query() memberSearchDto: MemberSearchDto) {
    const searchMembersResponse = await this.familyService.searchMembers(memberSearchDto)
    return formatResponse(searchMembersResponse)
  }

  @HttpCode(200)
  @Post('update-member')
  async updateFamilyMember(
    @Body() updateFamilyMemberDto: UpdateFamilyMemberDto,
    @GetUser('_id') userId: any,
  ) {
    const updateFamilyMemberRespnse =
      await this.familyService.updateFamilyMember({
        ...updateFamilyMemberDto,
        userId,
      });

    return formatResponse(updateFamilyMemberRespnse);
  }

  @HttpCode(200)
  @Get('root-link')
  async getPotentialRootLink(
    @Query() linkToRootDto: LinkToRootDto,
    @GetUser('_id') userId: any,
  ) {
    const potentialRootLinkResponse =
      await this.familyService.getPotentialRootLink({
        ...linkToRootDto,
        user: userId,
      });

    return formatResponse(potentialRootLinkResponse);
  }
}
