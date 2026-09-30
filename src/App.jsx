import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Users, 
  Gift, 
  Wallet, 
  Send, 
  UserCheck, 
  Award, 
  Swords, 
  PlusCircle, 
  CheckCircle, 
  ShieldCheck, 
  Zap, 
  Copy, 
  ArrowUpRight, 
  Flame, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  Clock,
  CircleDollarSign
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('live');
  const [userCoins, setUserCoins] = useState(2500);
  const [selectedHostTarget, setSelectedHostTarget] = useState(1); // 1 for Host 1, 2 for Host 2
  
  // PK Battle State
  const [pkTimeLeft, setPkTimeLeft] = useState(180); // 3 minutes
  const [host1Points, setHost1Points] = useState(12500);
  const [host2Points, setHost2Points] = useState(9800);
  
  // Dynamic Animated Overlay State
  const [activeGiftOverlay, setActiveGiftOverlay] = useState(null);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'System', text: 'Welcome to Eagle Live! Maintain a respectful community.', isSystem: true },
    { id: 2, sender: 'Sibusiso_SZ', text: 'Host 1 is killing it with the tracks tonight! 🔥' },
    { id: 3, sender: 'Nomsa_M', text: 'DJ Eagle coming back in the PK battle! Let\'s go!' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Seller & Withdrawal State
  const [transferUserId, setTransferUserId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [sellerNotice, setSellerNotice] = useState(null);

  const [withdrawPoints, setWithdrawPoints] = useState(5000);
  const [withdrawMethod, setWithdrawMethod] = useState('MoMo');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [withdrawNotice, setWithdrawNotice] = useState(null);

  // PK Timer Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setPkTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalPkPoints = host1Points + host2Points;
  const host1Percent = totalPkPoints > 0 ? Math.round((host1Points / totalPkPoints) * 100) : 50;
  const host2Percent = 100 - host1Percent;

  const gifts = [
    { id: 'rose', name: 'Rose', cost: 10, points: 8, icon: '🌹', color: 'from-pink-500 to-rose-600' },
    { id: 'crown', name: 'Crown', cost: 100, points: 80, icon: '👑', color: 'from-amber-400 to-yellow-600' },
    { id: 'car', name: 'Sports Car', cost: 500, points: 400, icon: '🏎️', color: 'from-blue-500 to-indigo-600' },
    { id: 'eagle', name: 'Golden Eagle', cost: 1000, points: 800, icon: '🦅', color: 'from-amber-300 via-yellow-500 to-orange-600' }
  ];

  const handleSendGift = (gift) => {
    if (userCoins < gift.cost) {
      alert('Insufficient Coins balance! Please top up in the Recharge tab.');
      return;
    }

    setUserCoins((prev) => prev - gift.cost);

    if (selectedHostTarget === 1) {
      setHost1Points((prev) => prev + gift.points);
    } else {
      setHost2Points((prev) => prev + gift.points);
    }

    // Trigger Screen Overlay Animation
    setActiveGiftOverlay({
      name: gift.name,
      icon: gift.icon,
      targetHost: selectedHostTarget === 1 ? 'Sarah Live' : 'DJ Eagle',
      sender: 'You'
    });

    setTimeout(() => {
      setActiveGiftOverlay(null);
    }, 3500);

    // Add Gift announcement to chat
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'You',
        text: `sent ${gift.icon} ${gift.name} x1 to Host ${selectedHostTarget} (+${gift.points} pts)!`,
        isGift: true
      }
    ]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'You', text: inputMessage }
    ]);
    setInputMessage('');
  };

  const handleSellerTransfer = (e) => {
    e.preventDefault();
    if (!transferUserId || !transferAmount) return;
    setSellerNotice(`Successfully transferred ${transferAmount} Coins to User ID #${transferUserId}!`);
    setTransferUserId('');
    setTransferAmount('');
    setTimeout(() => setSellerNotice(null), 4000);
  };

  const handleWithdrawRequest = (e) => {
    e.preventDefault();
    if (withdrawPoints < 5000) {
      alert('Minimum withdrawal threshold is 5,000 Points (E100.00 / $5.00).');
      return;
    }
    const szlAmount = (withdrawPoints / 50).toFixed(2);
    setWithdrawNotice(
      `Payout request of E${szlAmount} (${withdrawPoints} Points) submitted! Request log sent to culturep755@gmail.com.`
    );
    setTimeout(() => setWithdrawNotice(null), 6000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans border-x border-slate-800 shadow-2xl relative overflow-hidden">
      
      {/* Top App Bar */}
      <header className="p-4 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-amber-500/20">
            🦅
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Eagle Live
            </h1>
            <span className="text-[10px] text-amber-400/80 tracking-widest uppercase font-semibold">Poppo Vibes</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60">
          <span className="text-amber-400 text-xs">🪙</span>
          <span className="font-bold text-xs text-amber-300">{userCoins.toLocaleString()}</span>
        </div>
      </header>

      {/* Main View Container */}
      <main className="flex-1 flex flex-col overflow-y-auto pb-20">
        
        {/* TAB 1: LIVE PK STREAM ARENA */}
        {activeTab === 'live' && (
          <div className="flex-1 flex flex-col">
            
            {/* Live Video Viewport (PK Mode) */}
            <div className="relative aspect-[4/3] bg-slate-900 border-b border-slate-800 overflow-hidden group">
              
              {/* PK Split Screens */}
              <div className="absolute inset-0 grid grid-cols-2">
                
                {/* Host 1 Screen */}
                <div className="relative border-r border-slate-800/80 bg-slate-900 flex flex-col justify-end p-2 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80" 
                    alt="Host 1" 
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />
                  
                  <div className="relative z-10">
                    <span className="inline-block px-2 py-0.5 bg-red-600/90 text-[10px] font-bold rounded-full mb-1">
                      HOST 1
                    </span>
                    <p className="font-bold text-sm text-white drop-shadow">Sarah Live</p>
                    <p className="text-[11px] text-amber-300 font-medium">🔥 {host1Points.toLocaleString()} pts</p>
                  </div>
                </div>

                {/* Host 2 Screen */}
                <div className="relative bg-slate-900 flex flex-col justify-end p-2 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80" 
                    alt="Host 2" 
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />
                  
                  <div className="relative z-10 text-right">
                    <span className="inline-block px-2 py-0.5 bg-blue-600/90 text-[10px] font-bold rounded-full mb-1">
                      HOST 2
                    </span>
                    <p className="font-bold text-sm text-white drop-shadow">DJ Eagle</p>
                    <p className="text-[11px] text-blue-300 font-medium">{host2Points.toLocaleString()} pts 🔥</p>
                  </div>
                </div>
              </div>

              {/* Center VS & Timer Badge */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                <div className="bg-slate-950/90 border border-amber-500/50 text-amber-400 text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur">
                  <Swords className="w-3.5 h-3.5 text-amber-400" />
                  <span>PK BATTLE</span>
                  <span className="text-slate-500">|</span>
                  <Clock className="w-3 h-3 text-red-400" />
                  <span className="text-red-400 font-mono">{formatTime(pkTimeLeft)}</span>
                </div>
              </div>

              {/* Dynamic Animated Gift Overlay FX */}
              {activeGiftOverlay && (
                <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] animate-gift-bounce">
                  <div className="text-6xl mb-2 filter drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]">
                    {activeGiftOverlay.icon}
                  </div>
                  <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-slate-950 font-black px-4 py-1.5 rounded-full text-sm shadow-xl uppercase tracking-wider">
                    {activeGiftOverlay.name} Blast!
                  </div>
                  <p className="text-xs text-white mt-1 font-semibold drop-shadow">
                    {activeGiftOverlay.sender} gifted <span className="text-amber-300">{activeGiftOverlay.targetHost}</span>
                  </p>
                </div>
              )}

              {/* Tug-Of-War Progress Bar */}
              <div className="absolute bottom-0 inset-x-0 h-3 bg-slate-950 flex border-t border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-500 flex items-center justify-start pl-1"
                  style={{ width: `${host1Percent}%` }}
                >
                  <span className="text-[9px] font-black text-white">{host1Percent}%</span>
                </div>
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500 flex items-center justify-end pr-1"
                  style={{ width: `${host2Percent}%` }}
                >
                  <span className="text-[9px] font-black text-white">{host2Percent}%</span>
                </div>
              </div>
            </div>

            {/* Room Multi-Mic Seats */}
            <div className="p-3 bg-slate-900/60 border-b border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3 h-3" /> Party Mic Seats (8/8)
                </span>
                <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  Poppo Room Style
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((seat) => (
                  <div key={seat} className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-1.5 flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 mb-1 border border-slate-600">
                      #{seat}
                    </div>
                    <span className="text-[10px] text-slate-300 truncate w-full">User_{seat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Chat Stream */}
            <div className="flex-1 p-3 flex flex-col justify-end space-y-2 min-h-[160px] max-h-[220px] overflow-y-auto">
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`text-xs p-2 rounded-lg ${
                    msg.isSystem 
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300' 
                      : msg.isGift 
                      ? 'bg-purple-900/30 border border-purple-500/40 text-purple-200' 
                      : 'bg-slate-900 border border-slate-800 text-slate-200'
                  }`}
                >
                  <span className="font-bold text-amber-400 mr-1.5">{msg.sender}:</span>
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>

            {/* Target Host Selection & Gift Panel */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Boost Target Host:</span>
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 gap-1">
                  <button
                    onClick={() => setSelectedHostTarget(1)}
                    className={`px-3 py-1 rounded text-xs font-bold transition ${
                      selectedHostTarget === 1 
                        ? 'bg-red-600 text-white shadow' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Host 1 (Sarah)
                  </button>
                  <button
                    onClick={() => setSelectedHostTarget(2)}
                    className={`px-3 py-1 rounded text-xs font-bold transition ${
                      selectedHostTarget === 2 
                        ? 'bg-blue-600 text-white shadow' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Host 2 (Eagle)
                  </button>
                </div>
              </div>

              {/* Gift Drawer Grid */}
              <div className="grid grid-cols-4 gap-2">
                {gifts.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleSendGift(g)}
                    className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-2 flex flex-col items-center transition transform active:scale-95 group relative overflow-hidden"
                  >
                    <span className="text-2xl mb-1 group-hover:scale-110 transition">{g.icon}</span>
                    <span className="text-[11px] font-bold text-slate-200">{g.name}</span>
                    <span className="text-[10px] text-amber-400 font-semibold">{g.cost} 🪙</span>
                  </button>
                ))}
              </div>

              {/* Chat Input Field */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Say something to the room..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-white"
                />
                <button 
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: RECHARGE & PACKAGES */}
        {activeTab === 'recharge' && (
          <div className="p-4 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Wallet className="text-amber-400 w-5 h-5" /> Recharge Coins
              </h2>
              <p className="text-xs text-slate-400">Top up your wallet to send gifts in room chats and PK battles.</p>
            </div>

            {/* Packages Grid */}
            <div className="space-y-3">
              {[
                { coins: 1000, priceSzl: '20.00', usd: '1.00', badge: 'Popular' },
                { coins: 3000, priceSzl: '50.00', usd: '2.50', badge: 'Best Value' },
                { coins: 5000, priceSzl: '100.00', usd: '5.00', badge: 'Pro Host' }
              ].map((pkg, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex justify-between items-center relative overflow-hidden">
                  <div>
                    <span className="text-xs font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                      {pkg.badge}
                    </span>
                    <div className="text-xl font-black text-amber-400 mt-1">
                      {pkg.coins.toLocaleString()} <span className="text-xs text-slate-300 font-normal">Coins</span>
                    </div>
                    <span className="text-xs text-slate-400">Equivalent to ${pkg.usd} USD</span>
                  </div>
                  <button className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black px-4 py-2 rounded-lg text-xs hover:opacity-90 transition shadow-lg shadow-amber-500/10">
                    E{pkg.priceSzl} SZL
                  </button>
                </div>
              ))}
            </div>

            {/* Payment Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Approved Payment Portals
              </h3>
              <div className="text-xs space-y-2 text-slate-400">
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <p className="font-bold text-slate-200">MTN Mobile Money / MoMo</p>
                  <p className="text-[11px] text-slate-400">Send to official agent portal or contact Sole Seller.</p>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <p className="font-bold text-slate-200">USDT (TRC20)</p>
                  <p className="text-[10px] font-mono text-amber-400 truncate">TFFYftp65k6nL8Q2yZLZeTPMUAer2mK57F</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SOLE SELLER AGENCY PANEL */}
        {activeTab === 'seller' && (
          <div className="p-4 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="text-amber-400 w-5 h-5" /> Sole Seller Coin Agency
              </h2>
              <p className="text-xs text-slate-400">Official coin distribution panel managed by CultureP.</p>
            </div>

            {sellerNotice && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{sellerNotice}</span>
              </div>
            )}

            <form onSubmit={handleSellerTransfer} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Direct Coin Transfer</h3>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target User ID</label>
                <input 
                  type="text" 
                  value={transferUserId}
                  onChange={(e) => setTransferUserId(e.target.value)}
                  placeholder="e.g. 1002"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Coins Amount</label>
                <input 
                  type="number" 
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-white"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition shadow-lg shadow-amber-500/10"
              >
                Transfer Coins Now
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: AGENCY WITHDRAWAL (80/20 REVENUE SPLIT) */}
        {activeTab === 'withdraw' && (
          <div className="p-4 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-amber-400 w-5 h-5" /> Host Cash Out
              </h2>
              <p className="text-xs text-slate-400">Convert your earned Points into local currency payout.</p>
            </div>

            {/* Split Breakdown Badge */}
            <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-3 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-amber-400">80/20 Revenue Model</p>
                <p className="text-[11px] text-slate-400">Host keeps 80% points value; 20% platform share.</p>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30">
                80% Earnings
              </span>
            </div>

            {withdrawNotice && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{withdrawNotice}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawRequest} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Points to Cash Out (Min 5,000)</label>
                <input 
                  type="number" 
                  value={withdrawPoints}
                  onChange={(e) => setWithdrawPoints(Number(e.target.value))}
                  min="5000"
                  step="500"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-white font-mono"
                  required
                />
                <p className="text-[11px] text-amber-400 mt-1">
                  Payout Value: <span className="font-bold">E{(withdrawPoints / 50).toFixed(2)} SZL</span> (${(withdrawPoints / 1000).toFixed(2)} USD)
                </p>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Payout Gateway</label>
                <select 
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-white"
                >
                  <option value="MoMo">MTN Mobile Money (MoMo)</option>
                  <option value="USDT">USDT Wallet (TRC20)</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Account / Phone Details</label>
                <input 
                  type="text" 
                  value={withdrawDetails}
                  onChange={(e) => setWithdrawDetails(e.target.value)}
                  placeholder="e.g. +268 7612 3456"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-white"
                  required
                />
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                Payout requests are logged and routed directly to: <span className="text-amber-300 font-mono">culturep755@gmail.com</span>
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition shadow-lg shadow-emerald-500/10"
              >
                Submit Cash Out Request
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="absolute bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 grid grid-cols-4 z-40">
        {[
          { id: 'live', label: 'PK Live', icon: Tv },
          { id: 'recharge', label: 'Recharge', icon: Wallet },
          { id: 'seller', label: 'Seller Panel', icon: Zap },
          { id: 'withdraw', label: 'Withdraw', icon: CircleDollarSign }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 flex flex-col items-center justify-center transition ${
                isActive ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}