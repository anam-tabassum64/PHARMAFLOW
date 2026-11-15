from fastapi import status


class PharmaFlowException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: dict = None,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class NotFoundException(PharmaFlowException):
    def __init__(self, resource: str, identifier: str):
        super().__init__(
            message=f"{resource} with identifier '{identifier}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"resource": resource, "identifier": identifier},
        )


class InsufficientStockException(PharmaFlowException):
    def __init__(self, batch_number: str, requested: int, available: int):
        super().__init__(
            message=f"Insufficient stock for batch '{batch_number}'. Requested: {requested}, Available: {available}.",
            status_code=status.HTTP_400_BAD_REQUEST,
            details={
                "batch_number": batch_number,
                "requested": requested,
                "available": available,
            },
        )


class ExpiredBatchException(PharmaFlowException):
    def __init__(self, batch_number: str, expiry_date: str):
        super().__init__(
            message=f"Batch '{batch_number}' has expired on {expiry_date} and cannot be sold or returned to active stock.",
            status_code=status.HTTP_400_BAD_REQUEST,
            details={"batch_number": batch_number, "expiry_date": expiry_date},
        )


class ConflictException(PharmaFlowException):
    def __init__(self, message: str, details: dict = None):
        super().__init__(message=message, status_code=status.HTTP_409_CONFLICT, details=details)


class ValidationException(PharmaFlowException):
    def __init__(self, message: str, details: dict = None):
        super().__init__(message=message, status_code=status.HTTP_400_BAD_REQUEST, details=details)


class InvalidMovementException(PharmaFlowException):
    def __init__(self, message: str, details: dict = None):
        super().__init__(message=message, status_code=status.HTTP_400_BAD_REQUEST, details=details)
