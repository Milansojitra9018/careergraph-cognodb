'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Compass, 
  Users, 
  ArrowRight, 
  GitCommit, 
  Sparkles, 
  Code,
  Building2,
  Bookmark,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  Person, 
  Skill, 
  Role, 
  Company, 
  CareerRecommendation, 
  ApiResponse 
} from '@/types/graph';

function CareerExplorerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlPersonId = searchParams.get('personId') || '';

  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState(urlPersonId);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);

  const [activeTab, setActiveTab] = useState<'pathways' | 'matches'>('pathways');

  const [pathways, setPathways] = useState<{ currentRole: Role | null; paths: { roles: Role[]; company?: Company }[] } | null>(null);
  const [matches, setMatches] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPeople() {
      try {
        const res = await fetch('/api/people');
        const json: ApiResponse<Person[]> = await res.json();
        if (json.error) {
          setError(json.error.message);
        } else if (json.data && json.data.length > 0) {
          setPeople(json.data);
          if (!selectedPersonId) {
            setSelectedPersonId(json.data[0].id);
          }
        }
      } catch (err) {
        setError('Failed to fetch professional directory.');
      }
    }
    fetchPeople();
  }, []);

  useEffect(() => {
    if (selectedPersonId) {
      const params = new URLSearchParams(window.location.search);
      params.set('personId', selectedPersonId);
      router.replace(`${window.location.pathname}?${params.toString()}`);
    }
  }, [selectedPersonId]);

  useEffect(() => {
    if (!selectedPersonId) return;

    async function fetchCareerData() {
      setLoading(true);
      try {
        const personRes = await fetch(`/api/people/${selectedPersonId}`);
        const personJson: ApiResponse<{ person: Person; skills: Skill[] }> = await personRes.json();
        
        if (personJson.error) {
          setError(personJson.error.message);
          setLoading(false);
          return;
        }
        
        if (personJson.data) {
          setSelectedPerson(personJson.data.person);
          setSkills(personJson.data.skills);
        }

        const pathRes = await fetch(`/api/career-path/${selectedPersonId}`);
        const pathJson: ApiResponse<typeof pathways> = await pathRes.json();
        if (pathJson.data) {
          setPathways(pathJson.data);
        }

        const matchRes = await fetch(`/api/career-matches/${selectedPersonId}`);
        const matchJson: ApiResponse<CareerRecommendation[]> = await matchRes.json();
        if (matchJson.data) {
          setMatches(matchJson.data);
        }

        setError(null);
      } catch (err) {
        setError('Failed to load career metrics.');
      } finally {
        setLoading(false);
      }
    }

    fetchCareerData();
  }, [selectedPersonId]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Career Intelligence Explorer</h2>
          <p className="text-sm text-gray-400 mt-1">Traverse career paths and skill gaps based on graph connections.</p>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-4.5 w-4.5 text-gray-500" />
          <select
            value={selectedPersonId}
            onChange={(e) => setSelectedPersonId(e.target.value)}
            className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition"
          >
            {people.map((p) => (
              <option key={p.id} value={p.id} className="bg-gray-950 text-white">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400">
          {error}
        </div>
      )}

      {loading && !selectedPerson ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
          <div className="lg:col-span-1 h-80 rounded-xl bg-white/[0.02] border border-white/5" />
          <div className="lg:col-span-2 h-80 rounded-xl bg-white/[0.02] border border-white/5" />
        </div>
      ) : selectedPerson && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="space-y-8 lg:col-span-1">
            <div className="glass-panel p-6 border border-white/5 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">
                  Target Individual
                </span>
                <h3 className="text-xl font-bold text-white">{selectedPerson.name}</h3>
                <p className="text-xs text-gray-400 font-medium">Current Role: {selectedPerson.title}</p>
                <p className="text-xs text-gray-500">{selectedPerson.location} &bull; {selectedPerson.experienceYears} Years Exp</p>
              </div>

              <div className="pt-4 border-t border-white/[0.04] space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Current Skills Inventory
                </h4>
                {skills.length === 0 ? (
                  <p className="text-xs text-gray-500">No skills mapped.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                      <span 
                        key={skill.id}
                        className="px-2 py-0.5 text-xs rounded bg-violet-600/5 text-violet-400 border border-violet-500/10"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel p-6 border border-white/5 bg-gradient-to-br from-violet-600/5 to-emerald-600/5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-violet-400" />
                How this works
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Graph analysis calculates path recommendations in two ways:
              </p>
              <ul className="text-xs text-gray-500 space-y-2 list-disc list-inside">
                <li>
                  <strong className="text-white">Pathways:</strong> Multi-hop chains tracing <code className="text-violet-400">NEXT_ROLE</code> relationship steps.
                </li>
                <li>
                  <strong className="text-white">Skill Matches:</strong> Role requirements overlapping with your owned skills: <code className="text-emerald-400">(:Person)-[:HAS_SKILL]-&gt;(:Skill)&lt;-[:REQUIRES_SKILL]-(:Role)</code>.
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            
            <div className="flex border-b border-white/[0.06] w-full">
              <button
                onClick={() => setActiveTab('pathways')}
                className={`pb-3.5 text-sm font-semibold tracking-wider transition-all relative flex-1 text-center ${
                  activeTab === 'pathways' 
                    ? 'text-violet-400 font-bold' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Career Pathways (NEXT_ROLE)
                {activeTab === 'pathways' && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-violet-500" />
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('matches')}
                className={`pb-3.5 text-sm font-semibold tracking-wider transition-all relative flex-1 text-center ${
                  activeTab === 'matches' 
                    ? 'text-emerald-400 font-bold' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Skill Gap Alignment
                {activeTab === 'matches' && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500" />
                )}
              </button>
            </div>

            {loading ? (
              <div className="h-64 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ) : activeTab === 'pathways' ? (
              <div className="space-y-6">
                {!pathways || !pathways.currentRole || pathways.paths.length === 0 ? (
                  <div className="p-8 rounded-xl bg-white/[0.01] border border-white/5 text-center text-gray-500 text-sm">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                    No linear progression path defined in the graph from current role: "{selectedPerson.title}".
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex items-center gap-2 text-xs text-violet-400 font-medium">
                      <AlertCircle className="h-4 w-4" />
                      <span>Traversing CognoDB paths from <strong>{pathways.currentRole.title}</strong>:</span>
                    </div>

                    <div className="space-y-6">
                      {pathways.paths.map((path, pIdx) => (
                        <div 
                          key={pIdx} 
                          className="glass-panel p-6 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                          <div className="flex-1 flex flex-wrap items-center gap-2.5">
                            <div className="p-3 rounded-lg bg-violet-600/5 border border-violet-500/10">
                              <p className="text-xs font-bold text-white leading-none">{pathways.currentRole?.title}</p>
                              <span className="text-[9px] text-violet-400 uppercase font-medium">{pathways.currentRole?.level}</span>
                            </div>

                            {path.roles.map((r, rIdx) => (
                              <div key={rIdx} className="flex items-center gap-2.5">
                                <ArrowRight className="h-4 w-4 text-gray-600" />
                                <div className={`p-3 rounded-lg ${rIdx === path.roles.length - 1 ? 'bg-amber-600/10 border border-amber-500/20' : 'bg-white/[0.02] border border-white/5'}`}>
                                  <p className="text-xs font-bold text-white leading-none">{r.title}</p>
                                  <span className={`text-[9px] uppercase font-semibold ${rIdx === path.roles.length - 1 ? 'text-amber-400' : 'text-gray-400'}`}>
                                    {r.level}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {path.company && (
                            <div className="flex-shrink-0 text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-white/[0.04] space-y-1">
                              <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Atypical Employer</span>
                              <div className="flex items-center md:justify-end gap-1.5 text-xs text-white">
                                <Building2 className="h-4 w-4 text-blue-400" />
                                <span className="font-bold">{path.company.name}</span>
                              </div>
                              <p className="text-[10px] text-gray-500">{path.company.industry}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {matches.length === 0 ? (
                  <div className="p-8 rounded-xl bg-white/[0.01] border border-white/5 text-center text-gray-500 text-sm">
                    No matching roles could be calculated based on your skills profile.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {matches.map((match, mIdx) => (
                      <div 
                        key={mIdx} 
                        className="glass-panel p-5 border border-white/5 space-y-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-white text-base">{match.role.title}</h4>
                            <p className="text-xs text-gray-400 flex items-center gap-1.5">
                              Level: {match.role.level} &bull; Category: {match.role.category}
                              {match.company && (
                                <>
                                  &bull; <Building2 className="h-3.5 w-3.5 text-blue-400 inline" />
                                  <span>{match.company.name}</span>
                                </>
                              )}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                              {match.matchingSkillsCount} Matches
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Skills Alignment</span>
                          <div className="flex flex-wrap gap-1.5">
                            {match.matchingSkills.map((sk) => (
                              <span 
                                key={sk}
                                className="px-2 py-0.5 text-[11px] rounded bg-emerald-500/5 text-emerald-400 border border-emerald-500/10"
                              >
                                {sk} (Matched)
                              </span>
                            ))}

                            {match.missingSkills.map((sk) => (
                              <span 
                                key={sk}
                                className="px-2 py-0.5 text-[11px] rounded bg-red-500/5 text-red-400 border border-red-500/10 border-dashed"
                                title="Acquisition needed"
                              >
                                {sk} (Missing)
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
}

export default function CareerExplorer() {
  return (
    <Suspense fallback={
      <div className="h-64 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center animate-pulse">
        <Compass className="h-8 w-8 text-violet-500 animate-spin" />
      </div>
    }>
      <CareerExplorerContent />
    </Suspense>
  );
}
