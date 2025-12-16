import React, { useState } from 'react';
import { Player } from '../types';
import { RobotIcon, SparklesIcon } from './Icons';
import { generatePartyChallenge } from '../services/geminiService';

interface PartyAIProps {
  players: Player[];
}

export const PartyAI: React.FC<PartyAIProps> = ({ players }) => {
  const [challenge, setChallenge] = useState<{title: string, description: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetChallenge = async () => {
    setLoading(true);
    const result = await generatePartyChallenge(players);
    setChallenge(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white text-center relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <RobotIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-christmas font-bold mb-2">Elf Bot 3000</h2>
          <p className="text-indigo-100 text-sm mb-6 max-w-xs mx-auto">
            Need a game idea or a tie-breaker? Ask the party AI!
          </p>
          
          <button
            onClick={handleGetChallenge}
            disabled={loading}
            className="bg-white text-indigo-700 px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2 mx-auto"
          >
            {loading ? <SparklesIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
            {loading ? 'Generating Fun...' : 'Suggest a Minigame'}
          </button>
        </div>
      </div>

      {challenge && (
        <div className="bg-white border-2 border-indigo-100 rounded-2xl p-6 shadow-md animate-fade-in relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                New Challenge
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{challenge.title}</h3>
            <p className="text-gray-600 text-center leading-relaxed">
                {challenge.description}
            </p>
        </div>
      )}
      
      {!challenge && (
         <div className="text-center text-gray-400 text-sm italic p-4">
            The AI uses the current guest list to tailor challenges!
         </div>
      )}
    </div>
  );
};
