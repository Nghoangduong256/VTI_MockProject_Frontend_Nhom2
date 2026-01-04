/** Map đúng UserProfileDTO từ backend */
export interface UserProfile {
  userName: string;
  email: string;

  firstName: string;
  lastName: string;

  avatar?: string; // Base64
  avatarUrl?: string;

  verified: boolean;
  membership?: string;

  phone?: string;
  dateOfBirth?: string; // yyyy-MM-dd
  address?: string;
}
