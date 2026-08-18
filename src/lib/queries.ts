import { runQuery } from './cognodb';
import { 
  Person, 
  Skill, 
  Company, 
  Role, 
  CompanyWithPeriod, 
  RoleWithPeriod, 
  PersonWithStats, 
  SharedSkillConnection, 
  SharedCompanyConnection, 
  CareerRecommendation,
  DashboardStats 
} from '@/types/graph';

/**
 * QUERY: Fetch system-wide graph metrics for the dashboard.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const cypher = `
    MATCH (p:Person) WITH count(p) AS peopleCount
    MATCH (s:Skill) WITH peopleCount, count(s) AS skillsCount
    MATCH (c:Company) WITH peopleCount, skillsCount, count(c) AS companiesCount
    MATCH (r:Role) RETURN peopleCount, skillsCount, companiesCount, count(r) AS rolesCount
  `;
  const results = await runQuery(cypher);
  if (results.length === 0) {
    return { peopleCount: 0, skillsCount: 0, companiesCount: 0, rolesCount: 0 };
  }
  return {
    peopleCount: results[0].peopleCount,
    skillsCount: results[0].skillsCount,
    companiesCount: results[0].companiesCount,
    rolesCount: results[0].rolesCount
  };
}

/**
 * QUERY: Retrieve list of people with search criteria.
 */
export async function getPeopleList(search: string = ''): Promise<PersonWithStats[]> {
  const cypher = `
    MATCH (p:Person)
    WHERE $search = "" 
       OR toLower(p.name) CONTAINS toLower($search) 
       OR toLower(p.title) CONTAINS toLower($search)
       OR toLower(p.location) CONTAINS toLower($search)
    OPTIONAL MATCH (p)-[:HAS_SKILL]->(s:Skill)
    OPTIONAL MATCH (p)-[:WORKED_AT]->(c:Company)
    OPTIONAL MATCH (p)-[:HELD_ROLE]->(r:Role)
    RETURN p AS person, 
           count(DISTINCT s) AS skillsCount, 
           count(DISTINCT c) AS companiesCount, 
           count(DISTINCT r) AS rolesCount
    ORDER BY p.name ASC
  `;
  const results = await runQuery(cypher, { search });
  return results.map((row) => ({
    ...row.person,
    skillsCount: row.skillsCount,
    companiesCount: row.companiesCount,
    rolesCount: row.rolesCount
  }));
}

/**
 * QUERY 1: Find a person by ID.
 */
export async function getPersonById(personId: string): Promise<Person | null> {
  const cypher = `
    MATCH (p:Person {id: $personId})
    RETURN p AS person
  `;
  const results = await runQuery(cypher, { personId });
  return results.length > 0 ? results[0].person : null;
}

/**
 * QUERY 2: Find a person's skills.
 */
export async function getPersonSkills(personId: string): Promise<Skill[]> {
  const cypher = `
    MATCH (p:Person {id: $personId})-[:HAS_SKILL]->(s:Skill)
    RETURN s AS skill
    ORDER BY s.category ASC, s.name ASC
  `;
  const results = await runQuery(cypher, { personId });
  return results.map((row) => row.skill);
}

/**
 * QUERY 3: Find companies where the person worked.
 */
export async function getPersonCompanies(personId: string): Promise<CompanyWithPeriod[]> {
  const cypher = `
    MATCH (p:Person {id: $personId})-[r:WORKED_AT]->(c:Company)
    RETURN c AS company, r.startYear AS startYear, r.endYear AS endYear
    ORDER BY r.startYear DESC
  `;
  const results = await runQuery(cypher, { personId });
  return results.map((row) => ({
    ...row.company,
    startYear: row.startYear,
    endYear: row.endYear || undefined
  }));
}

/**
 * QUERY 4: Find roles held by a person.
 */
export async function getPersonRoles(personId: string): Promise<RoleWithPeriod[]> {
  const cypher = `
    MATCH (p:Person {id: $personId})-[r:HELD_ROLE]->(role:Role)
    RETURN role, r.startYear AS startYear, r.endYear AS endYear
    ORDER BY r.startYear DESC
  `;
  const results = await runQuery(cypher, { personId });
  return results.map((row) => ({
    ...row.role,
    startYear: row.startYear,
    endYear: row.endYear || undefined
  }));
}

