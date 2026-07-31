class EnvironmentFileError(Exception):
    def __init__(self, message):
        self.message = message


class NoParameterError(EnvironmentFileError):
    pass


class InvalidEnvironmentError(EnvironmentFileError):
    pass


class AppError(Exception):
    """Base for domain/HTTP errors — caught by main.py's global exception
    handler and turned into a consistent JSON error response (CLAUDE.md §11).
    """

    status_code: int = 500
    code: str = "internal_error"

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class NotFoundError(AppError):
    status_code = 404
    code = "not_found"


class UnauthorizedError(AppError):
    status_code = 401
    code = "unauthorized"


class ForbiddenError(AppError):
    status_code = 403
    code = "forbidden"


class ValidationAppError(AppError):
    status_code = 422
    code = "validation_error"
