export interface Item {
  id: number;
  created_at: string;
  project_id: number;
  title: string;
  description: string | null;
  tool_used: string | null;
  priority: number;
  // Review specific
  before_img: string | null;
  after_img: string | null;
  // Normal specific
  gallery_imgs: string[] | null;
}

export interface Project {
  id: number;
  created_at: string;
  title: string;
  type: 'review' | 'normal';
  priority: number;
  items: Item[]; // Mảng các item con
}