import { loadEnvConfig } from '@next/env';
import neo4j from 'neo4j-driver';

// Load environment variables from .env / .env.local files
loadEnvConfig(process.cwd());

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME || 'cognodb';
const password = process.env.COGNODB_PASSWORD;

if (!uri || !password) {
  console.error('Error: COGNODB_URI and COGNODB_PASSWORD must be set in env.');
  process.exit(1);
}

// Fictional Skill Data
const skills = [
  { id: 's1', name: 'React', category: 'Frontend' },
  { id: 's2', name: 'TypeScript', category: 'Frontend' },
  { id: 's3', name: 'Next.js', category: 'Frontend' },
  { id: 's4', name: 'Tailwind CSS', category: 'Frontend' },
  { id: 's5', name: 'CSS', category: 'Frontend' },
  { id: 's6', name: 'UI/UX Design', category: 'Frontend' },
  { id: 's7', name: 'GraphQL', category: 'Frontend' },
  { id: 's8', name: 'Testing (Jest/Cypress)', category: 'Frontend' },
  { id: 's9', name: 'Node.js', category: 'Backend' },
  { id: 's10', name: 'Python', category: 'Backend' },
  { id: 's11', name: 'System Design', category: 'Backend' },
  { id: 's12', name: 'AWS Cloud', category: 'Backend' },
  { id: 's13', name: 'Docker', category: 'Backend' },
  { id: 's14', name: 'Kubernetes', category: 'Backend' },
  { id: 's15', name: 'SQL & Relational DBs', category: 'Backend' },
  { id: 's16', name: 'Neo4j Graph DB', category: 'Backend' },
  { id: 's17', name: 'Cypher Query Language', category: 'Backend' },
  { id: 's18', name: 'REST APIs', category: 'Backend' },
  { id: 's19', name: 'Product Strategy', category: 'Product' },
  { id: 's20', name: 'Agile & Scrum', category: 'Product' },
  { id: 's21', name: 'Data Analytics', category: 'Product' },
  { id: 's22', name: 'User Research', category: 'Product' },
  { id: 's23', name: 'Market Analysis', category: 'Product' },
  { id: 's24', name: 'Machine Learning', category: 'Data Science' },
  { id: 's25', name: 'PyTorch & Deep Learning', category: 'Data Science' }
];

// Fictional Company Data
const companies = [
  { id: 'c1', name: 'Google', industry: 'Technology', location: 'Mountain View, CA' },
  { id: 'c2', name: 'Meta', industry: 'Social Media', location: 'Menlo Park, CA' },
  { id: 'c3', name: 'Wexa AI', industry: 'Artificial Intelligence', location: 'San Francisco, CA' },
  { id: 'c4', name: 'Stripe', industry: 'Fintech', location: 'San Francisco, CA' },
  { id: 'c5', name: 'Vercel', industry: 'Cloud & DevOps', location: 'New York, NY' },
  { id: 'c6', name: 'Microsoft', industry: 'Technology', location: 'Redmond, WA' },
  { id: 'c7', name: 'Amazon', industry: 'E-commerce', location: 'Seattle, WA' },
  { id: 'c8', name: 'Netflix', industry: 'Entertainment', location: 'Los Gatos, CA' }
];

