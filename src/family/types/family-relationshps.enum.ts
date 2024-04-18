export enum FamilyRelationshipsEnum {
  Root = 'root',
  Spouse = 'spouse',
  Brother = 'brother',
  Sister = 'sister',
  Son = 'son',
  Daughter = 'daughter',
  Nephew = 'nephew',
  Niece = 'niece',
  Grandson = 'grandson',
  Granddaughter = 'granddaughter',
  Greatgrandson = 'greatgrandson',
  Greatgranddaughter = 'greatgranddaughter',
  Greatgreatgrandson = 'greatgreatgrandson',
  Greatgreatgranddaughter = 'greatgreatgranddaughter',
}

export enum FamilyRelationshipType {
  MARRIAGE = 'marriage',
  ALLIANCE = 'alliance',
  AFFILIATION = 'affiliation',
  DIRECT = 'direct',
  OTHER = 'other',
}

export enum FamilyTypeEnum {
  Paternal = 'paternal',
  Maternal = 'maternal',
}

export const zeroToFirstGenerationFamilyRelations = [
  FamilyRelationshipsEnum.Root,
  FamilyRelationshipsEnum.Spouse,
  FamilyRelationshipsEnum.Brother,
  FamilyRelationshipsEnum.Sister,
  FamilyRelationshipsEnum.Son,
  FamilyRelationshipsEnum.Daughter,
];

//krispam 

export const firstGeneration = [
  FamilyRelationshipsEnum.Root,
  FamilyRelationshipsEnum.Spouse,
  FamilyRelationshipsEnum.Brother,
  FamilyRelationshipsEnum.Sister,
];

export const secondGeneration = [
  FamilyRelationshipsEnum.Son,
  FamilyRelationshipsEnum.Daughter,
  FamilyRelationshipsEnum.Nephew,
  FamilyRelationshipsEnum.Niece,
];

export const thirdGeneration = [
  FamilyRelationshipsEnum.Grandson,
  FamilyRelationshipsEnum.Granddaughter,
];

export const fourthGeneration = [
  FamilyRelationshipsEnum.Greatgrandson,
  FamilyRelationshipsEnum.Greatgranddaughter,
];

export const fifthGeneration = [
  FamilyRelationshipsEnum.Greatgreatgrandson,
  FamilyRelationshipsEnum.Greatgreatgranddaughter,
];
