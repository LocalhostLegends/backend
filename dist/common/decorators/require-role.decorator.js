"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireRole = void 0;
const common_1 = require("@nestjs/common");
const RequireRole = (role) => (0, common_1.SetMetadata)('role', role);
exports.RequireRole = RequireRole;
//# sourceMappingURL=require-role.decorator.js.map