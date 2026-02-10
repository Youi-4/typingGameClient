import {
  useMutation,
  useQueryClient,
  
} from "@tanstack/react-query";
import type {MutationFunction,
  UseMutationResult,
  QueryKey} from "@tanstack/react-query";
/**
 * Custom hook for performing mutations with optional query invalidation and refetch on success.
 */
export function usePostData<
  TData = unknown,
  TVariables = void,
  TError = unknown
>(
  mutationFn: MutationFunction<TData, TVariables>,
  queryKey: QueryKey,
  postActions: () => void = () => {},
  invalidate: boolean = true
): UseMutationResult<TData, TError, TVariables> {
  const queryClient = useQueryClient();

  const mutation = useMutation<TData, TError, TVariables>({
    mutationFn,
    onSuccess: () => {
      if (invalidate) {
        queryClient.invalidateQueries({ queryKey });
      }
      postActions();
    },
  });

  return mutation;
}
