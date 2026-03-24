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
  author: string;
  updatedAt: string;
};

export type Prompt = {
  id: string;
  title: string;
  purpose: string;
  promptText: string;
  tags: string[];
  example: string;
  author: string;
  updatedAt: string;
};

export type PlaybookEntry = {
  id: string;
  title: string;
  section: string;
  body: string;
  tags: string[];
  author: string;
  updatedAt: string;
};

export type FAQEntry = {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  author: string;
  updatedAt: string;
};

export type Event = {
  id: string;
  title: string;
  date: string;
  body: string;
  tags: string[];
  author: string;
  updatedAt: string;
};

export type AITool = {
  id: string;
  title: string;
  category: string;
  description: string;
  pricing: string;
  recommendedUse: string;
  url: string;
  rating: number;
  status: string;
  tags: string[];
  updatedAt: string;
};
