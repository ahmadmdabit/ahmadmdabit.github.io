import type React from 'react';


export interface PortfolioItemType {
    id: number;
    title: string;
    description: string;
    url: string;
    image: React.ReactNode;
}
