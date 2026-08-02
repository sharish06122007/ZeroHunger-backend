// routes/auth.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const {
  register, verifyEmail, resendOtp, login, refreshToken, logout,
  forgotPassword, verifyOtp, resetPassword,
  getProfile, updateProfile, changePassword,
} = require('../controllers/authController');
const {
  registerValidator, loginValidator, forgotPasswordValidator,
  verifyOtpValidator, resetPasswordValidator, changePasswordValidator,
} = require('../validators/authValidator');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();

router.use(rateLimiter.auth);

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user or organization
 *     description: Creates a new user profile with selected role (restaurant, donor, ngo, volunteer, admin) and triggers email verification OTP.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User created successfully. Verification OTP dispatched.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JWTResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: User already exists with this email address
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/register', registerValidator, validate, asyncHandler(register));

/**
 * @openapi
 * /api/v1/auth/verify-email:
 *   post:
 *     summary: Verify account via 6-digit OTP code
 *     description: Validates the 6-digit OTP sent to the user's registered email address to activate their account.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string, format: email, example: 'sarah.c@sheltercare.org' }
 *               otp: { type: string, example: '482901' }
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: Email verified successfully. You may now log in.
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/verify-email', asyncHandler(verifyEmail));

/**
 * @openapi
 * /api/v1/auth/resend-otp:
 *   post:
 *     summary: Resend email verification OTP
 *     description: Dispatches a fresh 6-digit OTP verification code to the registered email address.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: 'sarah.c@sheltercare.org' }
 *     responses:
 *       200:
 *         description: New OTP code generated and sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/resend-otp', asyncHandler(resendOtp));

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate user & issue JWT tokens
 *     description: Authenticates user credentials and returns a Bearer JWT access token and session cookie.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful. JWT token returned.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JWTResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Invalid email or password
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/login', loginValidator, validate, asyncHandler(login));

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Exchange a valid refresh token for a new Bearer JWT access token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Token refreshed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JWTResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/refresh', asyncHandler(refreshToken));

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: Terminate session & invalidate token
 *     description: Clears HTTP-only session cookies and revokes refresh tokens.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Logged out successfully
 */
router.post('/logout', asyncHandler(logout));

/**
 * @openapi
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     description: Sends a password recovery OTP code to the requested registered email address.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: 'jane.doe@grandhyatt.com' }
 *     responses:
 *       200:
 *         description: Password reset OTP dispatched
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/forgot-password', forgotPasswordValidator, validate, asyncHandler(forgotPassword));

/**
 * @openapi
 * /api/v1/auth/verify-otp:
 *   post:
 *     summary: Verify password recovery OTP
 *     description: Validates the password reset OTP code before allowing password updates.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string, format: email, example: 'jane.doe@grandhyatt.com' }
 *               otp: { type: string, example: '918234' }
 *     responses:
 *       200:
 *         description: OTP verified
 */
router.post('/verify-otp', verifyOtpValidator, validate, asyncHandler(verifyOtp));

/**
 * @openapi
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password with verified OTP
 *     description: Resets the account password using the verified OTP code.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, newPassword]
 *             properties:
 *               email: { type: string, format: email, example: 'jane.doe@grandhyatt.com' }
 *               otp: { type: string, example: '918234' }
 *               newPassword: { type: string, format: password, example: 'NewSecurePass2026!' }
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post('/reset-password', resetPasswordValidator, validate, asyncHandler(resetPassword));

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     description: Returns the user object of the currently authenticated Bearer token.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   put:
 *     summary: Update profile details
 *     description: Update city, address, organization name, phone, or bio for the authenticated user.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               phone: { type: string }
 *               city: { type: string }
 *               organizationName: { type: string }
 *               address: { type: string }
 *               bio: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', protect, asyncHandler(getProfile));
router.put('/me', protect, asyncHandler(updateProfile));

/**
 * @openapi
 * /api/v1/auth/me/password:
 *   put:
 *     summary: Change current password
 *     description: Change account password by providing current password and new password.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string, format: password }
 *               newPassword: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/me/password', protect, changePasswordValidator, validate, asyncHandler(changePassword));

module.exports = router;
