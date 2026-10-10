package com.example.contacts.common;

import java.util.Map;

public record ApiError(int status, String message, Map<String, String> errors) {
}