// Fictional Role Data (General Roles that can be at Companies)
const roles = [
  { id: 'r1', title: 'Junior Frontend Developer', level: 'Junior', category: 'Engineering' },
  { id: 'r2', title: 'Frontend Developer', level: 'Mid', category: 'Engineering' },
  { id: 'r3', title: 'Senior Frontend Developer', level: 'Senior', category: 'Engineering' },
  { id: 'r4', title: 'Frontend Architect', level: 'Lead', category: 'Engineering' },
  { id: 'r5', title: 'Junior Backend Developer', level: 'Junior', category: 'Engineering' },
  { id: 'r6', title: 'Backend Developer', level: 'Mid', category: 'Engineering' },
  { id: 'r7', title: 'Senior Backend Developer', level: 'Senior', category: 'Engineering' },
  { id: 'r8', title: 'Backend Architect', level: 'Lead', category: 'Engineering' },
  { id: 'r9', title: 'Junior Product Manager', level: 'Junior', category: 'Product' },
  { id: 'r10', title: 'Product Manager', level: 'Mid', category: 'Product' },
  { id: 'r11', title: 'Senior Product Manager', level: 'Senior', category: 'Product' },
  { id: 'r12', title: 'VP of Product', level: 'Executive', category: 'Product' },
  { id: 'r13', title: 'Machine Learning Engineer', level: 'Mid', category: 'Engineering' },
  { id: 'r14', title: 'Senior ML Engineer', level: 'Senior', category: 'Engineering' },
  { id: 'r15', title: 'ML Architect', level: 'Lead', category: 'Engineering' }
];

// Role Skill Requirements (links Role to Skill)
const roleRequiresSkills = [
  { roleId: 'r1', skillIds: ['s1', 's4', 's5'] },
  { roleId: 'r2', skillIds: ['s1', 's2', 's3', 's4', 's7'] },
  { roleId: 'r3', skillIds: ['s1', 's2', 's3', 's4', 's6', 's7', 's8'] },
  { roleId: 'r4', skillIds: ['s1', 's2', 's3', 's6', 's7', 's8', 's11'] },
  { roleId: 'r5', skillIds: ['s9', 's15', 's18'] },
  { roleId: 'r6', skillIds: ['s9', 's10', 's12', 's13', 's15', 's18'] },
  { roleId: 'r7', skillIds: ['s9', 's10', 's11', 's12', 's13', 's15', 's16', 's18'] },
  { roleId: 'r8', skillIds: ['s9', 's10', 's11', 's12', 's13', 's14', 's16', 's17'] },
  { roleId: 'r9', skillIds: ['s20', 's22'] },
  { roleId: 'r10', skillIds: ['s19', 's20', 's21', 's22'] },
  { roleId: 'r11', skillIds: ['s19', 's20', 's21', 's22', 's23'] },
  { roleId: 'r12', skillIds: ['s19', 's21', 's23'] },
  { roleId: 'r13', skillIds: ['s10', 's15', 's24', 's25'] },
  { roleId: 'r14', skillIds: ['s10', 's11', 's12', 's13', 's24', 's25'] },
  { roleId: 'r15', skillIds: ['s10', 's11', 's12', 's13', 's14', 's24', 's25'] }
];

// General Role Progression Paths (NEXT_ROLE)
const roleProgressions = [
  { fromId: 'r1', toId: 'r2' },
  { fromId: 'r2', toId: 'r3' },
  { fromId: 'r3', toId: 'r4' },
  { fromId: 'r5', toId: 'r6' },
  { fromId: 'r6', toId: 'r7' },
  { fromId: 'r7', toId: 'r8' },
  { fromId: 'r9', toId: 'r10' },
  { fromId: 'r10', toId: 'r11' },
  { fromId: 'r11', toId: 'r12' },
  { fromId: 'r13', toId: 'r14' },
  { fromId: 'r14', toId: 'r15' }
];

