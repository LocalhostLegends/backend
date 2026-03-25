export declare const ErrorMessages: {
    readonly USER_NOT_FOUND: (id: string) => string;
    readonly USER_EMAIL_EXISTS: (email: string) => string;
    readonly DEPARTMENT_NOT_FOUND: (id: string) => string;
    readonly DEPARTMENT_NAME_EXISTS: (name: string) => string;
    readonly POSITION_NOT_FOUND: (id: string) => string;
    readonly POSITION_TITLE_EXISTS: (title: string) => string;
    readonly INVALID_CREDENTIALS: "Invalid credentials";
    readonly UNAUTHORIZED: "Unauthorized access";
    readonly FORBIDDEN: "Access denied";
    readonly FORBIDDEN_RESOURCE_ACCESS: (requiredRole: string) => string;
    readonly INVALID_ID: "Invalid ID format";
    readonly INVALID_EMAIL: "Invalid email format";
    readonly INTERNAL_SERVER_ERROR: "Internal server error";
    readonly BAD_REQUEST: "Invalid request";
};
