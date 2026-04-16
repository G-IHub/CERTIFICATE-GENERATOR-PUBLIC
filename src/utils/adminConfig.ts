// Admin Configuration
// Special email addresses that grant platform admin access

export const ADMIN_EMAILS = [
  'admin@certgen.com',
  'platform@certgen.com',
  'admin@genomac.com',
  'admin@gihub.com',
  'admin@g-ihub.com',
  'platform@admin.com',
  'adewuyigoodness1@gmail.com',
  'genomacinnovationhub@gmail.com',
];

export const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.some(adminEmail => 
    email.toLowerCase() === adminEmail.toLowerCase()
  );
};
