from rest_framework.response import Response
from rest_framework import status


def api_response(success=True, message="", data=None, errors=None, status_code=status.HTTP_200_OK):
    """
    Standard StayHive API response structure:
    {
        "success": true,
        "message": "...",
        "data": {...}
    }
    """
    payload = {
        "success": success,
        "message": message,
    }
    if data is not None:
        payload["data"] = data
    if errors is not None:
        payload["errors"] = errors
    return Response(payload, status=status_code)


def api_error(message="Operation failed", errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    return api_response(success=False, message=message, errors=errors, status_code=status_code)
