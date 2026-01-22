'use client';

import { useState, useCallback, useTransition } from 'react';
import { useToast } from '@/components/ui/use-toast';
import type { ActionResult } from '@/lib/server-actions';

interface UseActionOptions<TOutput> {
  onSuccess?: (data: TOutput) => void;
  onError?: (error: string) => void;
  showSuccessToast?: boolean | string;
  showErrorToast?: boolean;
}

interface UseActionReturn<TInput, TOutput> {
  execute: (input: TInput) => Promise<ActionResult<TOutput>>;
  isLoading: boolean;
  data: TOutput | undefined;
  error: string | undefined;
  reset: () => void;
}

/**
 * Hook for calling server actions with loading state and toast notifications
 */
export function useAction<TInput, TOutput>(
  action: (input: TInput) => Promise<ActionResult<TOutput>>,
  options: UseActionOptions<TOutput> = {}
): UseActionReturn<TInput, TOutput> {
  const [isPending, startTransition] = useTransition();
  const [isExecuting, setIsExecuting] = useState(false);
  const [data, setData] = useState<TOutput | undefined>();
  const [error, setError] = useState<string | undefined>();
  const { toast } = useToast();

  const execute = useCallback(
    async (input: TInput): Promise<ActionResult<TOutput>> => {
      setIsExecuting(true);
      setError(undefined);

      try {
        const result = await action(input);

        if (result.success) {
          setData(result.data);
          
          if (options.onSuccess) {
            options.onSuccess(result.data);
          }

          if (options.showSuccessToast) {
            toast({
              title: 'Success',
              description: typeof options.showSuccessToast === 'string' 
                ? options.showSuccessToast 
                : 'Operation completed successfully',
            });
          }
        } else {
          setError(result.error);
          
          if (options.onError) {
            options.onError(result.error);
          }

          if (options.showErrorToast !== false) {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: result.error,
            });
          }
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        
        if (options.onError) {
          options.onError(errorMessage);
        }

        if (options.showErrorToast !== false) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: errorMessage,
          });
        }

        return { success: false, error: errorMessage };
      } finally {
        setIsExecuting(false);
      }
    },
    [action, options, toast]
  );

  const reset = useCallback(() => {
    setData(undefined);
    setError(undefined);
  }, []);

  return {
    execute,
    isLoading: isPending || isExecuting,
    data,
    error,
    reset,
  };
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticAction<TInput, TOutput, TOptimistic = TOutput>(
  action: (input: TInput) => Promise<ActionResult<TOutput>>,
  options: UseActionOptions<TOutput> & {
    optimisticUpdate: (input: TInput, current: TOptimistic | undefined) => TOptimistic;
  }
): UseActionReturn<TInput, TOutput> & { optimisticData: TOptimistic | undefined } {
  const [optimisticData, setOptimisticData] = useState<TOptimistic | undefined>();
  
  const actionResult = useAction(action, {
    ...options,
    onSuccess: (data) => {
      setOptimisticData(undefined);
      options.onSuccess?.(data);
    },
    onError: (error) => {
      setOptimisticData(undefined);
      options.onError?.(error);
    },
  });

  const execute = useCallback(
    async (input: TInput) => {
      setOptimisticData(options.optimisticUpdate(input, optimisticData));
      return actionResult.execute(input);
    },
    [actionResult, options, optimisticData]
  );

  return {
    ...actionResult,
    execute,
    optimisticData,
  };
}

/**
 * Hook for form submission with server actions
 */
export function useFormAction<TInput, TOutput>(
  action: (input: TInput) => Promise<ActionResult<TOutput>>,
  options: UseActionOptions<TOutput> & {
    resetOnSuccess?: boolean;
  } = {}
) {
  const actionResult = useAction(action, options);

  const handleSubmit = useCallback(
    (formData: TInput) => {
      return actionResult.execute(formData);
    },
    [actionResult]
  );

  return {
    ...actionResult,
    handleSubmit,
  };
}
