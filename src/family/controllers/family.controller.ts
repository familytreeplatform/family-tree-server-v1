import {
  Body,
  Controller,
  Get,
  HttpCode,
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
  QueryFamiliesDto,
  SearchFamilyDto,
} from '../dto';
import { JwtGuard } from 'src/common/guards';
import { GetUser } from 'src/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { formatResponse } from 'src/common/utils';
import { FamilyRelationshipValidateDto } from '../dto/family-relationship-validate.dto';

@UseGuards(JwtGuard)
@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('familyCoverImage'))
  async createFamily(
    @UploadedFile() familyCoverImage: Express.Multer.File,
    @GetUser('_id') userId: any,
    @Body() createFamilyDto: CreateFamilyDto,
  ) {
    const createdFamilyResponse = await this.familyService.createFamily({
      ...createFamilyDto,
      creator: userId,
      familyCoverImage,
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
}
