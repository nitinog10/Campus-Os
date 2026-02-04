import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ParsedIntent, Pipeline, GeneratedAsset, PipelineStep } from '@/types/campusos';
import { toast } from 'sonner';

interface UseCreationEngineReturn {
  userInput: string;
  setUserInput: (input: string) => void;
  intent: ParsedIntent | null;
  pipeline: Pipeline | null;
  assets: GeneratedAsset[];
  isProcessing: boolean;
  currentStep: string | null;
  error: string | null;
  startCreation: () => Promise<void>;
  reset: () => void;
}

export function useCreationEngine(): UseCreationEngineReturn {
  const [userInput, setUserInput] = useState('');
  const [intent, setIntent] = useState<ParsedIntent | null>(null);
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setUserInput('');
    setIntent(null);
    setPipeline(null);
    setAssets([]);
    setIsProcessing(false);
    setCurrentStep(null);
    setError(null);
  }, []);

  const startCreation = useCallback(async () => {
    if (!userInput.trim()) {
      toast.error('Please describe what you want to create');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setAssets([]);

    try {
      // Step 1: Interpret Intent
      setCurrentStep('interpreting');
      toast.info('Understanding your intent...');

      const { data: intentData, error: intentError } = await supabase.functions.invoke('interpret-intent', {
        body: { userInput }
      });

      if (intentError) throw new Error(intentError.message);
      if (intentData.error) throw new Error(intentData.error);

      const parsedIntent = intentData.intent as ParsedIntent;
      setIntent(parsedIntent);
      toast.success(`Understood: ${parsedIntent.type.replace('_', ' ')}`);

      // Step 2: Generate Pipeline
      setCurrentStep('planning');
      toast.info('Planning the creation pipeline...');

      const { data: pipelineData, error: pipelineError } = await supabase.functions.invoke('generate-pipeline', {
        body: { intent: parsedIntent }
      });

      if (pipelineError) throw new Error(pipelineError.message);
      if (pipelineData.error) throw new Error(pipelineData.error);

      const generatedPipeline = pipelineData.pipeline as Pipeline;
      setPipeline(generatedPipeline);
      toast.success(`Pipeline ready: ${generatedPipeline.steps.length} steps`);

      // Step 3: Execute Pipeline Steps
      const generatedAssets: GeneratedAsset[] = [];

      for (let i = 0; i < generatedPipeline.steps.length; i++) {
        const step = generatedPipeline.steps[i];
        setCurrentStep(step.id);

        // Update step status to processing
        setPipeline(prev => prev ? {
          ...prev,
          steps: prev.steps.map((s, idx) => 
            idx === i ? { ...s, status: 'processing' as const } : s
          )
        } : null);

        toast.info(`Generating: ${step.name}`);

        const { data: assetData, error: assetError } = await supabase.functions.invoke('generate-asset', {
          body: { 
            step, 
            intent: parsedIntent,
            previousOutputs: generatedAssets
          }
        });

        if (assetError) {
          // Mark step as error but continue
          setPipeline(prev => prev ? {
            ...prev,
            steps: prev.steps.map((s, idx) => 
              idx === i ? { ...s, status: 'error' as const } : s
            )
          } : null);
          console.error(`Step ${step.name} failed:`, assetError);
          continue;
        }

        if (assetData.error) {
          setPipeline(prev => prev ? {
            ...prev,
            steps: prev.steps.map((s, idx) => 
              idx === i ? { ...s, status: 'error' as const } : s
            )
          } : null);
          console.error(`Step ${step.name} failed:`, assetData.error);
          continue;
        }

        const asset = assetData.asset as GeneratedAsset;
        generatedAssets.push(asset);
        setAssets([...generatedAssets]);

        // Update step status to complete
        setPipeline(prev => prev ? {
          ...prev,
          steps: prev.steps.map((s, idx) => 
            idx === i ? { ...s, status: 'complete' as const, output: asset } : s
          )
        } : null);
      }

      // Mark pipeline as complete
      setPipeline(prev => prev ? { ...prev, status: 'complete' } : null);
      setCurrentStep(null);
      toast.success('Creation complete!');

    } catch (err) {
      console.error('Creation engine error:', err);
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  }, [userInput]);

  return {
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
  };
}
