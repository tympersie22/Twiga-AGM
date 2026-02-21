const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '+255712345678';
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'bookings@twiga-agm.com';
const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '255712345678';

const normalizeWhatsAppNumber = (value: string) => value.replace(/[^\d]/g, '');

export const siteConfig = {
  contact: {
    phone: contactPhone,
    email: contactEmail,
    whatsappNumber: normalizeWhatsAppNumber(whatsappNumber),
    address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || 'Zanzibar, Tanzania',
  },
  links: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com/twiga-agm',
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://facebook.com/twiga-agm',
    website: process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://twiga-agm.com',
  },
};

export const contactHref = {
  phone: `tel:${siteConfig.contact.phone}`,
  email: `mailto:${siteConfig.contact.email}`,
  whatsapp: `https://wa.me/${siteConfig.contact.whatsappNumber}`,
};
