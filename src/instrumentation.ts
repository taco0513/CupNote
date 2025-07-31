export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
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
  // Sentry에서 자동으로 에러를 캐치하므로 별도 처리 불필요
}