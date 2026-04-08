import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  Zap, 
  MessageSquare, 
  ShieldAlert,
  Settings
} from 'lucide-react';

const Sidebar = ({ userRole }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Demand Forecast', path: '/forecast', icon: TrendingUp },
    { name: 'Optimization', path: '/optimization', icon: Zap },
    { name: 'Help Desk', path: '/tickets', icon: MessageSquare },
    { name: 'Profile Settings', path: '/profile', icon: Settings },
  ];

  if (userRole === 'admin' || userRole === 'technician') {
    navItems.push({ name: 'System Monitoring', path: '/monitoring', icon: ShieldAlert });
  }

  if (userRole === 'admin') {
    navItems.push({ name: 'Admin Settings', path: '/admin', icon: Settings });
  }

  return (
    <div className="w-64 bg-dark-900 flex flex-col h-full text-white">
      <div className="h-16 flex items-center px-6 border-b border-dark-800">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary-500 fill-primary-500" />
          <span className="text-lg font-bold tracking-tight">EnergyAI</span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary-600 text-white' 
                  : 'text-gray-300 hover:bg-dark-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-dark-800">
        <div className="bg-dark-800 rounded-lg p-3 text-xs">
          <p className="text-gray-400 font-medium">Platform Status</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-gray-300">All Systems Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
