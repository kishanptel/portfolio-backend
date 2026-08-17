import bcrypt from 'bcryptjs';

export const AdminModel = {
  getAdminConfig: () => {
    return {
      email: (process.env.ADMIN_EMAIL || 'kishanptel07@gmail.com').toLowerCase(),
      password: process.env.ADMIN_PASSWORD || 'admin12345'
    };
  },

  verifyCredentials: async (email, password) => {
    const config = AdminModel.getAdminConfig();
    if (email.toLowerCase() !== config.email) {
      return false;
    }
    // Direct match or bcrypt compare if hashed
    if (password === config.password) {
      return true;
    }
    try {
      return await bcrypt.compare(password, config.password);
    } catch {
      return false;
    }
  }
};
