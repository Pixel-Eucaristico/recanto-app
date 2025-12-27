/**
 * Types for Main Page Dynamic Content
 * Content stored in repositor/main-content.json
 */

export interface HeroMission {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
}

export interface CommunityFeedback {
  id: number;
  name: string;
  role: string;
  avatar: string;
  comment: string;
  date: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  category: 'formacao' | 'evangelizacao' | 'social' | 'retiro';
  link?: string;
}

export interface Evangelization {
  id: number;
  title: string;
  description: string;
  icon: string;
  audience: string;
}

export interface MainPageContent {
  heroMission: HeroMission;
  communityFeedbacks: CommunityFeedback[];
  projects: Project[];
  evangelization: Evangelization[];
}
