import React from 'react';
import { Icon, IconifyIcon } from '@iconify/react';
import pieChart2Fill from '@iconify/icons-eva/pie-chart-2-fill';
import peopleFill from '@iconify/icons-eva/people-fill';
import shoppingBagFill from '@iconify/icons-eva/shopping-bag-fill';
import { NavItemConfig } from '@/models';

const getIcon = (name: string | IconifyIcon) => <Icon icon={name} width={22} height={22} />;

const sidebarConfig: NavItemConfig[] = [
    {
        title: 'dashboard',
        path: '/dashboard/app',
        icon: getIcon(pieChart2Fill)
    },
    {
        title: 'user',
        path: '/dashboard/user',
        icon: getIcon(peopleFill)
    },
    {
        title: 'product',
        path: '/dashboard/products',
        icon: getIcon(shoppingBagFill)
    }
];

export default sidebarConfig;
