import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import type { AppRouter } from '../../server/_app';
import superjson from 'superjson';
 
export const queryClient = new QueryClient();
 
const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ 
    url: '/api/trpc' ,
    transformer: superjson
  })],
});
 
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});

