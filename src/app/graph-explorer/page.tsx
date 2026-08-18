'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Network,
  Users,
  HelpCircle,
  Database,
  ArrowRight,
  Info,
  Circle
} from 'lucide-react';
import { Person, ApiResponse } from '@/types/graph';

function GraphVisualizer({
  personId,
  onCenterChange
}: {
  personId: string;
  onCenterChange: (id: string) => void;
}) {
  const [data, setData] = useState<{ nodes: any[]; edges: any[] } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!personId) return;

    async function fetchNeighborhood() {
      setLoading(true);
      try {
        const res = await fetch(`/api/people/${personId}/connections`);
        const json: ApiResponse<{ graphNeighborhood: { nodes: any[]; edges: any[] } }> = await res.json();

        if (json.error) {
          setError(json.error.message);
        } else if (json.data?.graphNeighborhood) {
          setData(json.data.graphNeighborhood);
          const centerNode = json.data.graphNeighborhood.nodes.find(n => n.id === personId);
          setSelectedNode(centerNode || null);
          setError(null);
        }
      } catch (err) {
        setError('Failed to fetch graph data.');
      } finally {
        setLoading(false);
      }
    }
    fetchNeighborhood();
  }, [personId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-pulse">
        <div className="lg:col-span-3 h-[350px] sm:h-[500px] w-full glass-panel border border-white/5 flex items-center justify-center bg-gray-950/40">
          <div className="text-center space-y-2">
            <Network className="h-10 w-10 text-violet-500 animate-spin mx-auto" />
            <p className="text-sm text-gray-500 font-medium">Reconstructing CognoDB subgraph...</p>
          </div>
        </div>
        <div className="lg:col-span-1 h-[350px] sm:h-[500px] w-full glass-panel border border-white/5 flex flex-col justify-between p-6 bg-gray-950/40">
          <div className="space-y-4">
            <div className="h-4.5 w-24 bg-white/5 rounded" />
            <div className="h-6 w-36 bg-white/5 rounded" />
            <div className="h-20 bg-white/5 rounded" />
          </div>
          <div className="h-10 bg-white/5 rounded w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-[500px] w-full glass-panel border border-white/5 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm">
          <Database className="h-12 w-12 text-amber-500 mx-auto" />
          <h4 className="font-bold text-white text-base">Database Connection Failed</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            {error || 'Unable to retrieve the network layout. Check that the server is online.'}
          </p>
        </div>
      </div>
    );
  }

  const { nodes, edges } = data;

  const width = 800;
  const height = 500;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 180;

  const positionedNodes = nodes.map((node, index) => {
    if (node.id === personId) {
      return { ...node, x: cx, y: cy };
    }
    const count = nodes.length - 1;
    const angle = (2 * Math.PI * (index - 1)) / count;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    return { ...node, x, y };
  });

  const getPosition = (id: string) => {
    const found = positionedNodes.find(n => n.id === id);
    return found ? { x: found.x, y: found.y } : { x: cx, y: cy };
  };

  // Node styles
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'person': return 'fill-violet-400 stroke-violet-500';
      case 'skill': return 'fill-emerald-400 stroke-emerald-500';
      case 'company': return 'fill-blue-400 stroke-blue-500';
      case 'role': return 'fill-amber-400 stroke-amber-500';
      case 'coworker': return 'fill-purple-400 stroke-purple-500';
      default: return 'fill-gray-400 stroke-gray-500';
    }
  };

  const getNodeRadius = (type: string) => {
    return type === 'person' ? 24 : 18;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 glass-panel border border-white/5 relative overflow-hidden bg-gray-950/40 h-[350px] sm:h-[500px] w-full">
        <div className="absolute top-3 left-3 right-3 sm:right-auto z-10 flex flex-wrap gap-2 text-[9px] sm:text-[10px] sm:top-4 sm:left-4 sm:gap-4 text-gray-400 font-bold uppercase tracking-wider bg-black/45 backdrop-blur-md px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg border border-white/5">
          <span className="flex items-center gap-1"><Circle className="h-2 w-2 fill-violet-400 text-violet-400" /> Center</span>
          <span className="flex items-center gap-1"><Circle className="h-2 w-2 fill-purple-400 text-purple-400" /> Coworker</span>
          <span className="flex items-center gap-1"><Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" /> Skill</span>
          <span className="flex items-center gap-1"><Circle className="h-2 w-2 fill-blue-400 text-blue-400" /> Company</span>
          <span className="flex items-center gap-1"><Circle className="h-2 w-2 fill-amber-400 text-amber-400" /> Role</span>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
          <g>
            {edges.map((edge, idx) => {
              const start = getPosition(edge.source);
              const end = getPosition(edge.target);
              return (
                <g key={idx}>
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    className="stroke-white/10 stroke-1.5"
                  />
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    className="stroke-transparent stroke-8 cursor-pointer"
                  />
                </g>
              );
            })}
          </g>

          <g>
            {positionedNodes.map((node) => {
              const isCenter = node.id === personId;
              const isHovered = hoveredNode?.id === node.id;
              const isSelected = selectedNode?.id === node.id;
              const r = getNodeRadius(node.type);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => {
                    setSelectedNode(node);
                    if (node.type === 'coworker') {
                      onCenterChange(node.id);
                    }
                  }}
                  className="cursor-pointer group"
                >
                  {isCenter && (
                    <circle
                      r={r + 8}
                      className="fill-none stroke-violet-500/20 stroke-1 pulse-focus"
                    />
                  )}

                  {/* Border highlights */}
                  <circle
                    r={r + (isHovered || isSelected ? 4 : 0)}
                    className={`transition-all duration-300 ${getNodeColor(node.type)} ${isHovered || isSelected ? 'opacity-100 fill-opacity-30 stroke-2' : 'opacity-85 fill-opacity-15 stroke-1.5'
                      }`}
                  />

                  <circle
                    r={isCenter ? 10 : 7}
                    className={`${getNodeColor(node.type)} fill-current opacity-90`}
                  />

                  <text
                    y={r + 14}
                    textAnchor="middle"
                    className={`text-[10px] font-bold fill-white/80 transition-all pointer-events-none drop-shadow-sm ${isHovered || isCenter || isSelected ? 'scale-105 opacity-100 font-extrabold fill-white' : 'opacity-60 font-medium'
                      }`}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="glass-panel p-6 border border-white/5 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <h4 className="font-bold text-white text-sm tracking-wide flex items-center gap-1.5">
            <Info className="h-4.5 w-4.5 text-violet-400" />
            Graph Metadata
          </h4>

          {selectedNode ? (
            <div className="space-y-3 pt-2">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-bold text-violet-400 tracking-wider">
                  Type: {selectedNode.type}
                </span>
                <h5 className="text-base font-extrabold text-white leading-tight">
                  {selectedNode.label}
                </h5>
                <p className="text-xs text-gray-400">{selectedNode.subtitle}</p>
              </div>

              <div className="pt-3 border-t border-white/[0.04] text-xs text-gray-500 leading-relaxed">
                {selectedNode.type === 'person' && (
                  <p>Central entity. Displays connection lines illustrating skills owned, companies worked at, roles held, and direct coworkers.</p>
                )}
                {selectedNode.type === 'coworker' && (
                  <p className="text-violet-400">Coworker. Shares historical employment nodes. Click this node to shift focus and re-center the graph around them.</p>
                )}
                {selectedNode.type === 'skill' && (
                  <p>Expertise node. Represents a specific skill. A line connects it if the central professional possesses it.</p>
                )}
                {selectedNode.type === 'company' && (
                  <p>Employer organization. Indicates a professional node worked at this physical location.</p>
                )}
                {selectedNode.type === 'role' && (
                  <p>Career node. Represents a corporate title or position held within their career directory.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 pt-2 leading-relaxed">
              Hover over or click nodes in the graph network to display relationship tags and node properties.
            </p>
          )}
        </div>

        {selectedNode && selectedNode.type === 'coworker' && (
          <button
            onClick={() => onCenterChange(selectedNode.id)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-xs font-semibold text-white transition duration-200"
          >
            Center Graph Around {selectedNode.label} <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Inner router wrapper to safely use query params in client
function GraphExplorerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const personId = searchParams.get('personId') || '';

  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState(personId);
  const [loadingDropdown, setLoadingDropdown] = useState(true);

  useEffect(() => {
    async function fetchPeople() {
      try {
        const res = await fetch('/api/people');
        const json: ApiResponse<Person[]> = await res.json();
        if (json.data && json.data.length > 0) {
          setPeople(json.data);
          if (!personId) {
            setSelectedPersonId(json.data[0].id);
            handleCenterChange(json.data[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDropdown(false);
      }
    }
    fetchPeople();
  }, []);

  useEffect(() => {
    if (personId) {
      setSelectedPersonId(personId);
    }
  }, [personId]);

  const handleCenterChange = (newId: string) => {
    setSelectedPersonId(newId);
    const params = new URLSearchParams(window.location.search);
    params.set('personId', newId);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Interactive Graph Explorer</h2>
          <p className="text-sm text-gray-400 mt-1">Explore relationships and map paths in real-time.</p>
        </div>

        {!loadingDropdown && people.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-gray-500" />
            <select
              value={selectedPersonId}
              onChange={(e) => handleCenterChange(e.target.value)}
              className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition"
            >
              {people.map((p) => (
                <option key={p.id} value={p.id} className="bg-gray-950 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <GraphVisualizer personId={selectedPersonId || 'p1'} onCenterChange={handleCenterChange} />
    </div>
  );
}

export default function GraphExplorer() {
  return (
    <Suspense fallback={
      <div className="h-[500px] w-full glass-panel border border-white/5 flex items-center justify-center">
        <Network className="h-10 w-10 text-violet-500 animate-spin" />
      </div>
    }>
      <GraphExplorerContent />
    </Suspense>
  );
}
