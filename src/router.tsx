import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { ConvexProvider } from "convex/react";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const CONVEX_URL: string | undefined = import.meta.env.VITE_CONVEX_URL;

	if (!CONVEX_URL) {
		throw new Error("missing envar VITE_CONVEX_URL");
	}

	const convexQueryClient = new ConvexQueryClient(CONVEX_URL);

	const queryClient: QueryClient = new QueryClient({
		defaultOptions: {
			queries: {
				queryKeyHashFn: convexQueryClient.hashFn(),
				queryFn: convexQueryClient.queryFn(),
			},
		},
	});
	convexQueryClient.connect(queryClient);

	const router = routerWithQueryClient(
		createRouter({
			routeTree,
			defaultPreload: "intent",
			context: { queryClient },
			scrollRestoration: true,
			Wrap: ({ children }) => (
				<ConvexProvider client={convexQueryClient.convexClient}>
					<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
					<ReactQueryDevtools initialIsOpen={false} />
				</ConvexProvider>
			),
		}),
		queryClient,
	);

	return router;
}
