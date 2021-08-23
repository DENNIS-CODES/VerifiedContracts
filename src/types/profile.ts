export interface Profile {
    telegram?: string[] | string;
    website?: string[] | string;
    twitter?: string[] | string;
    liquidity_functions?: string[] | string;
    sell_functions?: string[] | string;
    buy_functions?: string[] | string;
    cooldown?: boolean;
    bots?: boolean;
    openzeppelin?: boolean;
    est_launch_date?: Date;
    require_amount?: boolean;

}