// Fictional People Data
const people = [
  { id: 'p1', name: 'Alice Smith', title: 'Senior Frontend Developer', location: 'San Francisco, CA', experienceYears: 8, bio: 'Passionate frontend developer specializing in responsive design, CSS architecture, and highly interactive user interfaces. React enthusiast.' },
  { id: 'p2', name: 'Bob Jones', title: 'Senior Backend Developer', location: 'Seattle, WA', experienceYears: 10, bio: 'Systems engineer with deep knowledge of microservices, serverless architectures, and relational and non-relational database systems. Loves Neo4j.' },
  { id: 'p3', name: 'Charlie Brown', title: 'Junior Frontend Developer', location: 'New York, NY', experienceYears: 2, bio: 'Self-motivated junior developer focusing on modern CSS systems, Tailwind CSS, and core Javascript concepts. Eager to grow.' },
  { id: 'p4', name: 'Diana Prince', title: 'Frontend Architect', location: 'San Francisco, CA', experienceYears: 12, bio: 'Defining UI architectures for large-scale enterprise systems. Passionate about component libraries, design systems, and developer tooling.' },
  { id: 'p5', name: 'Evan Wright', title: 'Backend Developer', location: 'Chicago, IL', experienceYears: 4, bio: 'Backend engineer focused on API design, performance optimization, and containerization using Docker. Loves Node.js and Python.' },
  { id: 'p6', name: 'Fiona Gallagher', title: 'Product Manager', location: 'New York, NY', experienceYears: 5, bio: 'Goal-oriented PM skilled in connecting technical engineering challenges with clear user values. Expert in Agile methodologies.' },
  { id: 'p7', name: 'George Clark', title: 'Senior Product Manager', location: 'San Francisco, CA', experienceYears: 9, bio: 'Leveraging data-driven insight to build product roadmaps. Expert in user research, metrics, and pricing strategy.' },
  { id: 'p8', name: 'Hannah Abbott', title: 'VP of Product', location: 'Boston, MA', experienceYears: 15, bio: 'Product executive leading product design, strategy, and business analyst teams. Driven to build products users love.' },
  { id: 'p9', name: 'Ian Malcolm', title: 'Senior ML Engineer', location: 'Austin, TX', experienceYears: 8, bio: 'Specialist in deep neural networks, model optimization, and deployment of predictive models. Lover of math and PyTorch.' },
  { id: 'p10', name: 'Julia Roberts', title: 'Machine Learning Engineer', location: 'New York, NY', experienceYears: 3, bio: 'Software engineer transitioning into ML. Skilled in Python, pandas, SQL, and modeling pipelines.' },
  { id: 'p11', name: 'Kevin Bacon', title: 'Junior Backend Developer', location: 'Los Angeles, CA', experienceYears: 1, bio: 'Enthusiastic bootcamp graduate. Focused on learning Node.js, Express, databases, and general web infrastructure.' },
  { id: 'p12', name: 'Laura Croft', title: 'Frontend Developer', location: 'Austin, TX', experienceYears: 5, bio: 'Creating clean interfaces and responsive web layouts. Experienced in React, styled-components, and state management.' },
  { id: 'p13', name: 'Michael Jordan', title: 'Backend Architect', location: 'Seattle, WA', experienceYears: 14, bio: 'Architecting high-availability backends, caching hierarchies, and database schemas. Veteran Docker and AWS practitioner.' },
  { id: 'p14', name: 'Nina Simone', title: 'ML Architect', location: 'San Francisco, CA', experienceYears: 13, bio: 'Designing enterprise-scale AI pipelines, real-time inference clusters, and distributed ML workflows.' },
  { id: 'p15', name: 'Oliver Twist', title: 'Senior Frontend Developer', location: 'New York, NY', experienceYears: 7, bio: 'Specializing in Next.js, Server Component performance, and modern build tooling. Strong focus on visual aesthetics.' },
  { id: 'p16', name: 'Penelope Cruz', title: 'Senior Backend Developer', location: 'Denver, CO', experienceYears: 9, bio: 'Experienced developer building secure web applications. Skilled in Node.js, AWS, and secure communication protocols.' },
  { id: 'p17', name: 'Quincy Jones', title: 'Product Manager', location: 'San Francisco, CA', experienceYears: 6, bio: 'Guiding cross-functional teams to ship impactful software. Focused on product discovery and wireframing.' },
  { id: 'p18', name: 'Rachel Green', title: 'Frontend Developer', location: 'Miami, FL', experienceYears: 4, bio: 'React developer passionate about clean UI, CSS animations, and frontend test automation.' },
  { id: 'p19', name: 'Sam Wilson', title: 'Senior ML Engineer', location: 'Seattle, WA', experienceYears: 7, bio: 'Experienced ML engineer focused on computer vision applications, PyTorch development, and cloud deployments.' },
  { id: 'p20', name: 'Tina Fey', title: 'Senior Product Manager', location: 'Los Angeles, CA', experienceYears: 8, bio: 'Bridging engineering, marketing, and design. Specializes in SaaS monetization models and feedback loops.' },
  { id: 'p21', name: 'Uma Thurman', title: 'Frontend Architect', location: 'San Francisco, CA', experienceYears: 11, bio: 'Focused on UI performance, web vital optimization, static generation, and scalable TypeScript applications.' },
  { id: 'p22', name: 'Victor Stone', title: 'Backend Developer', location: 'Dallas, TX', experienceYears: 3, bio: 'Backend engineer and certified AWS practitioner. Focused on automation scripts, databases, and Docker.' },
  { id: 'p23', name: 'Wendy Darling', title: 'Junior Product Manager', location: 'London, UK', experienceYears: 2, bio: 'Passionate junior PM focusing on backlog grooming, analytics tracking, and user survey analysis.' },
  { id: 'p24', name: 'Xavier Charles', title: 'Senior Backend Developer', location: 'New York, NY', experienceYears: 8, bio: 'Deep interest in graph databases, graph data modeling, Cypher, and distributed search systems.' },
  { id: 'p25', name: 'Yara Shahidi', title: 'Machine Learning Engineer', location: 'Boston, MA', experienceYears: 4, bio: 'Applying predictive ML models to solve real-world problems. Strong skill set in Python and statistics.' }
];

