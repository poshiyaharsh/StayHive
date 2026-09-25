import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import APIException
from apps.core.utils import api_error

logger = logging.getLogger('apps')


def custom_exception_handler(exc, context):
    """
    Production-safe DRF exception handler.
    - Captures and logs all unhandled exceptions with context and traceback.
    - Never leaks server internals, database credentials, or stack traces to clients.
    - Formats responses in the standard StayHive API envelope:
      {
          "success": false,
          "message": "...",
          "errors": ...
      }
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    # Log the exception details internally
    view_name = context.get('view').__class__.__name__ if context.get('view') else 'UnknownView'
    request = context.get('request')
    path = request.path if request else 'UnknownPath'
    method = request.method if request else 'UnknownMethod'

    if response is None:
        # Unhandled 500 server error
        logger.error(
            f"Unhandled exception in {view_name} [{method} {path}]: {str(exc)}",
            exc_info=True
        )
        return api_error(
            message="An unexpected server error occurred. Our technical staff has been notified.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # Handled DRF exceptions (400, 401, 403, 404, 405, 429)
    logger.warning(
        f"API error in {view_name} [{method} {path}] status={response.status_code}: {str(exc)}"
    )

    # Standardize error message & details
    detail = None
    if isinstance(response.data, dict):
        detail = response.data.get('detail') or response.data.get('message')
        errors = response.data if 'detail' not in response.data else response.data.get('errors')
    elif isinstance(response.data, list):
        errors = response.data
    else:
        detail = str(response.data)
        errors = None

    msg = detail or "Request validation or processing failed."
    return api_error(
        message=str(msg),
        errors=errors,
        status_code=response.status_code
    )
