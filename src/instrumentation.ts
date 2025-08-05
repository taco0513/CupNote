export async function register() {
  // Instrumentation for monitoring and performance tracking
  // Currently disabled - Sentry removed for stability
}

export const onRequestError = async (
  err: unknown,
  request: {
    path: string
    method: string
    headers: Record<string, string | string[] | undefined>
  },
  context: {
    routerKind: 'Pages Router' | 'App Router'
    routePath: string
    routeType: 'route' | 'page' | 'middleware' | 'layout' | 'not-found' | 'loading' | 'error'
  }
) => {
  // Log errors to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Request error:', {
      error: err,
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType
    })
  }
}