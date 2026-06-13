import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

function NotFound() {
  const error = useRouteError();
  const isDev = import.meta.env.DEV;

  let message = 'Something went wrong.';
  let status: number | undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    message = error.statusText;
  }

  return (
    <div>
      <h1>{status ?? 404}</h1>
      <p>{message}</p>

      {isDev && (
        <details style={{ marginTop: '1rem' }}>
          <summary>Debug info</summary>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}

export default NotFound;
