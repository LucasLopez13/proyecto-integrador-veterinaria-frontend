import type { User } from "./User";
import type { Tag } from "./Tag";
import type { Comment } from "./Comment";
import type { PostImage } from "./PostImage";

export type Post = {
  id: number;
  descripcion: string;
  fecha: string;
  userNickName: string;
  User?: User;
  Tags?: Tag[];
  Comments?: Comment[];
  PostImages?: PostImage[];
};