// Relationships: Person -> HAS_SKILL
const personSkills = [
  { personId: 'p1', skillIds: ['s1', 's2', 's3', 's4', 's6', 's7'] },
  { personId: 'p2', skillIds: ['s9', 's11', 's12', 's13', 's15', 's16', 's17', 's18'] },
  { personId: 'p3', skillIds: ['s1', 's4', 's5'] },
  { personId: 'p4', skillIds: ['s1', 's2', 's3', 's6', 's7', 's8', 's11'] },
  { personId: 'p5', skillIds: ['s9', 's10', 's12', 's13', 's15', 's18'] },
  { personId: 'p6', skillIds: ['s19', 's20', 's21', 's22'] },
  { personId: 'p7', skillIds: ['s19', 's20', 's21', 's22', 's23'] },
  { personId: 'p8', skillIds: ['s19', 's21', 's23'] },
  { personId: 'p9', skillIds: ['s10', 's12', 's24', 's25'] },
  { personId: 'p10', skillIds: ['s10', 's15', 's24', 's25'] },
  { personId: 'p11', skillIds: ['s9', 's15', 's18'] },
  { personId: 'p12', skillIds: ['s1', 's2', 's4', 's5', 's7'] },
  { personId: 'p13', skillIds: ['s9', 's11', 's12', 's13', 's14', 's15', 's18'] },
  { personId: 'p14', skillIds: ['s10', 's11', 's12', 's13', 's14', 's24', 's25'] },
  { personId: 'p15', skillIds: ['s1', 's2', 's3', 's4', 's6', 's8'] },
  { personId: 'p16', skillIds: ['s9', 's12', 's13', 's15', 's18'] },
  { personId: 'p17', skillIds: ['s19', 's20', 's21', 's22'] },
  { personId: 'p18', skillIds: ['s1', 's2', 's4', 's8'] },
  { personId: 'p19', skillIds: ['s10', 's12', 's13', 's24', 's25'] },
  { personId: 'p20', skillIds: ['s19', 's20', 's22', 's23'] },
  { personId: 'p21', skillIds: ['s1', 's2', 's3', 's4', 's7', 's8', 's11'] },
  { personId: 'p22', skillIds: ['s9', 's12', 's13', 's15', 's18'] },
  { personId: 'p23', skillIds: ['s20', 's22'] },
  { personId: 'p24', skillIds: ['s9', 's11', 's13', 's15', 's16', 's17', 's18'] },
  { personId: 'p25', skillIds: ['s10', 's15', 's24'] }
];

