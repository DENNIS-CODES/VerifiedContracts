import { Profile } from "./profile";

export interface Token {
    name: string;
    address: string;
    compiler?: string;
    version?: string;
    balance?: string;
    txns: string;
    setting?: string;
    dateVerified: string;
    audited?: string;
    licence: string;
    is_tradable?: boolean;
    has_launched?: boolean;
    profile?: Profile;
}