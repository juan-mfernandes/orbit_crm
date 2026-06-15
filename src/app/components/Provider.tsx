"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/app/trpc/client";

type ProviderProps = {
    children: React.ReactNode
}

export function Provider( {children}: ProviderProps ) {
    return (
        <QueryClientProvider client={queryClient}>
            { children }
        </QueryClientProvider>
    )
}