// Relationships: Person -> WORKED_AT -> Company & HELD_ROLE -> Role
const employmentHistory = [
  { personId: 'p1', companyId: 'c1', roleId: 'r2', startYear: 2018, endYear: 2021 },
  { personId: 'p1', companyId: 'c5', roleId: 'r3', startYear: 2021 },
  
  { personId: 'p2', companyId: 'c7', roleId: 'r6', startYear: 2016, endYear: 2020 },
  { personId: 'p2', companyId: 'c1', roleId: 'r7', startYear: 2020 },
  
  { personId: 'p3', companyId: 'c5', roleId: 'r1', startYear: 2024 },
  
  { personId: 'p4', companyId: 'c1', roleId: 'r3', startYear: 2014, endYear: 2019 },
  { personId: 'p4', companyId: 'c3', roleId: 'r4', startYear: 2019 },
  
  { personId: 'p5', companyId: 'c4', roleId: 'r6', startYear: 2022 },
  
  { personId: 'p6', companyId: 'c4', roleId: 'r10', startYear: 2021 },
  
  { personId: 'p7', companyId: 'c2', roleId: 'r10', startYear: 2017, endYear: 2022 },
  { personId: 'p7', companyId: 'c3', roleId: 'r11', startYear: 2022 },
  
  { personId: 'p8', companyId: 'c6', roleId: 'r11', startYear: 2011, endYear: 2018 },
  { personId: 'p8', companyId: 'c1', roleId: 'r12', startYear: 2018 },
  
  { personId: 'p9', companyId: 'c6', roleId: 'r13', startYear: 2018, endYear: 2022 },
  { personId: 'p9', companyId: 'c3', roleId: 'r14', startYear: 2022 },
  
  { personId: 'p10', companyId: 'c2', roleId: 'r13', startYear: 2023 },
  
  { personId: 'p11', companyId: 'c7', roleId: 'r5', startYear: 2025 },
  
  { personId: 'p12', companyId: 'c6', roleId: 'r2', startYear: 2021 },
  
  { personId: 'p13', companyId: 'c7', roleId: 'r7', startYear: 2012, endYear: 2020 },
  { personId: 'p13', companyId: 'c1', roleId: 'r8', startYear: 2020 },
  
  { personId: 'p14', companyId: 'c1', roleId: 'r14', startYear: 2013, endYear: 2020 },
  { personId: 'p14', companyId: 'c3', roleId: 'r15', startYear: 2020 },
  
  { personId: 'p15', companyId: 'c1', roleId: 'r2', startYear: 2019, endYear: 2023 },
  { personId: 'p15', companyId: 'c5', roleId: 'r3', startYear: 2023 },
  
  { personId: 'p16', companyId: 'c8', roleId: 'r7', startYear: 2017 },
  
  { personId: 'p17', companyId: 'c4', roleId: 'r10', startYear: 2020 },
  
  { personId: 'p18', companyId: 'c4', roleId: 'r2', startYear: 2022 },
  
  { personId: 'p19', companyId: 'c8', roleId: 'r14', startYear: 2019 },
  
  { personId: 'p20', companyId: 'c2', roleId: 'r10', startYear: 2018, endYear: 2023 },
  { personId: 'p20', companyId: 'c1', roleId: 'r11', startYear: 2023 },
  
  { personId: 'p21', companyId: 'c1', roleId: 'r3', startYear: 2015, endYear: 2021 },
  { personId: 'p21', companyId: 'c5', roleId: 'r4', startYear: 2021 },
  
  { personId: 'p22', companyId: 'c7', roleId: 'r6', startYear: 2023 },
  
  { personId: 'p23', companyId: 'c8', roleId: 'r9', startYear: 2024 },
  
  { personId: 'p24', companyId: 'c4', roleId: 'r7', startYear: 2018 },
  
  { personId: 'p25', companyId: 'c6', roleId: 'r13', startYear: 2022 }
];

