import mailGen = require('mailgen');

export const mailGenerator = new mailGen({
  theme: 'default',
  product: {
    name: 'family tree',
    link: 'https://familytreeapp.com',
    logo: 'https://familytreeapp-bucket.nyc3.cdn.digitaloceanspaces.com/logos/FamilyTree%20Logo%20(Final).png',
  },
});
