export interface Login {
    email: string;
    password: string;
}

export interface Register {
    first_name?: string;
    last_name?: string;
    email: string;
    phone_number?: string;
    password: string;
    country?: string;
    state?: string;
    city?: string;
    referral_code?: string;
}

export interface UserData {
    id: number;
    first_name?: string;
    last_name?: string;
    email: string;
    phone_number?: string;
    role?: string;
    status?: string;
    referral_code?: string;
    group?: string;
    country?: string;
    state?: string;
    city?: string;
    lead_status?: string;
    notes?: string | any[];
    followup?: string;
    isActive?: number;
    isPurchasable?: number;
    isEmailVerified?: number;
    isMobileVerified?: number;
    permissionId?: number;
    planId?: number;
    broker_addon?: string;
    active_broker?: number;
    created_at?: string;
    updated_at?: string;
    [key: string]: any;
}

export interface UserDetailResponse {
    user: UserData;
    brokers?: any[];
    paymentHistory?: any[];
    plan?: any;
    settings?: any;
    [key: string]: any;
}

export interface filterTypes {
    filter?: Record<string, any>;
    page?: number;
    limit?: number;
}
