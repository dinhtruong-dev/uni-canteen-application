// src/types/otp.types.ts
export type OtpChannel = 'SMS' | 'EMAIL';

export type OtpType = 'REGISTER' | 'LOGIN' | 'FORGOT_PASSWORD' | '2FA_LOGIN';

export interface OtpRecord {
    recipient: string;
    code: string;
    channel: OtpChannel;
    type: OtpType;
    expiresAt: number;
    attempts: number;
    lastSentAt: number;
    verified: boolean;
}

export interface SendOtpResult {
    success: boolean;
    message: string;
    recipient: string;
    maskedRecipient: string;
    channel: OtpChannel;
    type: OtpType;
    expiresInSeconds: number;
    debugOtp?: string;
}

export interface SendOtpParams {
    recipient: string;
    channel: OtpChannel;
    type: OtpType;
}

export interface VerifyOtpParams {
    recipient: string;
    code: string;
    type: OtpType;
}

export interface VerifyOtpResult {
    valid: boolean;
    message: string;
}