/**
 * QUERY 5 (MULTI-HOP): Find people who share skills with the selected person.
 * Person -> Skill -> Person
 */
export async function getSharedSkillConnections(personId: string): Promise<SharedSkillConnection[]> {
  const cypher = `
    MATCH (p:Person {id: $personId})-[:HAS_SKILL]->(s:Skill)<-[:HAS_SKILL]-(other:Person)
    WHERE other.id <> $personId
    RETURN other AS person, 
           collect(s.name) AS sharedSkills, 
           count(DISTINCT s) AS sharedSkillsCount
    ORDER BY sharedSkillsCount DESC, other.name ASC
    LIMIT 6
  `;
  const results = await runQuery(cypher, { personId });
  return results.map((row) => ({
    person: row.person,
    sharedSkillsCount: row.sharedSkillsCount,
    sharedSkills: row.sharedSkills
  }));
}

/**
 * QUERY 6 (CAREER MATCHING): Find roles whose required skills overlap with the selected person's skills.
 * Person -> Skill -> Role
 */
export async function getCareerMatches(personId: string): Promise<CareerRecommendation[]> {
  const cypher = `
    MATCH (p:Person {id: $personId})
    MATCH (r:Role)
    OPTIONAL MATCH (r)-[:AT_COMPANY]->(c:Company)
    OPTIONAL MATCH (r)-[:REQUIRES_SKILL]->(reqSkill:Skill)
    WITH p, r, c, reqSkill, 
         exists((p)-[:HAS_SKILL]->(reqSkill)) AS hasIt
    WITH r, c, 
         count(DISTINCT reqSkill) AS totalRequired,
         sum(case when hasIt then 1 else 0 end) AS matchingCount,
         collect(case when hasIt then reqSkill.name else null end) AS matchingSkills,
         collect(case when not hasIt then reqSkill.name else null end) AS missingSkills
    WHERE matchingCount > 0
    RETURN r AS role, 
           c AS company, 
           matchingCount AS matchingSkillsCount, 
           [x IN matchingSkills WHERE x IS NOT NULL] AS matchingSkills,
           [x IN missingSkills WHERE x IS NOT NULL] AS missingSkills
    ORDER BY matchingSkillsCount DESC, totalRequired ASC
    LIMIT 6
  `;
  const results = await runQuery(cypher, { personId });
  return results.map((row) => ({
    role: row.role,
    company: row.company || undefined,
    matchingSkillsCount: row.matchingSkillsCount,
    matchingSkills: row.matchingSkills,
    missingSkills: row.missingSkills
  }));
}

/**
 * QUERY 7 (CAREER PATH / MULTI-HOP): Explore possible next roles from a person's current role.
 * Person -> Role -> NEXT_ROLE -> Role
 */
export async function getCareerPath(personId: string): Promise<{ currentRole: Role | null; paths: any[] }> {
  // First, find the current role of the person (the one with endYear IS NULL)
  const currentRoleCypher = `
    MATCH (p:Person {id: $personId})-[r:HELD_ROLE]->(role:Role)
    WHERE r.endYear IS NULL
    RETURN role
    LIMIT 1
  `;
  const currentRoleRes = await runQuery(currentRoleCypher, { personId });
  
  if (currentRoleRes.length === 0) {
    return { currentRole: null, paths: [] };
  }
  
  const currentRole = currentRoleRes[0].role as Role;
  
  // Walk 1 to 2 hops along NEXT_ROLE to find progression paths
  const pathsCypher = `
    MATCH (currentRole:Role {id: $roleId})
    MATCH path = (currentRole)-[:NEXT_ROLE*1..2]->(nextRole:Role)
    OPTIONAL MATCH (nextRole)-[:AT_COMPANY]->(c:Company)
    RETURN nodes(path) AS rolesList, c AS company
  `;
  const results = await runQuery(pathsCypher, { roleId: currentRole.id });
  
  return {
    currentRole,
    paths: results.map((row) => ({
      roles: row.rolesList,
      company: row.company || undefined
    }))
  };
}

