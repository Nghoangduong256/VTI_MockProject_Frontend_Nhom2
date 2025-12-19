export interface User {
  firstName: string;
  lastName: string;
  avatar?: string; //Base64 string
  username: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
}
