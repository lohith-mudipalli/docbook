package com.docbook.backend.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

import static com.docbook.backend.exception.ApiExceptions.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFound.class)
    public ResponseEntity<?> notFound(NotFound e) {
        return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(Forbidden.class)
    public ResponseEntity<?> forbidden(Forbidden e) {
        return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(Conflict.class)
    public ResponseEntity<?> conflict(Conflict e) {
        return ResponseEntity.status(409).body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(BadRequest.class)
    public ResponseEntity<?> badRequest(BadRequest e) {
        return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
    }
}