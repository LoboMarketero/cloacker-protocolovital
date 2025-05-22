import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, BarChart, Globe, Tablet as DeviceTablet, Users, Shield } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import AdminMetrics from '../components/AdminMetrics';
import AdminSettings from '../components/AdminSettings';

// Tab types
type TabType = 'metrics' | 'settings';

function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('metrics');
  const [sessionTimeout, setSessionTimeout] = useState<number | null>(null);
  const navigate = useNavigate();
  const { logout } = useConfig();
  
  // Set up session timeout
  useEffect(() => {
    // Reset the timeout whenever there's user activity
    const resetTimeout = () => {
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
      
      // Set a new timeout (30 minutes)
      const timeout = window.setTimeout(() => {
        // Log out the user when the session expires
        logout();
        navigate('/admin-login');
      }, 30 * 60 * 1000);
      
      setSessionTimeout(timeout);
    };
    
    // Initial timeout
    resetTimeout();
    
    // Set up event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimeout);
    });
    
    // Clean up
    return () => {
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
      
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout);
      });
    };
  }, [sessionTimeout, logout, navigate]);
  
  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="ml-2 text-xl font-bold text-gray-900">
              Painel Administrativo | Sistema de Filtro de Tráfego
            </h1>
          </div>
          
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Sair
          </button>
        </div>
      </header>
      
      <div className="flex-grow flex">
        {/* Sidebar */}
        <nav className="bg-gray-800 w-64 flex-shrink-0">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-white">
              Controle de Tráfego
            </h2>
            <p className="mt-1 text-sm text-gray-300">
              Versão 1.0
            </p>
          </div>
          
          <div className="px-2 py-4 space-y-1">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'metrics'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <BarChart className="mr-3 h-5 w-5" />
              Métricas
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'settings'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Settings className="mr-3 h-5 w-5" />
              Configurações
            </button>
          </div>
          
          <div className="px-4 py-5 sm:px-6 border-t border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Globe className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  Status do Sistema
                </p>
                <p className="text-xs text-gray-300">
                  Ativo e monitorando
                </p>
              </div>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:px-6 border-t border-gray-700">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center">
                <DeviceTablet className="h-5 w-5 text-green-400" />
                <span className="ml-2 text-sm text-gray-300">
                  Filtros Ativos
                </span>
              </div>
              
              <div className="flex items-center">
                <Users className="h-5 w-5 text-yellow-400" />
                <span className="ml-2 text-sm text-gray-300">
                  Tráfego em Tempo Real
                </span>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {activeTab === 'metrics' && <AdminMetrics />}
              {activeTab === 'settings' && <AdminSettings />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminPage;