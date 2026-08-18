'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Code, Building, Briefcase, ChevronRight, User } from 'lucide-react';
import { PersonWithStats, ApiResponse } from '@/types/graph';

export default function PeopleDirectory() {
  const [people, setPeople] = useState<PersonWithStats[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPeople() {
      setLoading(true);
      try {
        const res = await fetch(`/api/people?search=${encodeURIComponent(search)}`);
        const json: ApiResponse<PersonWithStats[]> = await res.json();
        
        if (json.error) {
          setError(json.error.message);
        } else if (json.data) {
          setPeople(json.data);
          setError(null);
        }
      } catch (err) {
        setError('Failed to load professional directory.');
      } finally {
        setLoading(false);
      }
    }

    const delayDebounceFn = setTimeout(() => {
      fetchPeople();
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Professionals Directory</h2>
          <p className="text-sm text-gray-400 mt-1">Explore nodes and connections in our career network.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, role, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
          />
        </div>
      </div>

      {loading && people.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-12 rounded-xl bg-red-500/5 border border-red-500/10 text-center">
          <p className="text-red-400 font-semibold">{error}</p>
          <button 
            onClick={() => setSearch('')}
            className="mt-4 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-xs font-semibold text-white transition"
          >
            Reset Search
          </button>
        </div>
      ) : people.length === 0 ? (
        <div className="text-center py-20 glass-panel border border-white/5 space-y-4">
          <div className="h-12 w-12 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto text-gray-500">
            <User className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-white text-base">No Professionals Found</h4>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              We couldn't find any nodes matching "<em>{search}</em>". Try adjusting your terms.
            </p>
          </div>
          <button 
            onClick={() => setSearch('')}
            className="mt-2 text-xs font-semibold text-violet-400 hover:underline"
          >
            Clear search filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {people.map((person) => (
            <Link 
              key={person.id}
              href={`/people/${person.id}`}
              className="group block glass-panel glass-panel-hover p-6 border border-white/5 space-y-4 relative"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-violet-600/10 border border-violet-500/10 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform duration-200">
                  <User className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-white group-hover:text-violet-400 transition-colors text-base">
                    {person.name}
                  </h4>
                  <p className="text-xs text-gray-400 font-medium line-clamp-1">{person.title}</p>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span>{person.location}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/[0.04] text-center text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-500 uppercase font-medium">Skills</span>
                  <div className="flex items-center justify-center gap-1 text-emerald-400 font-semibold">
                    <Code className="h-3.5 w-3.5" />
                    <span>{person.skillsCount}</span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-500 uppercase font-medium">Companies</span>
                  <div className="flex items-center justify-center gap-1 text-blue-400 font-semibold">
                    <Building className="h-3.5 w-3.5" />
                    <span>{person.companiesCount}</span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-500 uppercase font-medium">Roles</span>
                  <div className="flex items-center justify-center gap-1 text-amber-400 font-semibold">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>{person.rolesCount}</span>
                  </div>
                </div>
              </div>

              <div className="absolute right-4 bottom-4 text-gray-600 group-hover:text-violet-400 transition-colors">
                <ChevronRight className="h-5 w-5 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
