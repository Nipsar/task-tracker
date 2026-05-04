package com.example.tasktracker.domain.exception;

public class NotFoundException extends DomainException {


    public static final String DEFAULT_CODE = "NOT_FOUND";

    public NotFoundException(String message) {
        super(DEFAULT_CODE, message);
    }

    public NotFoundException(String code, String message) {
        super(code, message);
    }

    public NotFoundException(String code, String message, Throwable cause) {
        super(code, message, cause);
    }
}
