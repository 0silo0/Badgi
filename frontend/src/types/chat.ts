// src/types/chat.ts
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  login?: string;
  email?: string;
  avatarUrl?: string;
}

export interface Chat {
  primarykey: string;
  title: string;
  isPrivate: boolean;
  members: Array<{
    accountRef: User;
  }>;
  messages: Array<{
    content: string;
    createdAt: Date;
  }>;
}

export interface Message {
  id: string;
  content: string;
  account: User;
  createdAt: string;
}