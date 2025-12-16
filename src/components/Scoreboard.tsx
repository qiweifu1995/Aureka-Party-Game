import React, { useMemo, useState } from 'react';
import { Player } from '../types';
import { TrophyIcon, SparklesIcon } from './Icons';
import { generateRoastOrToast } from '../services/geminiService';

interface ScoreboardProps {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ players, setPlayers }) => {
  const [commentary, setCommentary] = useState<string | null>(null);
  const [loadingCommentary, setLoadingCommentary] = useState(false);

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  const updateScore = (id: string, delta: number) => {
    setPlayers(prev => prev.map(p => 
      p.id === id ? { ...p, score: p.score + delta } : p
    ));
  };

  const handleGenerateCommentary = async () => {
    if (sortedPlayers.length < 2) return;
    setLoadingCommentary(true);
    const leader = sortedPlayers[0];
    const loser = sortedPlayers[sortedPlayers.length - 1];
    const text = await generateRoastOrToast(leader, loser);
    setCommentary(text);
    setLoadingCommentary(false);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-900 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden shrink-0">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-4xl font-bold mb-2 tracking-tight">Leaderboard</h2>
                <p className="text-violet-200">Track the winners and the learners!</p>
            </div>
            <button 
                onClick={handleGenerateCommentary}
                disabled={loadingCommentary || players.length < 2}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-5 py-3 rounded-xl font-bold transition flex items-center gap-2 disabled:opacity-50 text-sm md:text-base border border-white/10"
            >
                <SparklesIcon className="w-5 h-5" />
                {loadingCommentary ? "Consulting AI..." : "AI Roast/Toast"}
            </button>
        </div>

        {commentary && (
            <div className="mt-6 p-4 bg-white/10 rounded-2xl border border-white/20 text-lg italic animate-fade-in text-center shadow-inner">
                "{commentary}"
            </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {players.length === 0 && (
             <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-300">
                <p className="text-gray-500 text-xl">No players yet.</p>
             </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
            {sortedPlayers.map((player, index) => (
            <div 
                key={player.id} 
                className={`
                relative bg-white rounded-2xl p-6 shadow-sm border-2 transition-all transform hover:-translate-y-1 hover:shadow-md
                ${index === 0 ? 'border-yellow-400 shadow-yellow-100 lg:col-span-2 lg:row-span-2 flex flex-col justify-center' : 'border-transparent hover:border-violet-100'}
                ${index === 1 ? 'border-gray-200' : ''}
                ${index === 2 ? 'border-orange-200' : ''}
                `}
            >
                {index === 0 && (
                <div className="absolute -top-4 -left-4 bg-yellow-400 text-yellow-900 p-3 rounded-full shadow-lg z-10">
                    <TrophyIcon className="w-8 h-8" />
                </div>
                )}
                
                <div className={`flex ${index === 0 ? 'flex-col items-center text-center gap-6' : 'flex-row items-center justify-between gap-4'}`}>
                
                <div className={`flex items-center gap-4 ${index === 0 ? 'flex-col' : ''}`}>
                    <span className={`
                    font-bold flex items-center justify-center rounded-full shrink-0
                    ${index === 0 ? 'bg-yellow-100 text-yellow-700 w-16 h-16 text-3xl' : 
                        index === 1 ? 'bg-gray-100 text-gray-600 w-10 h-10 text-lg' :
                        index === 2 ? 'bg-orange-100 text-orange-700 w-10 h-10 text-lg' :
                        'bg-slate-50 text-gray-400 w-10 h-10 text-base'}
                    `}>
                    #{index + 1}
                    </span>
                    <div>
                    <h3 className={`font-bold text-gray-800 leading-tight ${index === 0 ? 'text-4xl' : 'text-lg'}`}>
                        {player.name}
                    </h3>
                    {index === 0 && <div className="text-yellow-600 font-bold uppercase tracking-widest text-sm mt-1">Current Leader</div>}
                    </div>
                </div>

                <div className={`flex items-center bg-gray-50 rounded-xl p-1 ${index === 0 ? 'scale-125' : ''}`}>
                    <button
                    onClick={() => updateScore(player.id, -1)}
                    className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-100 rounded-lg font-bold text-xl transition-colors"
                    >
                    -
                    </button>
                    <div className="w-16 text-center font-bold text-2xl text-gray-800">
                    {player.score}
                    </div>
                    <button
                    onClick={() => updateScore(player.id, 1)}
                    className="w-10 h-10 flex items-center justify-center text-green-600 hover:bg-green-100 rounded-lg font-bold text-xl transition-colors"
                    >
                    +
                    </button>
                </div>
                </div>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};