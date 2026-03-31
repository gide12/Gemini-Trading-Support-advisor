import React, { useState } from "react";
import { User, Target, ShieldAlert, ArrowRight, Check, Activity } from "lucide-react";

interface OnboardingWizardProps {
  onComplete: (data: { age: string; goals: string[]; risk: string }) => void;
}

const GOALS = [
  "Retirement Planning",
  "Wealth Preservation",
  "Buying a Home",
  "Aggressive Growth",
  "Yield Generation",
  "Speculation"
];

const RISKS = [
  { id: "Conservative", desc: "Capital preservation over growth. Low volatility." },
  { id: "Moderate", desc: "Balanced approach. Moderate growth and volatility." },
  { id: "Aggressive", desc: "Maximum growth. High tolerance for drawdowns." }
];

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState<string>("");
  const [goals, setGoals] = useState<string[]>([]);
  const [risk, setRisk] = useState<string>("");

  const handleGoalToggle = (goal: string) => {
    setGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleNext = () => {
    if (step === 1 && !age) return;
    if (step === 2 && goals.length === 0) return;
    if (step === 3 && !risk) return;

    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete({ age, goals, risk });
    }
  };

  return (
    <div className="min-h-screen bg-[#02040a] flex items-center justify-center p-6 font-sans text-slate-200 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-2xl bg-[#0f172a]/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header / Progress */}
        <div className="px-8 py-6 border-b border-slate-800 bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-cyan-500" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-500">Client Profiling</h2>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-cyan-500 shadow-[0_0_8px_#0ea5e9]' : i < step ? 'w-4 bg-cyan-800' : 'w-4 bg-slate-800'}`} />
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 md:p-12 flex-1 min-h-[400px] flex flex-col justify-center">
          {step === 1 && (
            <div className="animate-fade-in space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <User className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Demographic Data</h3>
                  <p className="text-slate-400 text-sm mt-1">Please enter your current age to calibrate time horizon.</p>
                </div>
              </div>
              
              <div className="relative max-w-xs">
                <input 
                  type="number" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 35"
                  className="w-full bg-[#0B1221] border border-slate-700 text-white text-2xl font-mono p-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold uppercase tracking-wider text-sm">Years</span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Target className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Investment Objectives</h3>
                  <p className="text-slate-400 text-sm mt-1">Select all primary goals for this portfolio.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GOALS.map(goal => {
                  const isSelected = goals.includes(goal);
                  return (
                    <button
                      key={goal}
                      onClick={() => handleGoalToggle(goal)}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group ${isSelected ? 'bg-purple-500/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-[#0B1221] border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'}`}
                    >
                      <span className={`font-medium ${isSelected ? 'text-purple-300' : 'text-slate-300 group-hover:text-white'}`}>{goal}</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-purple-400 bg-purple-500/30' : 'border-slate-600'}`}>
                        {isSelected && <Check className="w-3 h-3 text-purple-300" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <ShieldAlert className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Risk Parameters</h3>
                  <p className="text-slate-400 text-sm mt-1">Define your maximum drawdown tolerance.</p>
                </div>
              </div>

              <div className="space-y-4">
                {RISKS.map(r => {
                  const isSelected = risk === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setRisk(r.id)}
                      className={`w-full p-5 rounded-xl border text-left transition-all duration-200 flex items-center gap-4 group ${isSelected ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-[#0B1221] border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'}`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-emerald-400 bg-emerald-500/30' : 'border-slate-600'}`}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />}
                      </div>
                      <div>
                        <h4 className={`text-lg font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-200 group-hover:text-white'}`}>{r.id}</h4>
                        <p className="text-sm text-slate-400 mt-1">{r.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer / Actions */}
        <div className="px-8 py-6 border-t border-slate-800 bg-black/20 flex justify-between items-center">
          <button 
            onClick={() => setStep(Math.max(1, step - 1))}
            className={`text-sm font-bold uppercase tracking-wider text-slate-500 hover:text-white transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            Back
          </button>
          
          <button 
            onClick={handleNext}
            disabled={(step === 1 && !age) || (step === 2 && goals.length === 0) || (step === 3 && !risk)}
            className="flex items-center gap-2 px-8 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-bold uppercase tracking-wider rounded-full transition-all"
          >
            {step === 3 ? 'Initialize Terminal' : 'Continue'}
            {step < 3 && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
