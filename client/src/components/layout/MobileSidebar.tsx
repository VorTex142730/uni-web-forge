import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiUserGroup } from 'react-icons/hi2';
import { BsBook } from 'react-icons/bs';
import { FaRegComments } from 'react-icons/fa6';
import { RiTeamLine } from 'react-icons/ri';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export const MobileSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const sidebarItems = [
    {
      to: '/groups',
      icon: HiUserGroup,
      label: 'Groups',
    },
    {
      to: '/blog',
      icon: BsBook,
      label: 'Blog page',
    },
    {
      to: '/forums',
      icon: FaRegComments,
      label: 'Forums',
    },
    {
      to: '/members',
      icon: RiTeamLine,
      label: 'Members',
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
          </div>
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath.startsWith(item.to);
              
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}; 