"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "../trpc/client";

export default function StatusPage(){
    const ping = useQuery(trpc.health.ping.queryOptions());

    return (
        <main>
            {ping.isLoading ? (
                <p>Carregando...</p>
            ) : ping.isError ? (
                <p>Erro: {ping.error.message}</p>
            ): (
                <>
                    <p>Status: {ping.data?.status}</p>
                    <p>Timestamp: {ping.data?.timestamp.toISOString()}</p>
                </>
            )}
        </main>
    )
}