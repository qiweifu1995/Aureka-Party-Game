import React, { useState, useEffect } from 'react';
import { Player, AppTab } from './types';
import { PlayerManager } from './components/PlayerManager';
import { Scoreboard } from './components/Scoreboard';
import { Tools } from './components/Tools';
import { PartyAI } from './components/PartyAI';
import { Landing } from './components/Landing';
import { SpeedStackBlow } from './components/games/SpeedStackBlow';
import { TrophyIcon, UsersIcon, ShuffleIcon, RobotIcon, AurekaLogo } from './components/Icons';

type ViewMode = 'LANDING' | 'SETUP' | 'GAME_1' | 'APP';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SCOREBOARD);
  
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('party_players');
    return saved ? JSON.parse(saved) : [];
  });

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedPlayers = localStorage.getItem('party_players');
    return savedPlayers && JSON.parse(savedPlayers).length > 0 ? 'APP' : 'LANDING';
  });

  useEffect(() => {
    localStorage.setItem('party_players', JSON.stringify(players));
  }, [players]);

  const handleStartSetup = () => {
    setViewMode('SETUP');
  };

  const handleFinishSetup = () => {
    setViewMode('GAME_1');
  };

  const handleFinishGame1 = () => {
    setViewMode('APP');
    setActiveTab(AppTab.SCOREBOARD);
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.SCOREBOARD:
        return <Scoreboard players={players} setPlayers={setPlayers} />;
      case AppTab.PLAYERS:
        return <PlayerManager players={players} setPlayers={setPlayers} />;
      case AppTab.TOOLS:
        return <Tools players={players} />;
      case AppTab.AI_HOST:
        return <PartyAI players={players} />;
      default:
        return <Scoreboard players={players} setPlayers={setPlayers} />;
    }
  };

  // 1. Landing Screen (Full Screen Overlay)
  if (viewMode === 'LANDING') {
    return <Landing onStart={handleStartSetup} />;
  }

  // 2. Setup Screen
  if (viewMode === 'SETUP') {
    return (
      <div className="min-h-screen bg-violet-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-100 to-fuchsia-100 opacity-50 pointer-events-none"></div>
         
         <div className="w-full max-w-4xl relative z-10 flex flex-col h-[80vh]">
            <div className="text-center mb-8 flex flex-col items-center">
              <AurekaLogo className="mb-4 scale-125" />
              <h1 className="text-4xl text-violet-900 font-bold">
                Guest Check-In
              </h1>
              <p className="text-violet-500 text-lg mt-2">Let's get everyone on the list!</p>
            </div>

            <div className="flex-1 bg-white rounded-3xl shadow-2xl overflow-hidden border border-violet-100">
                <PlayerManager 
                    players={players} 
                    setPlayers={setPlayers} 
                    onComplete={handleFinishSetup}
                />
            </div>
         </div>
      </div>
    );
  }

  // 3. Game 1
  if (viewMode === 'GAME_1') {
    return (
      <div className="min-h-screen bg-violet-50 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-violet-600/10 to-transparent pointer-events-none"></div>
        <div className="pt-8 px-8 flex justify-center relative z-10">
           <AurekaLogo />
        </div>

        <main className="flex-1 w-full max-w-6xl mx-auto relative z-10 h-full p-4 flex flex-col">
            <div className="flex-1 bg-white/50 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                <SpeedStackBlow 
                    players={players} 
                    updatePlayers={setPlayers}
                    onComplete={handleFinishGame1}
                />
            </div>
        </main>
      </div>
    );
  }

  // 4. Main App Interface (Desktop Landscape Layout)
  return (
    <div className="flex h-screen bg-violet-50 overflow-hidden font-sans text-gray-900">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-violet-100 shadow-xl z-20 relative">
          <div className="p-8 flex flex-col items-center justify-center bg-violet-50/50 border-b border-violet-100">
             <AurekaLogo />
             <p className="text-violet-400 text-xs tracking-[0.2em] uppercase mt-3 font-bold">Holiday Party</p>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
             <SidebarButton 
                active={activeTab === AppTab.SCOREBOARD}
                onClick={() => setActiveTab(AppTab.SCOREBOARD)}
                icon={<TrophyIcon className="w-5 h-5" />}
                label="Scoreboard"
             />
             <SidebarButton 
                active={activeTab === AppTab.TOOLS}
                onClick={() => setActiveTab(AppTab.TOOLS)}
                icon={<ShuffleIcon className="w-5 h-5" />}
                label="Games & Teams"
             />
             <SidebarButton 
                active={activeTab === AppTab.AI_HOST}
                onClick={() => setActiveTab(AppTab.AI_HOST)}
                icon={<RobotIcon className="w-5 h-5" />}
                label="AI Host"
             />
             <SidebarButton 
                active={activeTab === AppTab.PLAYERS}
                onClick={() => setActiveTab(AppTab.PLAYERS)}
                icon={<UsersIcon className="w-5 h-5" />}
                label="Guest List"
             />
          </nav>
          
          <div className="p-4 bg-violet-50 border-t border-violet-100 text-center text-xs text-violet-400">
             Press F11 for Fullscreen
          </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-violet-600/5 to-transparent pointer-events-none"></div>

        {/* Mobile Header (Hidden on Desktop) */}
        <header className="md:hidden pt-8 pb-4 px-6 flex justify-center relative z-10">
            <AurekaLogo />
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 relative z-10 scroll-smooth">
            <div className="max-w-6xl mx-auto min-h-full">
                {renderContent()}
            </div>
        </div>

        {/* Mobile Navigation Bar (Hidden on Desktop) */}
        <nav className="md:hidden bg-white border-t border-violet-100 shadow-lg pb-safe">
            <div className="flex justify-around items-center">
            <NavButton 
                active={activeTab === AppTab.SCOREBOARD} 
                onClick={() => setActiveTab(AppTab.SCOREBOARD)}
                icon={<TrophyIcon className="w-6 h-6" />}
                label="Scores"
            />
            <NavButton 
                active={activeTab === AppTab.TOOLS} 
                onClick={() => setActiveTab(AppTab.TOOLS)}
                icon={<ShuffleIcon className="w-6 h-6" />}
                label="Games"
            />
            <NavButton 
                active={activeTab === AppTab.AI_HOST} 
                onClick={() => setActiveTab(AppTab.AI_HOST)}
                icon={<RobotIcon className="w-6 h-6" />}
                label="AI Host"
            />
            <NavButton 
                active={activeTab === AppTab.PLAYERS} 
                onClick={() => setActiveTab(AppTab.PLAYERS)}
                icon={<UsersIcon className="w-6 h-6" />}
                label="Guests"
            />
            </div>
        </nav>
      </main>
    </div>
  );
}

// Sidebar Button Helper
const SidebarButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all font-semibold ${
        active 
          ? 'bg-violet-100 text-violet-700 shadow-sm ring-1 ring-violet-200' 
          : 'text-gray-500 hover:bg-violet-50 hover:text-violet-900'
      }`}
    >
      <div className={`${active ? 'text-violet-600' : 'text-gray-400'}`}>
        {icon}
      </div>
      <span>{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-600"></div>}
    </button>
);

// Mobile Nav Button Helper
const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full py-3 transition-colors ${
      active ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
    }`}
  >
    <div className={`mb-1 transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
      {icon}
    </div>
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);