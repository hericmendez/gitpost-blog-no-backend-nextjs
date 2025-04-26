import { Icon } from '@iconify/react';
import { SideNavItem } from './types';

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: "Home",
    path: "/",
    icon: <Icon icon="lucide:home" width="24" height="24" />,
  },
  {
    title: "Editor",
    path: "/editor",
    icon: <Icon icon="lucide:edit" width="24" height="24" />,
  },
  {
    title: "Posts",
    path: "/posts",
    icon: <Icon icon="lucide:edit" width="24" height="24" />,
  },
];
