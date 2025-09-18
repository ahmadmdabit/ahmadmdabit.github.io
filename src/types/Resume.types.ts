export interface Summary {
  main: string;
  highlights: string[];
}

export interface ContactInfo {
  name: string;
  title: string;
  email: string;
  address: string;
  website: string;
  github?: string;
  linkedin?: string;
}

export interface Skill {
  category: string;
  items: string[];
}

export interface Experience {
  role: string;
  company: string;
  duration: string;
  location: string;
  tasks: string[];
}

export interface Project {
  name: string;
  url: string;
  technologies: string[];
  description: string[];
}

export interface Education {
  degree: string;
  duration:string;
  institution: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
  reference?: string; // Optional field
}

export interface Language {
  name: string;
  proficiency: string;
}

export interface Reference {
  name: string;
  title: string;
  contact: string;
}

export interface ResumeData {
  contactInfo: ContactInfo;
  summary: Summary;
  skills: Skill[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
  languages: Language[];
  reference: Reference;
}
