export enum FamilyRelationshipsEnum {
  Root = 'Root',
  Spouse = 'Spouse',
  Son = 'Son',
  Daughter = 'Daughter',
  Grandson = 'Grandson',
  Granddaughter = 'Granddaughter',
  Greatgrandson = 'Greatgrandson',
  Greatgranddaughter = 'Greatgranddaughter',
}

export enum FamilyTypeEnum {
  Paternal = 'Paternal',
  Maternal = 'Maternal',
}

export const topLevelFamilyRelations = [
  FamilyRelationshipsEnum.Root,
  FamilyRelationshipsEnum.Spouse,
  FamilyRelationshipsEnum.Son,
  FamilyRelationshipsEnum.Daughter,
];
