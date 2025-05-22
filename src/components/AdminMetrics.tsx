import React, { useState, useEffect } from 'react';
import { AlertTriangle, UserCheck, UserX, Map } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { calculateRiskScore } from '../utils/trafficFilters';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

function AdminMetrics() {
  const [metrics, setMetrics] = useState({
    totalVisitors: 0,
    approvedTraffic: 0,
    blockedTraffic: 0,
    riskScores: [],
    visitorsData: [],
    approvedData: [],
    blockedLocations: [],
    blockedUserAgents: []
  });
  
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  
  useEffect(() => {
    // Get stored metrics from localStorage
    const storedMetrics = localStorage.getItem('trafficMetrics');
    const initialMetrics = storedMetrics ? JSON.parse(storedMetrics) : {
      totalVisitors: 0,
      approvedTraffic: 0,
      blockedTraffic: 0,
      riskScores: [],
      visitorsData: Array(7).fill(0),
      approvedData: Array(7).fill(0),
      blockedLocations: [],
      blockedUserAgents: []
    };

    setMetrics(initialMetrics);

    // Update metrics with current visit
    const updateMetrics = async () => {
      const { score, details } = await calculateRiskScore();
      const userAgent = navigator.userAgent;
      
      const newMetrics = {
        ...initialMetrics,
        totalVisitors: initialMetrics.totalVisitors + 1,
        approvedTraffic: score < 6 ? initialMetrics.approvedTraffic + 1 : initialMetrics.approvedTraffic,
        blockedTraffic: score >= 6 ? initialMetrics.blockedTraffic + 1 : initialMetrics.blockedTraffic,
        riskScores: [...initialMetrics.riskScores, score],
        visitorsData: [...initialMetrics.visitorsData.slice(1), initialMetrics.totalVisitors + 1],
        approvedData: [...initialMetrics.approvedData.slice(1), initialMetrics.approvedTraffic + (score < 6 ? 1 : 0)],
        blockedLocations: details.country ? 
          [...initialMetrics.blockedLocations, { name: 'Unknown', count: 1 }] : 
          initialMetrics.blockedLocations,
        blockedUserAgents: details.suspiciousUA ? 
          [...initialMetrics.blockedUserAgents, { name: userAgent.substring(0, 50), count: 1 }] : 
          initialMetrics.blockedUserAgents
      };

      setMetrics(newMetrics);
      localStorage.setItem('trafficMetrics', JSON.stringify(newMetrics));
    };

    updateMetrics();
  }, [timeRange]);

  // Prepare chart data
  const trafficData = {
    labels: ['Aprovado', 'Bloqueado'],
    datasets: [
      {
        data: [metrics.approvedTraffic, metrics.blockedTraffic],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#10B981', '#EF4444'],
        borderWidth: 1,
      },
    ],
  };

  const riskScoreData = {
    labels: ['1-3', '4-6', '7-8', '9+'],
    datasets: [
      {
        data: [
          metrics.riskScores.filter(score => score >= 1 && score <= 3).length,
          metrics.riskScores.filter(score => score >= 4 && score <= 6).length,
          metrics.riskScores.filter(score => score >= 7 && score <= 8).length,
          metrics.riskScores.filter(score => score >= 9).length,
        ],
        backgroundColor: ['#10B981', '#FBBF24', '#F97316', '#EF4444'],
        borderColor: ['#10B981', '#FBBF24', '#F97316', '#EF4444'],
        borderWidth: 1,
      },
    ],
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toLocaleDateString();
  }).reverse();

  const visitorsLineData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Total de Visitantes',
        data: metrics.visitorsData,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Tráfego Aprovado',
        data: metrics.approvedData,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Métricas de Tráfego
        </h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              timeRange === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              timeRange === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              timeRange === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Mês
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Visitantes
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metrics.totalVisitors.toLocaleString()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tráfego Aprovado
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metrics.approvedTraffic.toLocaleString()} 
                      <span className="text-sm text-gray-500 ml-1">
                        ({Math.round((metrics.approvedTraffic / metrics.totalVisitors) * 100)}%)
                      </span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tráfego Bloqueado
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metrics.blockedTraffic.toLocaleString()}
                      <span className="text-sm text-gray-500 ml-1">
                        ({Math.round((metrics.blockedTraffic / metrics.totalVisitors) * 100)}%)
                      </span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Distribuição de Tráfego
          </h2>
          <div className="h-64">
            <Pie data={trafficData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Distribuição de Scores de Risco
          </h2>
          <div className="h-64">
            <Pie data={riskScoreData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Visitantes nos Últimos 7 Dias
        </h2>
        <div className="h-80">
          <Line 
            data={visitorsLineData} 
            options={{ 
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center">
              <Map className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Top Localizações Bloqueadas
              </h3>
            </div>
          </div>
          <ul className="divide-y divide-gray-200">
            {metrics.blockedLocations.map((location, index) => (
              <li key={index} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {location.name}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      {location.count} bloqueios
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Top User-Agents Bloqueados
              </h3>
            </div>
          </div>
          <ul className="divide-y divide-gray-200">
            {metrics.blockedUserAgents.map((agent, index) => (
              <li key={index} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {agent.name}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      {agent.count} bloqueios
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminMetrics;