import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Circle as CircleNotch } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { calculateRiskScore } from '../utils/trafficFilters';
import { buildUrlWithUtm } from '../utils/utm';

function LoadingPage() {
  const navigate = useNavigate();
  const { config, utmParams } = useConfig();
  const [loadingText, setLoadingText] = useState('Carregando conteúdo personalizado...');
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    let isMounted = true;
    
    const performAnalysis = async () => {
      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          if (isMounted) {
            setProgress(prev => {
              if (prev < 90) return prev + 10;
              return prev;
            });
          }
        }, 300);
        
        // Update loading text
        setTimeout(() => {
          if (isMounted) setLoadingText('Verificando compatibilidade...');
        }, 1000);
        
        setTimeout(() => {
          if (isMounted) setLoadingText('Preparando experiência...');
        }, 2000);
        
        // Calculate risk score
        const { score } = await calculateRiskScore();
        
        // Clear interval and set progress to 100%
        clearInterval(progressInterval);
        if (isMounted) setProgress(100);
        
        // Decide where to redirect based on risk score
        setTimeout(() => {
          if (!isMounted) return;
          
          if (score >= config.riskThreshold) {
            // Redirect to safe page
            navigate('/');
          } else {
            // Redirect to target URL with UTM parameters
            const targetUrl = buildUrlWithUtm(config.targetUrl, utmParams);
            window.location.href = targetUrl;
          }
        }, 500);
      } catch (error) {
        console.error('Error during traffic analysis:', error);
        
        // On error, default to safe page
        if (isMounted) {
          setLoadingText('Erro ao analisar tráfego. Redirecionando...');
          navigate('/');
        }
      }
    };
    
    // Start analysis after a short delay
    const timer = setTimeout(performAnalysis, 500);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [navigate, config, utmParams]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <CircleNotch className="animate-spin text-blue-600 h-12 w-12" />
        </div>
        
        <h1 className="text-xl font-semibold text-gray-800 mb-4">
          {loadingText}
        </h1>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-500">
          Aguarde enquanto preparamos o conteúdo para você...
        </p>
      </div>
      
      <p className="mt-8 text-xs text-gray-500">
        © 2024 Vida Saudável
      </p>
    </div>
  );
}

export default LoadingPage;