/**
 * QUERY 8 (SHARED COMPANY CONNECTIONS): Find people connected through a common company.
 * Person -> WORKED_AT -> Company <- WORKED_AT <- Person
 */
export async function getSharedCompanyConnections(personId: string): Promise<SharedCompanyConnection[]> {
  const cypher = `
    MATCH (p:Person {id: $personId})-[w1:WORKED_AT]->(c:Company)<-[w2:WORKED_AT]-(other:Person)
    WHERE other.id <> $personId
    RETURN other AS person, c.name AS sharedCompanyName
    ORDER BY sharedCompanyName ASC, other.name ASC
    LIMIT 6
  `;
  const results = await runQuery(cypher, { personId });
  return results.map((row) => ({
    person: row.person,
    sharedCompanyName: row.sharedCompanyName
  }));
}

/**
 * GRAPH VISUALIZATION QUERY: Fetch local neighborhood nodes and edges for the Graph Explorer.
 */
export async function getPersonGraphNeighborhood(personId: string): Promise<{ nodes: any[]; edges: any[] }> {
  // Fetch person
  const personQuery = `MATCH (p:Person {id: $personId}) RETURN p AS person`;
  const personRes = await runQuery(personQuery, { personId });
  if (personRes.length === 0) {
    return { nodes: [], edges: [] };
  }
  const mainPerson = personRes[0].person;
  
  // Nodes bucket
  const nodesMap = new Map<string, any>();
  const edges: any[] = [];
  
  // Add central person
  nodesMap.set(mainPerson.id, { id: mainPerson.id, label: mainPerson.name, type: 'person', subtitle: mainPerson.title });
  
  // 1. Fetch skills
  const skillsQuery = `
    MATCH (p:Person {id: $personId})-[r:HAS_SKILL]->(s:Skill)
    RETURN s AS skill
  `;
  const skillsRes = await runQuery(skillsQuery, { personId });
  skillsRes.forEach((row) => {
    const s = row.skill;
    nodesMap.set(s.id, { id: s.id, label: s.name, type: 'skill', subtitle: s.category });
    edges.push({ source: mainPerson.id, target: s.id, label: 'HAS_SKILL' });
  });
  
  // 2. Fetch companies
  const companiesQuery = `
    MATCH (p:Person {id: $personId})-[r:WORKED_AT]->(c:Company)
    RETURN c AS company, r.startYear AS startYear, r.endYear AS endYear
  `;
  const companiesRes = await runQuery(companiesQuery, { personId });
  companiesRes.forEach((row) => {
    const c = row.company;
    nodesMap.set(c.id, { id: c.id, label: c.name, type: 'company', subtitle: c.industry });
    edges.push({ 
      source: mainPerson.id, 
      target: c.id, 
      label: `WORKED_AT (${row.startYear}-${row.endYear || 'Present'})` 
    });
  });

  // 3. Fetch roles
  const rolesQuery = `
    MATCH (p:Person {id: $personId})-[r:HELD_ROLE]->(role:Role)
    RETURN role
  `;
  const rolesRes = await runQuery(rolesQuery, { personId });
  rolesRes.forEach((row) => {
    const r = row.role;
    nodesMap.set(r.id, { id: r.id, label: r.title, type: 'role', subtitle: r.level });
    edges.push({ source: mainPerson.id, target: r.id, label: 'HELD_ROLE' });
  });

  // 4. Fetch coworkers (up to 5 for clean layout)
  const coworkersQuery = `
    MATCH (p:Person {id: $personId})-[:WORKED_WITH]-(other:Person)
    RETURN other AS coworker
    LIMIT 5
  `;
  const coworkersRes = await runQuery(coworkersQuery, { personId });
  coworkersRes.forEach((row) => {
    const o = row.coworker;
    nodesMap.set(o.id, { id: o.id, label: o.name, type: 'coworker', subtitle: o.title });
    edges.push({ source: mainPerson.id, target: o.id, label: 'WORKED_WITH' });
  });

  return {
    nodes: Array.from(nodesMap.values()),
    edges
  };
}
