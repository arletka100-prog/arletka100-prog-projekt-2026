
export enum Category {
  GENERAL = 'General',
  POLITICS = 'Politics',
  ECONOMY = 'Economy',
  TECHNOLOGY = 'Technology',
  CULTURE = 'Culture',
  SPORTS = 'Sports'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: Category;
  timestamp: string;
  sources: GroundingSource[];
  imageUrl: string;
}

export interface BriefingState {
  items: NewsItem[];
  isLoading: boolean;
  error: string | null;
}
