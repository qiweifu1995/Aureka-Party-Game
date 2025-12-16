import React, { useState, useEffect, useRef } from 'react';
import { Player } from '../../types';
import { TrophyIcon, SparklesIcon, RefreshIcon } from '../Icons';

interface SpeedStackBlowProps {
  players: Player[];
  updatePlayers: (players: Player[]) => void;
  onComplete: () => void;
}

type Matchup = {
  p1: string; // Player ID
  p2: string | null; // Player ID or null if solo
};

type Result = {
  playerId: string;
  time: number;
};

export const SpeedStackBlow: React.FC<SpeedStackBlowProps> = ({ players, updatePlayers, onComplete }) => {
  const [gameState, setGameState] = useState<'INTRO' | 'MATCH_PREP' | 'COUNTDOWN' | 'RACING' | 'MATCH_RESULT' | 'FINAL_RESULTS'>('INTRO');
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  
  // Race State
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [matchResults, setMatchResults] = useState<{[key: string]: number}>({}); // Map playerId -> time
  const [allResults, setAllResults] = useState<Result[]>([]);
  const [countdownValue, setCountdownValue] = useState(3);
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (players.length > 0 && matchups.length === 0) {
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      const newMatchups: Matchup[] = [];
      for (let i = 0; i < shuffled.length; i += 2) {
        newMatchups.push({
          p1: shuffled[i].id,
          p2: shuffled[i + 1] ? shuffled[i + 1].id : null
        });
      }
      setMatchups(newMatchups);
    }
  }, [players]);

  // Pre-load voices if possible
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const getCurrentPlayers = () => {
    if (matchups.length === 0) return [];
    const match = matchups[currentMatchIndex];
    const p1 = players.find(p => p.id === match.p1);
    const p2 = players.find(p => p.id === match.p2);
    return [p1, p2].filter(Boolean) as Player[];
  };

  const playAnnouncement = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.2; // Slightly faster for excitement
      utterance.pitch = 1.1; // Slightly higher pitch
      utterance.volume = 1;
      
      const voices = window.speechSynthesis.getVoices();
      // Try to find a male English voice or a "Google" voice which is usually high quality
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Male'))) || voices.find(v => v.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const startCountdownSequence = () => {
    setGameState('COUNTDOWN');
    setCountdownValue(3);
  };

  // Countdown Logic
  useEffect(() => {
    if (gameState === 'COUNTDOWN') {
      // Immediate execution for the current number
      if (countdownValue > 0) {
        playAnnouncement(countdownValue.toString());
        const timer = setTimeout(() => {
          setCountdownValue(prev => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // Countdown finished
        playAnnouncement("GO!");
        startRace();
      }
    }
  }, [gameState, countdownValue]);

  const startRace = () => {
    setGameState('RACING');
    const now = Date.now();
    startTimeRef.current = now;
    setCurrentTime(0);
    setMatchResults({});
    
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      // Calculate elapsed time from the ref
      const elapsed = Date.now() - startTimeRef.current;
      setCurrentTime(elapsed);
    }, 30); // Update roughly 30 times a second
  };

  const restartMatch = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMatchResults({});
    startTimeRef.current = 0;
    setCurrentTime(0);
    setGameState('MATCH_PREP');
  };

  const finishPlayer = (playerId: string) => {
    // Record time at the moment of click using the ref for consistency
    const time = Date.now() - startTimeRef.current;
    setMatchResults(prev => ({ ...prev, [playerId]: time }));
  };

  // Check if race is done
  useEffect(() => {
    if (gameState === 'RACING') {
      const currentMatchPlayers = getCurrentPlayers();
      const finishedCount = Object.keys(matchResults).length;
      
      // Stop timer and transition ONLY when ALL players have finished
      if (finishedCount === currentMatchPlayers.length && currentMatchPlayers.length > 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        
        // Small delay to let the user see their time on the button before screen switch
        const timeoutId = setTimeout(() => {
          setGameState('MATCH_RESULT');
          // NOTE: We do NOT add to allResults here anymore. 
          // We wait until user clicks "Next Match" to confirm the results are valid.
        }, 750);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [matchResults, gameState]);

  const handleNextMatch = () => {
    // 1. Commit current match results to allResults
    const currentMatchResults = Object.entries(matchResults).map(([pid, t]) => ({ playerId: pid, time: t }));
    const newAllResults = [...allResults, ...currentMatchResults];
    setAllResults(newAllResults);

    // 2. Decide next step
    if (currentMatchIndex < matchups.length - 1) {
      setCurrentMatchIndex(prev => prev + 1);
      setGameState('MATCH_PREP');
      setMatchResults({});
    } else {
      calculateFinalScores(newAllResults);
    }
  };

  const calculateFinalScores = (finalResultsToUse: Result[]) => {
    let updatedPlayers = [...players];
    
    // Logic: Head to Head Bonus
    matchups.forEach(match => {
      if (!match.p2) return;
      const p1Time = finalResultsToUse.find(r => r.playerId === match.p1)?.time || 0;
      const p2Time = finalResultsToUse.find(r => r.playerId === match.p2)?.time || 0;
      
      let winnerId = null;
      if (p1Time < p2Time) winnerId = match.p1;
      else if (p2Time < p1Time) winnerId = match.p2;
      
      if (winnerId) {
        updatedPlayers = updatedPlayers.map(p => 
          p.id === winnerId ? { ...p, score: p.score + 1 } : p
        );
      }
    });

    // Logic: Rank Points
    const sortedResults = [...finalResultsToUse].sort((a, b) => a.time - b.time);
    const count = sortedResults.length;
    
    sortedResults.forEach((res, index) => {
        let points = 5;
        if (count > 1) {
            points = Math.round(5 - (index / (count - 1)) * 4);
        }
        updatedPlayers = updatedPlayers.map(p => 
            p.id === res.playerId ? { ...p, score: p.score + points } : p
        );
    });

    updatePlayers(updatedPlayers);
    setGameState('FINAL_RESULTS');
  };

  const formatTime = (ms: number) => (ms / 1000).toFixed(2) + "s";

  const currentPlayers = getCurrentPlayers();

  if (gameState === 'INTRO') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
        <div className="bg-violet-100 p-8 rounded-full mb-8 text-violet-600 shadow-inner">
           <TrophyIcon className="w-24 h-24" />
        </div>
        <h2 className="text-4xl font-bold text-violet-700 mb-4">Game 1</h2>
        <h1 className="text-5xl font-bold text-gray-800 mb-8">Speed, Stack, & Blow!</h1>
        <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-violet-100 max-w-2xl">
          <p className="text-xl text-gray-600 leading-relaxed">
            Stack 6 cups into a pyramid, unstack them, and blow the pile across the line!
          </p>
          <div className="mt-6 flex flex-col gap-2 text-left bg-gray-50 p-6 rounded-xl">
             <strong>Rules:</strong>
             <ul className="list-disc pl-5 space-y-2">
                <li>Head-to-head races.</li>
                <li>Winner gets <strong className="text-green-600">+1 point</strong>.</li>
                <li>Fastest times overall get up to <strong className="text-violet-600">5 points</strong>!</li>
             </ul>
          </div>
        </div>
        <button 
          onClick={() => setGameState('MATCH_PREP')}
          className="mt-10 bg-violet-600 text-white px-12 py-5 rounded-2xl font-bold text-2xl shadow-xl hover:bg-violet-700 transition-all active:scale-95 ring-4 ring-violet-200"
        >
          Let's Play!
        </button>
      </div>
    );
  }

  if (gameState === 'MATCH_PREP') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in">
        <h3 className="text-2xl text-gray-500 font-bold uppercase tracking-widest mb-12">Next Matchup</h3>
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 mb-16">
           <div className="bg-white p-10 rounded-3xl shadow-xl border-4 border-violet-100 min-w-[250px] transform hover:scale-105 transition-transform">
              <span className="block text-6xl mb-4">🟣</span>
              <span className="font-bold text-3xl text-gray-800">{currentPlayers[0]?.name}</span>
           </div>
           {currentPlayers[1] && (
               <>
                <div className="font-bold text-6xl text-violet-300 animate-pulse">VS</div>
                <div className="bg-white p-10 rounded-3xl shadow-xl border-4 border-fuchsia-100 min-w-[250px] transform hover:scale-105 transition-transform">
                    <span className="block text-6xl mb-4">🟪</span>
                    <span className="font-bold text-3xl text-gray-800">{currentPlayers[1].name}</span>
                </div>
               </>
           )}
           {!currentPlayers[1] && (
               <div className="text-gray-400 font-style-italic text-2xl">(Solo Run)</div>
           )}
        </div>
        <button 
          onClick={startCountdownSequence}
          className="bg-yellow-400 text-yellow-900 px-16 py-6 rounded-full font-bold text-3xl shadow-2xl hover:bg-yellow-300 transition-all transform hover:scale-105 active:scale-95 border-8 border-yellow-200"
        >
          START RACE
        </button>
      </div>
    );
  }

  if (gameState === 'COUNTDOWN') {
     return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center animate-fade-in">
            <div className={`
                relative w-80 h-80 rounded-full flex items-center justify-center border-[16px] shadow-[0_0_100px_rgba(255,255,255,0.3)]
                transition-all duration-300 transform scale-110
                ${countdownValue === 3 ? 'border-violet-600 bg-violet-900/30' : ''}
                ${countdownValue === 2 ? 'border-fuchsia-500 bg-fuchsia-900/30' : ''}
                ${countdownValue === 1 ? 'border-pink-500 bg-pink-900/30' : ''}
                ${countdownValue === 0 ? 'border-green-500 bg-green-900/30' : ''}
            `}>
                <span className={`
                    font-mono font-black text-9xl text-white drop-shadow-2xl transition-all duration-100
                    ${countdownValue > 0 ? 'animate-bounce' : 'scale-125'}
                `}>
                    {countdownValue > 0 ? countdownValue : "GO!"}
                </span>
            </div>
        </div>
     )
  }

  if (gameState === 'RACING') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in">
        <div className="mb-12 flex flex-col items-center gap-4">
            <div className="font-mono text-8xl font-bold text-gray-800 tabular-nums tracking-wider bg-white px-12 py-6 rounded-3xl shadow-2xl border-2 border-gray-100">
                {formatTime(currentTime)}
            </div>
            <button 
                onClick={restartMatch}
                className="flex items-center gap-2 text-gray-400 hover:text-red-500 font-bold uppercase tracking-widest text-sm transition-colors py-2 px-4 rounded-lg hover:bg-red-50"
            >
                <RefreshIcon className="w-4 h-4" /> Restart Round
            </button>
        </div>

        <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
            {currentPlayers.map((p, idx) => {
                const isFinished = !!matchResults[p.id];
                return (
                    <button
                        key={p.id}
                        disabled={isFinished}
                        onClick={() => finishPlayer(p.id)}
                        className={`
                            h-64 rounded-3xl font-bold text-4xl transition-all transform active:scale-95 shadow-2xl flex flex-col items-center justify-center gap-4 border-b-[12px] active:border-b-0 active:translate-y-2
                            ${isFinished 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed scale-95 border-transparent translate-y-2 border-b-0' 
                                : idx === 0 
                                    ? 'bg-violet-600 text-white hover:bg-violet-700 border-violet-800' 
                                    : 'bg-fuchsia-500 text-white hover:bg-fuchsia-600 border-fuchsia-800'}
                            ${currentPlayers.length === 1 ? 'col-span-2' : ''}
                        `}
                    >
                        <span>{p.name}</span>
                        <span className={`
                          ${isFinished 
                            ? 'text-6xl font-black text-gray-800 bg-white px-8 py-3 rounded-2xl shadow-inner border-2 border-gray-200 mt-2 min-w-[200px]' 
                            : 'text-xl font-medium opacity-80 uppercase tracking-wide bg-black/20 px-4 py-1 rounded-full'}
                        `}>
                            {isFinished ? formatTime(matchResults[p.id]) : "Click when DONE!"}
                        </span>
                    </button>
                )
            })}
        </div>
      </div>
    );
  }

  if (gameState === 'MATCH_RESULT') {
    const p1 = currentPlayers[0];
    const p2 = currentPlayers[1];
    const t1 = matchResults[p1.id];
    const t2 = p2 ? matchResults[p2.id] : Infinity;
    
    let winner = null;
    if (p2) {
        if (t1 < t2) winner = p1;
        else if (t2 < t1) winner = p2;
    }

    return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in">
            <h2 className="text-6xl font-bold text-violet-700 mb-10">Match Complete!</h2>
            
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 w-full max-w-lg mb-6">
                {currentPlayers.map(p => (
                    <div key={p.id} className="flex justify-between items-center py-4 border-b last:border-0 border-gray-100 text-2xl">
                        <span className="font-bold text-gray-700">{p.name}</span>
                        <span className="font-mono font-bold text-violet-600">{formatTime(matchResults[p.id])}</span>
                    </div>
                ))}
            </div>

            {winner && (
                <div className="mb-8 bg-yellow-50 text-yellow-800 px-8 py-4 rounded-2xl border-2 border-yellow-200 inline-flex items-center gap-3 shadow-md">
                    <TrophyIcon className="w-8 h-8 text-yellow-600" />
                    <span className="text-2xl"><strong>{winner.name}</strong> wins +1 Point!</span>
                </div>
            )}

            <div className="flex flex-col gap-4 w-full max-w-sm">
                <button 
                    onClick={handleNextMatch}
                    className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-2xl shadow-xl hover:bg-blue-700 transition-all w-full"
                >
                    {currentMatchIndex < matchups.length - 1 ? "Next Match" : "See Final Results"}
                </button>
                
                <button 
                    onClick={restartMatch}
                    className="text-gray-400 hover:text-red-500 font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2 py-2"
                >
                    <RefreshIcon className="w-4 h-4" /> Restart Round
                </button>
            </div>
        </div>
    );
  }

  if (gameState === 'FINAL_RESULTS') {
     const sortedByTime = [...allResults].sort((a,b) => a.time - b.time);

     return (
        <div className="flex flex-col items-center h-full p-8 animate-fade-in">
            <h2 className="text-5xl font-bold text-violet-700 mb-4">Round 1 Results</h2>
            <p className="text-gray-500 mb-8 text-xl">Points assigned based on speed ranking</p>

            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden mb-8 flex-1 overflow-y-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm uppercase font-bold sticky top-0">
                        <tr>
                            <th className="px-6 py-4">Rank</th>
                            <th className="px-6 py-4">Player</th>
                            <th className="px-6 py-4 text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-lg">
                        {sortedByTime.map((res, idx) => {
                            const player = players.find(p => p.id === res.playerId);
                            return (
                                <tr key={res.playerId} className={idx < 3 ? "bg-yellow-50/50" : ""}>
                                    <td className="px-6 py-4 font-bold text-gray-400">#{idx + 1}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{player?.name}</td>
                                    <td className="px-6 py-4 text-right font-mono text-violet-600 font-bold">{formatTime(res.time)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <button 
                onClick={onComplete}
                className="w-full max-w-md bg-green-600 text-white px-8 py-5 rounded-2xl font-bold text-2xl shadow-xl hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
                Continue to Scoreboard
                <SparklesIcon className="w-6 h-6" />
            </button>
        </div>
     );
  }

  return null;
};