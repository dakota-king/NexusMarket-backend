import { Webhook } from 'svix';
import { prisma } from '../lib/database';
import { logger } from '../lib/logger';
import { getEmailQueue } from '../lib/queue';
import { CacheService } from '../lib/redis';
export async function handleClerkWebhook(req, res) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
        logger.error('Missing CLERK_WEBHOOK_SECRET');
        res.status(500).json({ error: 'Webhook secret not configured' });
        return;
    }
    const headers = req.headers;
    const payload = JSON.stringify(req.body);
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;
    try {
        evt = wh.verify(payload, headers);
    }
    catch (err) {
        logger.error('Error verifying webhook:', err);
        res.status(400).json({ error: 'Invalid webhook signature' });
        return;
    }
    const { type, data } = evt;
    try {
        switch (type) {
            case 'user.created':
                await handleUserCreated(data);
                break;
            case 'user.updated':
                await handleUserUpdated(data);
                break;
            case 'user.deleted':
                await handleUserDeleted(data);
                break;
            case 'session.created':
                await handleSessionCreated(data);
                break;
            case 'session.ended':
                await handleSessionEnded(data);
                break;
            default:
                logger.info(`Unhandled webhook type: ${type}`);
        }
        res.status(200).json({ received: true });
    }
    catch (error) {
        logger.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function handleUserCreated(userData) {
    try {
        const user = await prisma.user.create({
            data: {
                clerkId: userData.id,
                email: userData.email_addresses[0]?.email_address || '',
                firstName: userData.first_name || '',
                lastName: userData.last_name || '',
                avatarUrl: userData.image_url,
                role: determineUserRole(userData.public_metadata),
            }
        });
        // Create customer profile if user is a customer
        if (user.role === 'CUSTOMER') {
            await prisma.customer.create({
                data: {
                    userId: user.id,
                    preferences: {},
                    totalSpent: 0,
                    loyaltyPoints: 0
                }
            });
        }
        // Send welcome email
        const emailQueue = getEmailQueue();
        if (emailQueue) {
            await emailQueue.add('welcome-email', {
                type: 'welcome-email',
                data: {
                    userId: user.id,
                    email: user.email,
                    firstName: user.firstName
                }
            });
        }
        logger.info(`User created successfully: ${user.id}`);
    }
    catch (error) {
        logger.error('Error creating user:', error);
        throw error;
    }
}
async function handleUserUpdated(userData) {
    try {
        const user = await prisma.user.update({
            where: { clerkId: userData.id },
            data: {
                email: userData.email_addresses[0]?.email_address || '',
                firstName: userData.first_name || '',
                lastName: userData.last_name || '',
                avatarUrl: userData.image_url,
                role: determineUserRole(userData.public_metadata),
                updatedAt: new Date()
            }
        });
        // Clear user cache
        await CacheService.invalidateUserCache(user.id);
        logger.info(`User updated successfully: ${user.id}`);
    }
    catch (error) {
        logger.error('Error updating user:', error);
        throw error;
    }
}
async function handleUserDeleted(userData) {
    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: userData.id }
        });
        if (user) {
            // Soft delete user
            await prisma.user.update({
                where: { id: user.id },
                data: { isActive: false }
            });
            // Clear user cache
            await CacheService.invalidateUserCache(user.id);
            logger.info(`User deactivated: ${user.id}`);
        }
    }
    catch (error) {
        logger.error('Error deactivating user:', error);
        throw error;
    }
}
async function handleSessionCreated(sessionData) {
    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: sessionData.user_id }
        });
        if (user) {
            // Update last login
            await prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() }
            });
            // Store session in cache
            await CacheService.setUserSession(sessionData.id, {
                userId: user.id,
                email: user.email,
                role: user.role
            });
            logger.info(`Session created for user: ${user.id}`);
        }
    }
    catch (error) {
        logger.error('Error handling session creation:', error);
        throw error;
    }
}
async function handleSessionEnded(sessionData) {
    try {
        // Remove session from cache
        await CacheService.removeUserSession(sessionData.id);
        logger.info(`Session ended: ${sessionData.id}`);
    }
    catch (error) {
        logger.error('Error handling session end:', error);
        throw error;
    }
}
function determineUserRole(metadata) {
    if (metadata?.role === 'VENDOR')
        return 'VENDOR';
    if (metadata?.role === 'ADMIN')
        return 'ADMIN';
    return 'CUSTOMER';
}
// Get current user profile
export async function getCurrentUser(req, res) {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                customer: true,
                vendor: true,
                addresses: true
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        logger.error('Error getting current user:', error);
        return res.status(500).json({ error: 'Failed to get user profile' });
    }
}
// Update user profile
export async function updateUserProfile(req, res) {
    try {
        const userId = req.user.id;
        const { firstName, lastName, avatarUrl } = req.body;
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                avatarUrl: avatarUrl || undefined,
                updatedAt: new Date()
            }
        });
        // Clear user cache
        await CacheService.invalidateUserCache(user.id);
        res.json({
            success: true,
            data: user,
            message: 'Profile updated successfully'
        });
    }
    catch (error) {
        logger.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
}
// Get user addresses
export async function getUserAddresses(req, res) {
    try {
        const userId = req.user.id;
        const addresses = await prisma.address.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            data: addresses
        });
    }
    catch (error) {
        logger.error('Error getting user addresses:', error);
        res.status(500).json({ error: 'Failed to get addresses' });
    }
}
// Add user address
export async function addUserAddress(req, res) {
    try {
        const userId = req.user.id;
        const addressData = req.body;
        // If this is the first address, make it default
        const existingAddresses = await prisma.address.count({
            where: { userId }
        });
        const address = await prisma.address.create({
            data: {
                ...addressData,
                userId,
                isDefault: existingAddresses === 0
            }
        });
        res.status(201).json({
            success: true,
            data: address,
            message: 'Address added successfully'
        });
    }
    catch (error) {
        logger.error('Error adding user address:', error);
        res.status(500).json({ error: 'Failed to add address' });
    }
}
// Update user address
export async function updateUserAddress(req, res) {
    try {
        const userId = req.user.id;
        const addressId = req.params.id;
        const addressData = req.body;
        const address = await prisma.address.update({
            where: {
                id: addressId,
                userId // Ensure user owns this address
            },
            data: addressData
        });
        res.json({
            success: true,
            data: address,
            message: 'Address updated successfully'
        });
    }
    catch (error) {
        logger.error('Error updating user address:', error);
        res.status(500).json({ error: 'Failed to update address' });
    }
}
// Delete user address
export async function deleteUserAddress(req, res) {
    try {
        const userId = req.user.id;
        const addressId = req.params.id;
        await prisma.address.delete({
            where: {
                id: addressId,
                userId // Ensure user owns this address
            }
        });
        res.json({
            success: true,
            message: 'Address deleted successfully'
        });
    }
    catch (error) {
        logger.error('Error deleting user address:', error);
        res.status(500).json({ error: 'Failed to delete address' });
    }
}
// Set default address
export async function setDefaultAddress(req, res) {
    try {
        const userId = req.user.id;
        const addressId = req.params.id;
        const { type } = req.body;
        // Remove default from all addresses of this type
        await prisma.address.updateMany({
            where: {
                userId,
                type
            },
            data: { isDefault: false }
        });
        // Set new default address
        const address = await prisma.address.update({
            where: {
                id: addressId,
                userId
            },
            data: { isDefault: true }
        });
        res.json({
            success: true,
            data: address,
            message: 'Default address updated successfully'
        });
    }
    catch (error) {
        logger.error('Error setting default address:', error);
        res.status(500).json({ error: 'Failed to set default address' });
    }
}
//# sourceMappingURL=auth.controller.js.map