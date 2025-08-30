import { Request, Response } from 'express';
export declare function handleClerkWebhook(req: Request, res: Response): Promise<void>;
export declare function getCurrentUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateUserProfile(req: Request, res: Response): Promise<void>;
export declare function getUserAddresses(req: Request, res: Response): Promise<void>;
export declare function addUserAddress(req: Request, res: Response): Promise<void>;
export declare function updateUserAddress(req: Request, res: Response): Promise<void>;
export declare function deleteUserAddress(req: Request, res: Response): Promise<void>;
export declare function setDefaultAddress(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map