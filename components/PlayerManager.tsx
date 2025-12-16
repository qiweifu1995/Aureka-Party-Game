import React, { useState } from 'react';
import { Player } from '../types';
import { PlusIcon, TrashIcon, UsersIcon, TrophyIcon } from './Icons';

interface PlayerManagerProps {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  onComplete?: () => void;
}

export const PlayerManager: React.FC<PlayerManagerProps> = ({ players, setPlayers, onComplete }) => {
  const [newName, setNewName] = useState('');

  const addPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      score: 0,
    };
    
    setPlayers(prev => [...prev, newPlayer]);
    setNewName('');
  };

  const removePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-violet-100 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
            <div className="p-4 bg-violet-100 text-violet-600 rounded-full">
            <UsersIcon className="w-8 h-8" />
            </div>
            <div>
                <h2 className="text-3xl font-bold text-gray-800">
                {onComplete ? "Who's Here?" : "Guest List"}
                </h2>
                <p className="text-gray-500">Manage your party attendees</p>
            </div>
        </div>

        <form onSubmit={addPlayer} className="flex gap-2 w-full md:w-auto">
            <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter guest name..."
            className="flex-1 md:w-64 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-lg"
            autoFocus={!!onComplete}
            />
            <button
            type="submit"
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-md active:scale-95 transform"
            >
            <PlusIcon className="w-5 h-5" />
            Add
            </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto min-h-[200px] bg-gray-50 rounded-2xl p-4 border border-gray-100">
        {players.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 italic">
            <div className="text-4xl mb-2">👋</div>
            No guests yet. Add someone to get the party started!
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {players.map(player => (
            <div key={player.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-violet-200 transition-all group animate-fade-in">
                <span className="font-bold text-gray-700 text-lg truncate pr-2">{player.name}</span>
                <button
                onClick={() => removePlayer(player.id)}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Remove guest"
                >
                <TrashIcon className="w-5 h-5" />
                </button>
            </div>
            ))}
        </div>
      </div>

      {onComplete && (
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
           <button
             onClick={onComplete}
             disabled={players.length === 0}
             className="w-full md:w-auto bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-12 py-4 rounded-xl font-bold text-xl shadow-lg shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-2"
           >
             Start the Games!
             <TrophyIcon className="w-6 h-6" />
           </button>
        </div>
      )}
    </div>
  );
};