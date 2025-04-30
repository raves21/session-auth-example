export type User = {
  id: string;
  name: String;
  email: string;
  password: string;
};

export type Session = {
  id: string;
  token: string;
  user: User;
};
