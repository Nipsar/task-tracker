package com.example.tasktracker.domain.exception;

public class DomainException extends RuntimeException {

    private final String code; // опционально: может быть null

    public DomainException(String message) {
        super(message);
        this.code = null;
    }

    public DomainException(String code, String message) {
        super(message);
        this.code = code;
    }

    public DomainException(String code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }

    public String getCode() {
        return code;
    }

}
