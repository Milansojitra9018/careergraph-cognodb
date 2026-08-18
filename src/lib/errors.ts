import { NextResponse } from 'next/server';

/**
 * Maps standard application errors to user-friendly API error responses.
 * Prevents raw database issues and stack traces from being exposed to the browser.
 */
export function handleApiError(error: any) {
  console.error('[API Error Handler Log]:', error);

  let status = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected server error occurred. Please try again later.';

  if (error instanceof Error) {
    switch (error.message) {
      case 'DATABASE_CONFIG_MISSING':
        status = 500;
        code = 'DATABASE_CONFIG_MISSING';
        message = 'Database connection credentials are not configured on the server.';
        break;
      case 'DATABASE_UNAVAILABLE':
        status = 503;
        code = 'DATABASE_UNAVAILABLE';
        message = 'The career graph database is temporarily offline. Please try again in a few moments.';
        break;
      case 'DATABASE_UNAUTHORIZED':
        status = 500;
        code = 'DATABASE_AUTHENTICATION_ERROR';
        message = 'Server was unable to connect to the database due to invalid credentials.';
        break;
      case 'NOT_FOUND':
        status = 404;
        code = 'NOT_FOUND';
        message = 'The requested entity could not be found in the career directory.';
        break;
      case 'INVALID_INPUT':
        status = 400;
        code = 'INVALID_INPUT';
        message = 'The parameters provided in the request are invalid or empty.';
        break;
      case 'DATABASE_QUERY_ERROR':
        status = 500;
        code = 'DATABASE_QUERY_FAILURE';
        message = 'An error occurred while executing the graph query on CognoDB.';
        break;
    }
  }

  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status }
  );
}
