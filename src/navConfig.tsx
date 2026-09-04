import { NavItem } from './types';
import { BicepsFlexed, Dumbbell, Scale } from 'lucide-react';

export const sidebarNavItems: NavItem[] = [
    {
        title: 'Exercises',
        path: '/exercises',
        icon: BicepsFlexed,
    },
    {
        title: 'Sets',
        path: '/sets',
        icon: Dumbbell,
    },
    {
        title: '1RM Calculations',
        path: '/epley',
        icon: Scale,
    }
];