# CareerGraph 🚀

CareerGraph is a polished, graph-based career intelligence web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **CognoDB** (using the official Neo4j JavaScript driver). It visualizes professional networks, analyzes skills-to-role overlaps, and computes career pathways using multi-hop Cypher queries.

---

## 🌟 Why a Graph Database?

A career path is not a set of disconnected rows in a spreadsheet; it is an organic, highly connected web of people, skills, roles, organizations, and historical transitions. 

In a traditional relational database (SQL), answering questions like:
> *"Who has coworker connections at a company who also possess a skill required for my next target role?"*

requires multiple table JOINs (e.g. `People` ↔ `Skills` ↔ `Company` ↔ `Role` ↔ `EmploymentHistory`). As database size grows, the number of records scanned scales exponentially, dragging query speeds down.

### The Graph Advantage:
1. **Index-Free Adjacency**: Connections are written as physical memory pointers on disk. Walking relationships (hops) takes **constant time** $O(1)$ regardless of overall database size.
2. **Intuitive Modeling**: The data model maps directly to real-world concepts (Nodes and Relationships) without intermediate junction tables.
3. **Multi-Hop Traversal**: Cypher queries make complex network lookups (e.g. `(:Person)-[:HELD_ROLE]->(:Role)-[:NEXT_ROLE*1..2]->(:Role)`) concise and highly performant.

---

## 🏗️ System Architecture

The application communicates over server-side routes to secure database credentials and protect database integrity:

```
Browser (React Pages / Interactive SVG Graph)
   ↓ (Client-Side Fetch API)
Next.js Route Handlers (Server-Side API Routes)
   ↓ (Cypher Execution Layer with Parameters)
Neo4j JavaScript Driver (`neo4j-driver`)
   ↓ (Bolt Protocol over TLS)
CognoDB Database Instance
```

---

## 📊 Graph Data Model

The application leverages a highly connected graph schema modeled with labeled nodes and typed relationships:

```mermaid
graph TD
    Person["👤 Person Node<br/>id, name, title, location,<br/>experienceYears, bio"]
    Skill["💡 Skill Node<br/>id, name, category"]
    Company["🏢 Company Node<br/>id, name, industry, location"]
    Role["💼 Role Node<br/>id, title, level, category"]

    Person -->|HAS_SKILL| Skill
    Person -->|WORKED_AT {startYear, endYear}| Company
    Person -->|HELD_ROLE {startYear, endYear}| Role
    Person -->|WORKED_WITH| Person
    Role -->|REQUIRES_SKILL| Skill
    Role -->|AT_COMPANY| Company
    Role -->|NEXT_ROLE| Role
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org) (v18.x or newer)
- npm or yarn

### 2. Install Dependencies
Clone the repository and run:
```bash
npm install
```

### 3. CognoDB Setup
1. Create a database instance on [CognoDB Cloud](https://cognodb.cloud).
2. Retrieve your **Bolt Connection URI**, **Username** (defaults to `cognodb`), and **Password**.

### 4. Configure Environment Variables
Create a `.env.local` file in the root directory and define the following variables:
```env
COGNODB_URI=bolt+s://<instance-id>.databases.cognodb.cloud
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=<your-generated-password>
```

> [!IMPORTANT]
> To prevent environment leaks, `COGNODB_PASSWORD` is kept server-side only and is **NEVER** prefixed with `NEXT_PUBLIC_`.

### 5. Seed the Graph
To clear the database and populate it with realistic interconnected test data (25 people, 8 companies, 15 roles, 25 skills, and relationships):
```bash
npm run seed
```

### 6. Run the Application
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚡ Main Cypher Queries

All queries are executed with strict parameter bindings (e.g. `$personId`) to ensure safety against Cypher injection.

### Query 1: Find a Person
```cypher
MATCH (p:Person {id: $personId})
RETURN p AS person
```

### Query 2: Find Person's Skills
```cypher
MATCH (p:Person {id: $personId})-[:HAS_SKILL]->(s:Skill)
RETURN s AS skill
ORDER BY s.category ASC, s.name ASC
```

### Query 3: Find Worked at Companies
```cypher
MATCH (p:Person {id: $personId})-[r:WORKED_AT]->(c:Company)
RETURN c AS company, r.startYear AS startYear, r.endYear AS endYear
ORDER BY r.startYear DESC
```

### Query 4: Find Roles Held by Person
```cypher
MATCH (p:Person {id: $personId})-[r:HELD_ROLE]->(role:Role)
RETURN role, r.startYear AS startYear, r.endYear AS endYear
ORDER BY r.startYear DESC
```

### Query 5: Find People with Shared Skills (Multi-hop)
```cypher
MATCH (p:Person {id: $personId})-[:HAS_SKILL]->(s:Skill)<-[:HAS_SKILL]-(other:Person)
WHERE other.id <> $personId
RETURN other AS person, 
       collect(s.name) AS sharedSkills, 
       count(DISTINCT s) AS sharedSkillsCount
ORDER BY sharedSkillsCount DESC, other.name ASC
```

### Query 6: Find Matching Roles (Career Matching)
```cypher
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
```

### Query 7: Career Hops / Next Roles (Multi-hop Path)
```cypher
MATCH (p:Person {id: $personId})-[r:HELD_ROLE]->(currentRole:Role)
WHERE r.endYear IS NULL
MATCH path = (currentRole)-[:NEXT_ROLE*1..2]->(nextRole:Role)
OPTIONAL MATCH (nextRole)-[:AT_COMPANY]->(c:Company)
RETURN nodes(path) AS rolesList, c AS company
```

### Query 8: Find Coworkers in Network
```cypher
MATCH (p:Person {id: $personId})-[w1:WORKED_AT]->(c:Company)<-[w2:WORKED_AT]-(other:Person)
WHERE other.id <> $personId
RETURN other AS person, c.name AS sharedCompanyName
ORDER BY sharedCompanyName ASC, other.name ASC
```

---

## 📦 Production Deployment

To build and package the application for hosting (e.g. Vercel, Netlify, AWS):
```bash
npm run build
npm run start
```
Make sure you register the `COGNODB_URI`, `COGNODB_USERNAME`, and `COGNODB_PASSWORD` environment variables in your deployment hosting dashboard settings.
