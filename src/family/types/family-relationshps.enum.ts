export enum FamilyRelationshipsEnum {
  Root = 'root',
  Spouse = 'spouse',
  Son = 'son',
  Daughter = 'daughter',
  Grandson = 'grandson',
  Granddaughter = 'granddaughter',
  Greatgrandson = 'greatgrandson',
  Greatgranddaughter = 'greatgranddaughter',
}

export enum FamilyTypeEnum {
  Paternal = 'paternal',
  Maternal = 'maternal',
}

export const zeroToFirstGenerationFamilyRelations = [
  FamilyRelationshipsEnum.Root,
  FamilyRelationshipsEnum.Spouse,
  FamilyRelationshipsEnum.Son,
  FamilyRelationshipsEnum.Daughter,
];