// Relationships: Role -> AT_COMPANY
const roleAtCompany = [
  { roleId: 'r1', companyId: 'c5' },
  { roleId: 'r2', companyId: 'c1' },
  { roleId: 'r2', companyId: 'c4' },
  { roleId: 'r2', companyId: 'c6' },
  { roleId: 'r3', companyId: 'c1' },
  { roleId: 'r3', companyId: 'c5' },
  { roleId: 'r4', companyId: 'c3' },
  { roleId: 'r4', companyId: 'c5' },
  { roleId: 'r5', companyId: 'c7' },
  { roleId: 'r6', companyId: 'c4' },
  { roleId: 'r6', companyId: 'c7' },
  { roleId: 'r7', companyId: 'c1' },
  { roleId: 'r7', companyId: 'c4' },
  { roleId: 'r7', companyId: 'c8' },
  { roleId: 'r8', companyId: 'c1' },
  { roleId: 'r9', companyId: 'c8' },
  { roleId: 'r10', companyId: 'c2' },
  { roleId: 'r10', companyId: 'c4' },
  { roleId: 'r11', companyId: 'c1' },
  { roleId: 'r11', companyId: 'c3' },
  { roleId: 'r12', companyId: 'c1' },
  { roleId: 'r13', companyId: 'c2' },
  { roleId: 'r13', companyId: 'c6' },
  { roleId: 'r14', companyId: 'c3' },
  { roleId: 'r14', companyId: 'c8' },
  { roleId: 'r15', companyId: 'c3' }
];

// Relationships: Person -> WORKED_WITH -> Person
const coWorkers = [
  { p1: 'p1', p2: 'p3' }, // Both at Vercel
  { p1: 'p1', p2: 'p15' }, // Both at Vercel & Google
  { p1: 'p1', p2: 'p21' }, // Both at Vercel & Google
  { p1: 'p2', p2: 'p13' }, // Both at Google & Amazon
  { p1: 'p4', p2: 'p7' }, // Both at Wexa AI
  { p1: 'p4', p2: 'p9' }, // Both at Wexa AI
  { p1: 'p4', p2: 'p14' }, // Both at Wexa AI
  { p1: 'p5', p2: 'p6' }, // Both at Stripe
  { p1: 'p5', p2: 'p17' }, // Both at Stripe
  { p1: 'p5', p2: 'p18' }, // Both at Stripe
  { p1: 'p6', p2: 'p17' }, // Both at Stripe
  { p1: 'p6', p2: 'p24' }, // Both at Stripe
  { p1: 'p7', p2: 'p9' }, // Both at Wexa AI
  { p1: 'p7', p2: 'p14' }, // Both at Wexa AI
  { p1: 'p9', p2: 'p14' }, // Both at Wexa AI
  { p1: 'p10', p2: 'p20' }, // Both at Meta
  { p1: 'p15', p2: 'p21' }, // Both at Vercel & Google
  { p1: 'p16', p2: 'p19' }, // Both at Netflix
  { p1: 'p16', p2: 'p23' } // Both at Netflix
];

