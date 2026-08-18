'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Code2, 
  Briefcase, 
  Building2, 
  ArrowUpRight, 
  Sparkles, 
  GitMerge, 
  Database,
  Search,
  Compass,
  Network
} from 'lucide-react';
import { DashboardStats, ApiResponse } from '@/types/graph';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        const json: ApiResponse<DashboardStats> = await res.json();
        
        if (json.error) {
          setError(json.error);
        } else if (json.data) {
          setStats(json.data);
        }
      } catch (err) {
        setError({
          code: 'FETCH_ERROR',
          message: 'Unable to communicate with the career server API.'
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="relative rounded-2xl overflow-hidden glass-panel p-8 border border-white/5 bg-radial-gradient">
        <div className="absolute top-0 right-0 p-8 text-violet-500/10 pointer-events-none">
          <GitMerge className="h-64 w-64 transform translate-x-12 -translate-y-12" />
        </div>
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-semibold border border-violet-500/20">
            <Sparkles className="h-3 w-3" /> Career Intelligence v1.0
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Unlocking Relationships in Career Pathways
          </h2>
          <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
            CareerGraph is a relation-centric career engine powered by **CognoDB**. Traditional relational models struggle with interconnected professional webs—here, we model skills, roles, companies, and individuals as first-class entities to discover connections instantly.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-wide">Graph Metrics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))
          ) : error ? (
            <div className="col-span-4 p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <Database className="h-8 w-8 text-amber-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white text-sm">{error.message}</h4>
              <p className="text-xs text-gray-500 mt-1">
                {error.code === 'DATABASE_CONFIG_MISSING' 
                  ? 'Verify your .env.local matches .env.example' 
                  : 'Ensure CognoDB database is reachable and seeded.'}
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs text-violet-400 font-semibold hover:underline cursor-pointer" onClick={() => window.location.reload()}>
                Retry connection
              </div>
            </div>
          ) : (
            <>
              <div className="glass-panel p-6 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Professionals</p>
                  <h4 className="text-3xl font-extrabold text-white mt-1">{stats?.peopleCount}</h4>
                </div>
                <div className="h-12 w-12 rounded-lg bg-violet-600/10 flex items-center justify-center text-violet-400 border border-violet-500/10">
                  <Users className="h-6 w-6" />
                </div>
              </div>

              <div className="glass-panel p-6 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Expertise Skills</p>
                  <h4 className="text-3xl font-extrabold text-white mt-1">{stats?.skillsCount}</h4>
                </div>
                <div className="h-12 w-12 rounded-lg bg-emerald-600/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                  <Code2 className="h-6 w-6" />
                </div>
              </div>

              <div className="glass-panel p-6 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Companies</p>
                  <h4 className="text-3xl font-extrabold text-white mt-1">{stats?.companiesCount}</h4>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/10">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>

              <div className="glass-panel p-6 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Target Roles</p>
                  <h4 className="text-3xl font-extrabold text-white mt-1">{stats?.rolesCount}</h4>
                </div>
                <div className="h-12 w-12 rounded-lg bg-amber-600/10 flex items-center justify-center text-amber-400 border border-amber-500/10">
                  <Briefcase className="h-6 w-6" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-wide">Quick Navigation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/people" className="group block glass-panel glass-panel-hover p-6 border border-white/5 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-violet-600/10 flex items-center justify-center text-violet-400 border border-violet-500/10">
              <Search className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-base">Explore People</h4>
              <ArrowUpRight className="h-4 w-4 text-gray-500 group-hover:text-violet-400 transition-colors" />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Search and filter through the professional directory to inspect individual profiles, employment histories, and core skills.
            </p>
          </Link>

          <Link href="/career-explorer" className="group block glass-panel glass-panel-hover p-6 border border-white/5 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-600/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
              <Compass className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-base">Career Explorer</h4>
              <ArrowUpRight className="h-4 w-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Analyze career paths, view NEXT_ROLE pathways, and inspect skill gaps to understand how to advance.
            </p>
          </Link>

          <Link href="/graph-explorer" className="group block glass-panel glass-panel-hover p-6 border border-white/5 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/10">
              <Network className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-base">Graph Explorer</h4>
              <ArrowUpRight className="h-4 w-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Visualize local network subgraphs of people, skills, companies, and roles dynamically in an interactive SVG canvas.
            </p>
          </Link>
        </div>
      </div>

      <div className="glass-panel p-6 border border-white/5 space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Database className="h-5 w-5 text-violet-400" />
          Why a Graph Database for Career Intelligence?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-4">
            <h4 className="font-bold text-violet-400">The Problem with Relational DBs</h4>
            <p className="text-gray-400 leading-relaxed">
              In a traditional SQL database, connections like <em>"People who worked at the same company who share skills required for a next role"</em> require connecting 5-6 different tables (People, Skills, Companies, JobHistory, RoleRequirements).
            </p>
            <p className="text-gray-400 leading-relaxed text-xs p-3 rounded bg-white/[0.02] border border-white/5 font-mono">
              SELECT ... FROM People <br />
              JOIN HasSkill ON ... JOIN Skill ON ... <br />
              JOIN WorkedAt ON ... JOIN Company ON ... <br />
              JOIN RequiresSkill ON ... JOIN Role ON ...
            </p>
            <p className="text-gray-400 leading-relaxed">
              As depth increases, JOIN counts grow exponentially, triggering database table scans, locks, and query degradation.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-emerald-400">The Graph Advantage (CognoDB & Cypher)</h4>
            <p className="text-gray-400 leading-relaxed">
              Graphs represent relations as first-class, physical connections on disk. Walking relationships is done in <strong>constant time</strong> using pointer chasing (Index-Free Adjacency), regardless of database size.
            </p>
            <p className="text-gray-400 leading-relaxed text-xs p-3 rounded bg-white/[0.02] border border-white/5 font-mono text-emerald-400/90">
              MATCH (p:Person)-[:HAS_SKILL]-&gt;(s:Skill)<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;-[:REQUIRES_SKILL]-(r:Role)<br />
              RETURN r, count(s) AS overlap
            </p>
            <p className="text-gray-400 leading-relaxed">
              This yields intuitive queries, flexible schemas, and instant multi-hop traversals, enabling career recommendation workflows that are highly performant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
