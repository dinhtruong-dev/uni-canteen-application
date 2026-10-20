export type OtpChannel = 'SMS' | 'EMAIL';

export type OtpType = 'REGISTER' | 'LOGIN' | 'FORGOT_PASSWORD' | '2FA_LOGIN';

export interface SendOtpResponse {
    success: boolean;
    message: string;
    data: {
        recipient: string;
        maskedRecipient: string;
        channel: OtpChannel;
        type: OtpType;
        expiresInSeconds: number;
        debugOtp?: string;
    };
}

export interface Initiate2faResponse {
    success: boolean;
    require2FA: boolean;
    message: string;
    data: {
        userId: string;
        email: string;
        phone: string;
        channel: OtpChannel;
        recipient: string;
        maskedRecipient: string;
        debugOtp?: string;
    };
}