async function seed() {
  console.log('Connecting to CognoDB...');
  const driver = neo4j.driver(uri!, neo4j.auth.basic(username, password!), {
    connectionTimeout: 10000,
  });

  const session = driver.session();

  try {
    // 1. Wipe the database for a clean, reliable seed
    console.log('Cleaning existing database content...');
    await session.run('MATCH (n) DETACH DELETE n');
    console.log('Database cleared.');

    // 2. Create Skill Nodes
    console.log(`Seeding ${skills.length} skills...`);
    for (const skill of skills) {
      await session.run(
        `MERGE (s:Skill {id: $id})
         SET s.name = $name, s.category = $category`,
        skill
      );
    }

    // 3. Create Company Nodes
    console.log(`Seeding ${companies.length} companies...`);
    for (const company of companies) {
      await session.run(
        `MERGE (c:Company {id: $id})
         SET c.name = $name, c.industry = $industry, c.location = $location`,
        company
      );
    }

    // 4. Create Role Nodes
    console.log(`Seeding ${roles.length} roles...`);
    for (const role of roles) {
      await session.run(
        `MERGE (r:Role {id: $id})
         SET r.title = $title, r.level = $level, r.category = $category`,
        role
      );
    }

    // 5. Create People Nodes
    console.log(`Seeding ${people.length} people...`);
    for (const person of people) {
      await session.run(
        `MERGE (p:Person {id: $id})
         SET p.name = $name, p.title = $title, p.location = $location, p.experienceYears = $experienceYears, p.bio = $bio`,
        person
      );
    }

    // 6. Connect Roles to Skills (REQUIRES_SKILL)
    console.log('Seeding role requirements (REQUIRES_SKILL)...');
    for (const req of roleRequiresSkills) {
      for (const skillId of req.skillIds) {
        await session.run(
          `MATCH (r:Role {id: $roleId})
           MATCH (s:Skill {id: $skillId})
           MERGE (r)-[:REQUIRES_SKILL]->(s)`,
          { roleId: req.roleId, skillId }
        );
      }
    }

    // 7. Connect Role Progression (NEXT_ROLE)
    console.log('Seeding role progression paths (NEXT_ROLE)...');
    for (const path of roleProgressions) {
      await session.run(
        `MATCH (from:Role {id: $fromId})
         MATCH (to:Role {id: $toId})
         MERGE (from)-[:NEXT_ROLE]->(to)`,
        path
      );
    }

    // 8. Connect Roles to Companies (AT_COMPANY)
    console.log('Seeding roles at companies (AT_COMPANY)...');
    for (const relation of roleAtCompany) {
      await session.run(
        `MATCH (r:Role {id: $roleId})
         MATCH (c:Company {id: $companyId})
         MERGE (r)-[:AT_COMPANY]->(c)`,
        relation
      );
    }

    // 9. Connect People to Skills (HAS_SKILL)
    console.log('Seeding peoples skills (HAS_SKILL)...');
    for (const ps of personSkills) {
      for (const skillId of ps.skillIds) {
        await session.run(
          `MATCH (p:Person {id: $personId})
           MATCH (s:Skill {id: $skillId})
           MERGE (p)-[:HAS_SKILL]->(s)`,
          { personId: ps.personId, skillId }
        );
      }
    }

    // 10. Connect People to Companies and Roles (WORKED_AT / HELD_ROLE)
    console.log('Seeding employment histories (WORKED_AT, HELD_ROLE)...');
    for (const history of employmentHistory) {
      // Create WORKED_AT
      await session.run(
        `MATCH (p:Person {id: $personId})
         MATCH (c:Company {id: $companyId})
         MERGE (p)-[r:WORKED_AT]->(c)
         SET r.startYear = $startYear, r.endYear = $endYear`,
        {
          personId: history.personId,
          companyId: history.companyId,
          startYear: history.startYear,
          endYear: history.endYear ?? null
        }
      );

      // Create HELD_ROLE
      await session.run(
        `MATCH (p:Person {id: $personId})
         MATCH (r:Role {id: $roleId})
         MERGE (p)-[hr:HELD_ROLE]->(r)
         SET hr.startYear = $startYear, hr.endYear = $endYear`,
        {
          personId: history.personId,
          roleId: history.roleId,
          startYear: history.startYear,
          endYear: history.endYear ?? null
        }
      );
    }

    // 11. Connect Coworkers (WORKED_WITH)
    console.log('Seeding coworkers relationships (WORKED_WITH)...');
    for (const cw of coWorkers) {
      await session.run(
        `MATCH (p1:Person {id: $p1})
         MATCH (p2:Person {id: $p2})
         MERGE (p1)-[:WORKED_WITH]->(p2)
         MERGE (p2)-[:WORKED_WITH]->(p1)`,
        cw
      );
    }

    console.log('=========================================');
    console.log('Database seeding completed successfully!');
    console.log('=========================================');

  } catch (error) {
    console.error('Seeding process failed with error:', error);
    process.exit(1);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();
