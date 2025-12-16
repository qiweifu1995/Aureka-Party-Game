import React, { useState } from 'react';
import { Player, Team } from '../types';
import { ShuffleIcon, UsersIcon, SparklesIcon } from './Icons';
import { generateFestiveTeamNames } from '../services/geminiService';

interface ToolsProps {
  players: Player[];
}

export const Tools: React.FC<ToolsProps> = ({ players }) => {
  const [activeTool, setActiveTool] = useState<'order' | 'teams'>('order');
  
  // Order State
  const [shuffledOrder, setShuffledOrder] = useState<Player[]>([]);
  
  // Teams State
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isNamingTeams, setIsNamingTeams] = useState(false);

  // Handlers
  const handleShuffle = () => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    setShuffledOrder(shuffled);
  };

  const handleGenerateTeams = async () => {
    if (players.length === 0) return;
    
    // Create basic teams
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const newTeams: Team[] = Array.from({ length: teamCount }, (_, i) => ({
      id: `team-${i}`,
      name: `Team ${i + 1}`,
      members: []
    }));

    shuffled.forEach((player, index) => {
      newTeams[index % teamCount].members.push(player);
    });

    setTeams(newTeams);

    // AI Naming
    setIsNamingTeams(true);
    const names = await generateFestiveTeamNames(newTeams);
    setTeams(prev => prev.map((t, i) => ({
      ...t,
      name: names[i] || t.name
    })));
    setIsNamingTeams(false);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex p-1 bg-gray-200 rounded-xl shrink-0 max-w-md mx-auto w-full">
        <button
          onClick={() => setActiveTool('order')}
          className={`flex-1 py-3 rounded-lg text-sm md:text-base font-bold transition-all ${
            activeTool === 'order' ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Random Order
        </button>
        <button
          onClick={() => setActiveTool('teams')}
          className={`flex-1 py-3 rounded-lg text-sm md:text-base font-bold transition-all ${
            activeTool === 'teams' ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Team Creator
        </button>
      </div>

      {activeTool === 'order' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-fade-in flex-1 flex flex-col">
          <div className="text-center mb-8 shrink-0">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Who goes first?</h2>
            <button
              onClick={handleShuffle}
              disabled={players.length === 0}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-10 py-4 rounded-xl font-bold text-xl shadow-lg shadow-violet-200 transition-all active:scale-95 flex items-center gap-2 mx-auto"
            >
              <ShuffleIcon className="w-6 h-6" />
              Shuffle Players
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {shuffledOrder.length > 0 ? (
                shuffledOrder.map((player, idx) => (
                    <div key={player.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-lg">
                        {idx + 1}
                    </div>
                    <span className="font-bold text-gray-800 text-lg">{player.name}</span>
                    </div>
                ))
                ) : (
                    <div className="col-span-full text-center text-gray-400 py-12 italic text-lg">
                        Tap shuffle to decide who goes first!
                    </div>
                )}
            </div>
          </div>
        </div>
      )}

      {activeTool === 'teams' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-fade-in flex-1 flex flex-col">
          <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200 shrink-0">
             <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
                 <div className="w-full md:w-64">
                    <div className="flex justify-between mb-2">
                        <label className="font-bold text-gray-700">Number of Teams</label>
                        <span className="bg-violet-100 text-violet-700 font-bold px-3 py-0.5 rounded-lg">{teamCount}</span>
                    </div>
                    <input 
                        type="range" 
                        min="2" 
                        max={Math.max(2, Math.floor(players.length / 1))} 
                        value={teamCount}
                        onChange={(e) => setTeamCount(Number(e.target.value))}
                        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-violet-600"
                    />
                 </div>
                 
                 <button
                    onClick={handleGenerateTeams}
                    disabled={players.length < 2}
                    className="w-full md:w-auto bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                    <UsersIcon className="w-6 h-6" />
                    {isNamingTeams ? 'Consulting AI...' : 'Create Teams'}
                </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {teams.map((team) => (
                <div key={team.id} className="border-2 border-green-100 rounded-2xl p-6 bg-green-50/30 flex flex-col">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-green-100">
                        <h3 className="font-bold text-green-800 text-xl flex items-center gap-2">
                            {isNamingTeams && <SparklesIcon className="w-5 h-5 animate-spin" />}
                            {team.name}
                        </h3>
                        <span className="text-sm font-bold text-green-600 bg-green-200 px-3 py-1 rounded-lg">{team.members.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                    {team.members.map(p => (
                        <span key={p.id} className="bg-white px-4 py-2 rounded-full text-base text-gray-700 font-medium border border-green-100 shadow-sm">
                        {p.name}
                        </span>
                    ))}
                    </div>
                </div>
                ))}
            </div>
             {teams.length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-400 italic text-xl">
                    Ready to split up? Hit the button!
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};