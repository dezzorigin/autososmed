export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} tidak ditemukan: ${id}`, 'NOT_FOUND', 404);
  }
}

export class ValidationError extends AppError {
  constructor(public readonly errors: { field: string; message: string }[]) {
    super('Validasi gagal', 'VALIDATION_ERROR', 422);
  }
}

export function toResponse(err: unknown, requestId: string) {
  if (err instanceof AppError) {
    return Response.json(
      { title: err.code, status: err.statusCode, detail: err.message, request_id: requestId },
      { status: err.statusCode },
    );
  }
  console.error(JSON.stringify({ level: 'error', requestId, err: String(err) }));
  return Response.json(
    { title: 'Internal Error', status: 500, request_id: requestId },
    { status: 500 },
  );
}
