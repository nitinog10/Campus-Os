import { useState } from 'react';
import { useCreationEngine } from '@/hooks/useCreationEngine';
import { Header } from '@/components/Header';
import { IntentInput } from '@/components/IntentInput';
import { IntentSummary } from '@/components/IntentSummary';
import { PipelineView } from '@/components/PipelineView';
import { CreationCanvas } from '@/components/CreationCanvas';
import HistorySidebar from '@/components/HistorySidebar';
import { useNavigate } from 'react-router-dom';
import { Clock, Sparkles, Layout, Presentation, Megaphone, ArrowUpRight, Palette } from 'lucide-react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

const Index = () => {
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);
  const {
    userInput,
    setUserInput,
    intent,
    pipeline,
    assets,
    isProcessing,
    currentStep,
    error,
    startCreation,
    reset,
    // History
    history,
    activeEntryId,
    loadFromHistory,
    deleteFromHistory,
    clearHistory
  } = useCreationEngine();

  const showReset = intent !== null || assets.length > 0;

  return (
    <div className="min-h-screen relative">
      {/* Shader Gradient Background */}
      <div className="fixed inset-0 z-0">
        <ShaderGradientCanvas>
  <ShaderGradient
  animate="off"
  axesHelper="off"
  bgColor1="#000000"
  bgColor2="#000000"
  brightness={0.8}
  cAzimuthAngle={270}
  cDistance={0.5}
  cPolarAngle={180}
  cameraZoom={23.21}
  color1="#73bfc4"
  color2="#ff810a"
  color3="#8da0ce"
  destination="onCanvas"
  embedMode="off"
  envPreset="city"
  format="gif"
  fov={45}
  frameRate={10}
  gizmoHelper="hide"
  grain="on"
  lightType="env"
  pixelDensity={1}
  positionX={-0.1}
  positionY={0}
  positionZ={0}
  range="disabled"
  rangeEnd={40}
  rangeStart={27.6}
  reflection={0.4}
  rotationX={0}
  rotationY={130}
  rotationZ={70}
  shader="defaults"
  type="sphere"
  uAmplitude={3.2}
  uDensity={0.8}
  uFrequency={5.5}
  uSpeed={0.3}
  uStrength={0.3}
  uTime={27.6}
  wireframe={false}
/>
        </ShaderGradientCanvas>
      </div>

      {/* History Sidebar */}
      <HistorySidebar 
        isOpen={showHistory}
        entries={history}
        activeEntryId={activeEntryId}
        onClose={() => setShowHistory(false)}
        onSelectEntry={(entry) => {
          loadFromHistory(entry);
          setShowHistory(false);
        }}
        onDeleteEntry={deleteFromHistory}
        onClearHistory={clearHistory}
        onNewChat={() => {
          reset();
          setShowHistory(false);
        }}
      />

      {/* History Toggle Button */}
      <button
        onClick={() => setShowHistory(true)}
        className="fixed left-6 top-20 z-30 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm font-medium hover:bg-white/20 hover:text-white transition-all group"
        title="View History"
      >
        <Clock className="w-4 h-4" />
        <span className="hidden sm:inline">History</span>
        {history.length > 0 && (
          <span className="ml-1 w-5 h-5 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {history.length > 9 ? '9+' : history.length}
          </span>
        )}
      </button>

      <Header showReset={showReset} onReset={reset} />
      
      <main className="pt-24 pb-24 px-4 relative z-10">
        {/* Initial State - Hero + Intent Input */}
        {!intent && !isProcessing && (
          <section className="page-container animate-in">
            {/* Hero Section */}
            <div className="text-center mb-12 pt-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6 border border-white/20">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Creation</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-6 tracking-tight text-white">
                What would you like to{' '}
                <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-red-400 bg-clip-text text-transparent">create</span>?
              </h1>
              
              <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Describe your idea in plain language. CampusOS will understand your intent, 
                plan the workflow, and deliver ready-to-use assets.
              </p>
            </div>
            
            {/* Intent Input Card */}
            <div className="max-w-3xl mx-auto mb-16">
              <IntentInput
                value={userInput}
                onChange={setUserInput}
                onSubmit={startCreation}
                isProcessing={isProcessing}
              />
            </div>

            {/* Feature Cards */}
            <div className="stagger-children">
              <h3 className="text-center text-sm font-medium text-white/50 uppercase tracking-wider mb-6">
                Popular Templates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
                <FeatureCard
                  icon={<Megaphone className="w-5 h-5" />}
                  title="Event Promotion"
                  description="Posters, social media posts, and promotional content"
                  color="amber"
                />
                <FeatureCard
                  icon={<Layout className="w-5 h-5" />}
                  title="Landing Pages"
                  description="Simple websites for projects, clubs, and portfolios"
                  color="blue"
                />
                <FeatureCard
                  icon={<Presentation className="w-5 h-5" />}
                  title="Presentations"
                  description="Slide decks and visual content for assignments"
                  color="violet"
                  onClick={() => navigate('/presentation')}
                  isClickable={true}
                />
                <FeatureCard
                  icon={<Palette className="w-5 h-5" />}
                  title="UI Maker"
                  description="Design custom UI components and interfaces"
                  color="blue"
                  onClick={() => window.open('http://localhost:3000', '_blank')}
                  isClickable={true}
                />
              </div>
            </div>
          </section>
        )}

        {/* Processing State */}
        {isProcessing && !intent && (
          <section className="page-container">
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white animate-pulse" />
                </div>
              </div>
              <p className="mt-8 text-lg text-white/80 font-medium">
                Understanding your intent...
              </p>
              <div className="mt-4 flex gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </section>
        )}

        {/* Intent Parsed - Show Summary and Pipeline */}
        {intent && (
          <section className="page-container space-y-8 animate-in">
            <IntentSummary intent={intent} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Pipeline sidebar */}
              <div className="lg:col-span-1">
                <PipelineView pipeline={pipeline} currentStep={currentStep} />
              </div>
              
              {/* Main canvas */}
              <div className="lg:col-span-2">
                <CreationCanvas assets={assets} />
                
                {isProcessing && assets.length === 0 && pipeline && (
                  <div className="card-glass flex flex-col items-center justify-center min-h-[300px] p-8">
                    <div className="relative">
                      <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                    <p className="mt-6 text-muted-foreground font-medium">Generating assets...</p>
                    <div className="mt-3 loading-dots text-primary">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Error State */}
        {error && (
          <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto animate-slide-up z-50">
            <div className="card-base bg-destructive/10 text-destructive px-5 py-4 border-destructive/20">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-xl border-t border-white/10 py-4 z-10">
        <div className="page-container flex items-center justify-between text-xs text-white/60">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>CampusOS • AI Creation Studio</span>
          </div>
          <span className="hidden sm:inline">Built for students, by understanding</span>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'amber' | 'blue' | 'violet';
  onClick?: () => void;
  isClickable?: boolean;
}

function FeatureCard({ icon, title, description, color, onClick, isClickable }: FeatureCardProps) {
  const colorClasses = {
    amber: 'bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30',
    blue: 'bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30',
    violet: 'bg-violet-500/20 text-violet-400 group-hover:bg-violet-500/30',
  };

  return (
    <div 
      onClick={onClick}
      className={`group p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl transition-colors ${colorClasses[color]}`}>
          {icon}
        </div>
        {isClickable && (
          <ArrowUpRight className="w-5 h-5 text-white/40 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        )}
      </div>
      <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/60 leading-relaxed">{description}</p>
      {isClickable && (
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Try it now
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      )}
    </div>
  );
}

export default Index;
