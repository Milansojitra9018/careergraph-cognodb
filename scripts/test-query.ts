import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { runQuery } from '../src/lib/cognodb';

async function testVariant(name: string, checkExpr: string) {
  console.log(`\n--- Testing variant: ${name} (${checkExpr}) ---`);
  const cypher = `
    MATCH (p:Person {id: $personId})
    MATCH (r:Role)
    OPTIONAL MATCH (r)-[:AT_COMPANY]->(c:Company)
    OPTIONAL MATCH (r)-[:REQUIRES_SKILL]->(reqSkill:Skill)
    WITH p, r, c, reqSkill, 
         ${checkExpr} AS hasIt
    WITH r, c, 
         count(DISTINCT reqSkill) AS totalRequired,
         sum(case when hasIt then 1 else 0 end) AS matchingCount,
         collect(case when hasIt then reqSkill.name else null end) AS matchingSkills,
         collect(case when not hasIt then reqSkill.name else null end) AS missingSkills
    WHERE matchingCount > 0
    RETURN r.title AS roleTitle, 
           c.name AS companyName, 
           matchingCount AS matchingSkillsCount, 
           [x IN matchingSkills WHERE x IS NOT NULL] AS matchingSkills,
           [x IN missingSkills WHERE x IS NOT NULL] AS missingSkills
    ORDER BY matchingSkillsCount DESC, totalRequired ASC
    LIMIT 3
  `;

  try {
    const resP1 = await runQuery(cypher, { personId: 'p1' });
    console.log('Alice Smith (p1) top match:', JSON.stringify(resP1[0], null, 2));

    const resP2 = await runQuery(cypher, { personId: 'p2' });
    console.log('Bob Jones (p2) top match:', JSON.stringify(resP2[0], null, 2));
  } catch (err) {
    console.error(`Variant ${name} failed:`, err);
  }
}

async function main() {
  await testVariant('exists { pattern }', 'exists { (p)-[:HAS_SKILL]->(reqSkill) }');
  await testVariant('size(pattern) > 0', 'size((p)-[:HAS_SKILL]->(reqSkill)) > 0');
}

main();
