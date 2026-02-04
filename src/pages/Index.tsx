import { useCreationEngine } from '@/hooks/useCreationEngine';
import { Header } from '@/components/Header';
import { IntentInput } from '@/components/IntentInput';
import { IntentSummary } from '@/components/IntentSummary';
import { PipelineView } from '@/components/PipelineView';
import { CreationCanvas } from '@/components/CreationCanvas';

const Index = () => {
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
    reset
  } = useCreationEngine();

  const showReset = intent !== null || assets.length > 0;

  return (
    <div className="min-h-screen creation-canvas">
      <Header showReset={showReset} onReset={reset} />
      
      <main className="pt-24 pb-16 px-4">
        {/* Initial State - Intent Input */}
        {!intent && !isProcessing && (
          <section className="container max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
                What do you want to <span className="gradient-text">create</span>?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Describe your idea in plain language. CAMPUSOS will figure out what to build, 
                how to build it, and deliver ready-to-use assets.
              </p>
            </div>
            
            <IntentInput
              value={userInput}
              onChange={setUserInput}
              onSubmit={startCreation}
              isProcessing={isProcessing}
            />

            {/* Feature highlights */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <FeatureCard
                title="Event Promotion"
                description="Posters, social media posts, and promotional content"
              />
              <FeatureCard
                title="Landing Pages"
                description="Simple websites for projects, clubs, and portfolios"
              />
              <FeatureCard
                title="Presentations"
                description="Slide decks and visual content for assignments"
              />
            </div>
          </section>
        )}

        {/* Processing State */}
        {isProcessing && !intent && (
          <section className="container max-w-6xl mx-auto">
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="mt-6 text-muted-foreground">Understanding your intent...</p>
            </div>
          </section>
        )}

        {/* Intent Parsed - Show Summary and Pipeline */}
        {intent && (
          <section className="container max-w-6xl mx-auto space-y-8">
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
                  <div className="flex flex-col items-center justify-center min-h-[300px] bg-card rounded-2xl border border-border/50">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="mt-4 text-muted-foreground">Generating assets...</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Error State */}
        {error && (
          <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-destructive/10 text-destructive px-4 py-3 rounded-xl border border-destructive/20">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border/50 py-3">
        <div className="container max-w-6xl mx-auto px-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>CAMPUSOS • Intent-driven AI orchestration</span>
          <span>Built for students, by understanding</span>
        </div>
      </footer>
    </div>
  );
};

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-soft hover-lift">
      <h3 className="font-display font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default Index;
