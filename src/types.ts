export type ToolCategory = 'all' | 'images' | 'pdf' | 'developer' | 'utilities';

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  category: 'images' | 'pdf' | 'developer' | 'utilities';
  iconName: string;
  popular?: boolean;
  isComingSoon?: boolean;
  howItWorks: string[];
  relatedToolIds: string[];
  badge?: string;
}
