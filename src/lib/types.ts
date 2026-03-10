export type UseCase = {
  id: string;
  title: string;
  team: string;
  category: string;
  impactMinutesSaved: number;
  tool: string;
  prompt: string;
  description: string;
  tags: string[];
  updatedAt: string;
};

export type Prompt = {
  id: string;
  title: string;
  purpose: string;
  promptText: string;
  tags: string[];
  example: string;
  updatedAt: string;
};

export type PlaybookEntry = {
  id: string;
  title: string;
  section: string;
  body: string;
  tags: string[];
  updatedAt: string;
};

export type FAQEntry = {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  updatedAt: string;
};

export type Event = {
  id: string;
  title: string;
  date: string;
  body: string;
  tags: string[];
};
