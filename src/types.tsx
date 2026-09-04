import { ComponentType } from 'react';

export interface NavItem {
    title: string;
    path: string;
    icon: ComponentType<{ className?: string }>;
    disabled?: boolean;
}

export interface SidebarProps {
    isInitiallyCollapsed?: boolean;
}