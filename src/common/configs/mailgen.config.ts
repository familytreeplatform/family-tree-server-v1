import mailGen = require('mailgen');

export const mailGenerator = new mailGen({
  theme: 'default',
  product: {
    name: 'family tree',
    link: 'https://familytreeapp.com',
    logo: 'https://res.cloudinary.com/dnpvndlmy/image/upload/v1681197634/Pharmalink/pharmalink_logo_t8bvl4.png',
  },
});
