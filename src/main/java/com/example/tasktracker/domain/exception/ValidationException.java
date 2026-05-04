package com.example.tasktracker.domain.exception;

public class ValidationException extends DomainException {

    public static final String DEFAULT_CODE = "VALIDATION";

    public ValidationException(String message) {
        super(DEFAULT_CODE, message);
    }

    public ValidationException(String code, String message) {
        super(code, message);
    }

    public ValidationException(String code, String message, Throwable cause) {
        super(code, message, cause);
    }
}
