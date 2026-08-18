'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Code, 
  Building2, 
  Briefcase, 
  Sparkles,
  ArrowRight,
  HelpCircle,
  Network
} from 'lucide-react';
import { 
  Person, 
  Skill, 
  CompanyWithPeriod, 
  RoleWithPeriod, 
  SharedSkillConnection, 
  SharedCompanyConnection,
  CareerRecommendation,
  ApiResponse 
} from '@/types/graph';

export default function PersonDetails() {
  const router = useRouter();
  const { id } = useParams();
  
  const [profile, setProfile] = useState<{
    person: Person;
    skills: Skill[];
    companies: CompanyWithPeriod[];
    roles: RoleWithPeriod[];
  } | null>(null);

  const [connections, setConnections] = useState<{
    sharedSkills: SharedSkillConnection[];
    sharedCompanies: SharedCompanyConnection[];
  } | null>(null);

  const [careerMatches, setCareerMatches] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchAllData() {
      setLoading(true);
      try {
        const profileRes = await fetch(`/api/people/${id}`);
        const profileJson: ApiResponse<typeof profile> = await profileRes.json();
        
        if (profileJson.error) {
          setError(profileJson.error.message);
          setLoading(false);
          return;
        }

        const connRes = await fetch(`/api/people/${id}/connections`);
        const connJson: ApiResponse<typeof connections> = await connRes.json();

        const matchesRes = await fetch(`/api/career-matches/${id}`);
        const matchesJson: ApiResponse<CareerRecommendation[]> = await matchesRes.json();

        if (profileJson.data) setProfile(profileJson.data);
        if (connJson.data) setConnections(connJson.data);
        if (matchesJson.data) setCareerMatches(matchesJson.data);
        setError(null);
      } catch (err) {
        setError('An error occurred while retrieving profile data.');
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-24 bg-white/[0.02] border border-white/5 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-96 bg-white/[0.02] border border-white/5 rounded-xl lg:col-span-1" />
          <div className="h-96 bg-white/[0.02] border border-white/5 rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-6 text-center py-20">
        <HelpCircle className="h-12 w-12 text-amber-500 mx-auto" />
        <h3 className="text-xl font-bold text-white">Profile Unavailable</h3>
        <p className="text-sm text-gray-400 max-w-sm mx-auto">
          {error || 'The requested professional profile was not found or is misconfigured.'}
        </p>
        <button 
          onClick={() => router.push('/people')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-sm font-semibold text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </button>
      </div>
    );
  }

  const { person, skills, companies, roles } = profile;

  const skillsByCategory = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    acc[s.category] = acc[s.category] || [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <button 
          onClick={() => router.push('/people')}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="space-y-8 lg:col-span-1">
          <div className="glass-panel p-6 border border-white/5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-violet-600/10 border border-violet-500/10 flex items-center justify-center text-violet-400">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{person.name}</h3>
                <p className="text-xs text-gray-400 font-medium">{person.title}</p>
                <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{person.location}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.04] space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Total Experience:</span>
                <span className="font-semibold text-white">{person.experienceYears} Years</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed pt-2">
                {person.bio}
              </p>
            </div>
            
            <div className="pt-2">
              <Link 
                href={`/graph-explorer?personId=${person.id}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-600/10 text-violet-400 border border-violet-500/15 text-xs font-semibold hover:bg-violet-600 hover:text-white transition duration-200"
              >
                <Network className="h-4 w-4" /> Open in Graph Explorer
              </Link>
            </div>
          </div>

          <div className="glass-panel p-6 border border-white/5 space-y-4">
            <h4 className="font-bold text-white text-sm tracking-wide flex items-center gap-2">
              <Code className="h-4 w-4 text-emerald-400" />
              Professional Skills
            </h4>

            {skills.length === 0 ? (
              <p className="text-xs text-gray-500">No skills mapped for this person.</p>
            ) : (
              <div className="space-y-4 pt-1">
                {Object.entries(skillsByCategory).map(([category, items]) => (
                  <div key={category} className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      {category}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((skill) => (
                        <span 
                          key={skill.id}
                          className="px-2.5 py-1 text-xs rounded bg-emerald-500/5 text-emerald-300 border border-emerald-500/10"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8 lg:col-span-2">
          
          <div className="glass-panel p-6 border border-white/5 space-y-6">
            <h4 className="font-bold text-white text-sm tracking-wide flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-400" />
              Employment History
            </h4>

            {roles.length === 0 ? (
              <p className="text-xs text-gray-500">No employment records found.</p>
            ) : (
              <div className="relative pl-6 border-l border-white/[0.06] space-y-8 pt-2">
                {roles.map((role, idx) => {
                  const company = companies.find((c) => c.startYear === role.startYear);
                  return (
                    <div key={idx} className="relative space-y-1">
                      <span className="absolute -left-[30px] top-1.5 h-3 w-3 rounded-full bg-blue-500 border-2 border-brand-bg shadow-sm" />
                      
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h5 className="font-bold text-white text-sm sm:text-base">
                          {role.title}
                        </h5>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {role.startYear} – {role.endYear || 'Present'}
                          </span>
                        </div>
                      </div>
                      
                      {company && (
                        <p className="text-xs text-blue-400 font-medium">
                          {company.name} &bull; <span className="text-gray-500 font-normal">{company.industry} &bull; {company.location}</span>
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500 pt-1">
                        Level: {role.level} &bull; Category: {role.category}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 border border-white/5 space-y-4">
              <h4 className="font-bold text-white text-sm tracking-wide flex items-center gap-2">
                <Code className="h-4 w-4 text-violet-400" />
                Shared Skill Network
              </h4>
              
              {!connections?.sharedSkills || connections.sharedSkills.length === 0 ? (
                <p className="text-xs text-gray-500">No skill overlaps found.</p>
              ) : (
                <div className="space-y-3">
                  {connections.sharedSkills.map((conn) => (
                    <Link 
                      key={conn.person.id} 
                      href={`/people/${conn.person.id}`}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 transition"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{conn.person.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{conn.person.title}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-600/10 text-violet-400 border border-violet-500/10 font-bold">
                          +{conn.sharedSkillsCount} Overlaps
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-panel p-6 border border-white/5 space-y-4">
              <h4 className="font-bold text-white text-sm tracking-wide flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-400" />
                Coworker Network
              </h4>
              
              {!connections?.sharedCompanies || connections.sharedCompanies.length === 0 ? (
                <p className="text-xs text-gray-500">No shared company networks found.</p>
              ) : (
                <div className="space-y-3">
                  {connections.sharedCompanies.map((conn, idx) => (
                    <Link 
                      key={idx} 
                      href={`/people/${conn.person.id}`}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 transition"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{conn.person.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{conn.person.title}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-400 border border-blue-500/10 font-medium">
                          at {conn.sharedCompanyName}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm tracking-wide flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Suggested Career Transitions
              </h4>
              <Link 
                href={`/career-explorer?personId=${person.id}`}
                className="text-xs text-violet-400 hover:underline font-semibold flex items-center gap-0.5"
              >
                Detailed Career Path <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {careerMatches.length === 0 ? (
              <p className="text-xs text-gray-500">No target roles match this skill profile.</p>
            ) : (
              <div className="space-y-4">
                {careerMatches.slice(0, 3).map((match, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h5 className="font-bold text-white text-sm">{match.role.title}</h5>
                        {match.company && (
                          <p className="text-xs text-gray-400">Available at {match.company.name}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/10 font-bold">
                          {match.matchingSkillsCount} Matching Skills
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {match.matchingSkills.map((sk) => (
                          <span 
                            key={sk} 
                            className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/5 text-emerald-400/90 border border-emerald-500/10"
                          >
                            {sk}
                          </span>
                        ))}
                        {match.missingSkills.map((sk) => (
                          <span 
                            key={sk} 
                            className="px-1.5 py-0.5 text-[10px] rounded bg-red-500/5 text-red-400/90 border border-red-500/10 border-dashed"
                            title="Missing Skill"
                          >
                            {sk} (needed)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
