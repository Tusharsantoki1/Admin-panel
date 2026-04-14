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
}

export interface filterTypes {
    filter?: Record<string, any>;
    page?: number;
    limit?: number;
}
