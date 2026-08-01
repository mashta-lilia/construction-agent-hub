class EnvironmentFileError(Exception):
    """Raised while reading configuration, before the application starts.

    Domain and HTTP exception classes (`AppError` and friends, mapped to a
    consistent JSON error response per CLAUDE.md §11) belong to the
    observability ticket, not to this skeleton.
    """

    def __init__(self, message):
        self.message = message


class NoParameterError(EnvironmentFileError):
    pass


class InvalidEnvironmentError(EnvironmentFileError):
    pass
