export interface Person {
  id: string;
  name: string;
  title: string;
  location: string;
  experienceYears: number;
  bio: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
}

export interface Role {
  id: string;
  title: string;
  level: string; // e.g. 'Junior', 'Mid', 'Senior', 'Lead', 'Executive'
  category: string; // e.g. 'Engineering', 'Product', 'Design'
}

export interface WorkedAtRelation {
  startYear: number;
  endYear?: number; // undefined means current job
}

export interface HeldRoleRelation {
  startYear: number;
  endYear?: number;
}

// Rich UI representations
export interface CompanyWithPeriod extends Company {
  startYear: number;
  endYear?: number;
}

export interface RoleWithPeriod extends Role {
  startYear: number;
  endYear?: number;
}

export interface PersonWithStats extends Person {
  skillsCount: number;
  companiesCount: number;
  rolesCount: number;
}

export interface SharedSkillConnection {
  person: Person;
  sharedSkillsCount: number;
  sharedSkills: string[];
}

export interface SharedCompanyConnection {
  person: Person;
  sharedCompanyName: string;
}

export interface CareerRecommendation {
  role: Role;
  company?: Company;
  matchingSkillsCount: number;
  matchingSkills: string[];
  missingSkills: string[];
}

export interface CareerPathStep {
  role: Role;
  company?: Company;
}

export interface DashboardStats {
  peopleCount: number;
  skillsCount: number;
  companiesCount: number;
  rolesCount: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
