export enum FamilyRelationshipsEnum {
  Root = 'root',
  Spouse = 'spouse',
  Brother = 'brother',
  Sister = 'sister',
  Son = 'son',
  Daughter = 'daughter',
  Grandson = 'grandson',
  Granddaughter = 'granddaughter',
  Greatgrandson = 'greatgrandson',
  Greatgranddaughter = 'greatgranddaughter',
  Greatgreatgrandson = 'greatgreatgrandson',
  Greatgreatgranddaughter = 'greatgreatgranddaughter',
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
