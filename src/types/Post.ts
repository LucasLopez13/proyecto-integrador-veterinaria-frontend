import type { User } from "./User";

export type Post = {
  id: number;
  descripcion: string;
  fecha: string;
  userNickName: string;
  User?: User;
};