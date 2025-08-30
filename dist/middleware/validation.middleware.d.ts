import { Request, Response, NextFunction } from 'express';
export declare const validateRequest: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateObjectId: (paramName: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateEmail: (fieldName: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validatePhoneNumber: (fieldName: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateUrl: (fieldName: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateDate: (fieldName: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateNumericRange: (fieldName: string, min: number, max: number) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateArrayLength: (fieldName: string, minLength: number, maxLength: number) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateFileSize: (fieldName: string, maxSizeBytes: number) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateFileType: (fieldName: string, allowedTypes: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const sanitizeInput: (_req: Request, _res: Response, next: NextFunction) => void;
export declare const validateBusinessRules: (rules: Array<(req: Request) => string | null>) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateRateLimit: () => (_req: Request, _res: Response, next: NextFunction) => void;
export default validateRequest;
//# sourceMappingURL=validation.middleware.d.ts.map