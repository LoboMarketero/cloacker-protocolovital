import React, { useState } from 'react';
import { Save, Check, X, AlertCircle } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';

function AdminSettings() {
  const { config, updateConfig } = useConfig();
  const [formData, setFormData] = useState({
    targetUrl: config.targetUrl,
    riskThreshold: config.riskThreshold,
    allowedCountries: [...config.allowedCountries]
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testResults, setTestResults] = useState<null | {
    score: number;
    approved: boolean;
    redirect: string;
  }>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value, 10)
    }));
  };
  
  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    setFormData(prev => {
      if (checked && !prev.allowedCountries.includes(value)) {
        return {
          ...prev,
          allowedCountries: [...prev.allowedCountries, value]
        };
      } else if (!checked && prev.allowedCountries.includes(value)) {
        return {
          ...prev,
          allowedCountries: prev.allowedCountries.filter(country => country !== value)
        };
      }
      return prev;
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate URL
    try {
      new URL(formData.targetUrl);
    } catch (error) {
      setSaveStatus('error');
      return;
    }
    
    // Save the configuration
    updateConfig({
      targetUrl: formData.targetUrl,
      riskThreshold: formData.riskThreshold,
      allowedCountries: formData.allowedCountries
    });
    
    // Show success message
    setSaveStatus('success');
    
    // Reset status after a delay
    setTimeout(() => {
      setSaveStatus('idle');
    }, 3000);
  };
  
  const handleTestFilter = () => {
    // Simulate a test with random score
    const score = Math.floor(Math.random() * 10) + 1;
    const approved = score < formData.riskThreshold;
    
    setTestResults({
      score,
      approved,
      redirect: approved ? formData.targetUrl : window.location.origin + '/safe'
    });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Configurações do Sistema
        </h1>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Configurações de Filtro de Tráfego
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Ajuste os parâmetros para controlar o comportamento do sistema.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
          {saveStatus === 'success' && (
            <div className="rounded-md bg-green-50 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Configurações salvas com sucesso!
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {saveStatus === 'error' && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    Erro ao salvar configurações. Verifique se a URL de destino é válida.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-6">
            <div>
              <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-700">
                URL de Destino (Tráfego Aprovado)
              </label>
              <div className="mt-1">
                <input
                  type="url"
                  name="targetUrl"
                  id="targetUrl"
                  required
                  value={formData.targetUrl}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="https://seu-dominio.com/quiz"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                URL para onde os visitantes aprovados serão redirecionados.
              </p>
            </div>
            
            <div>
              <label htmlFor="riskThreshold" className="block text-sm font-medium text-gray-700">
                Limite de Score de Risco: {formData.riskThreshold}
              </label>
              <div className="mt-1">
                <input
                  type="range"
                  name="riskThreshold"
                  id="riskThreshold"
                  min="1"
                  max="10"
                  value={formData.riskThreshold}
                  onChange={handleRangeChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>Menos Restritivo (1)</span>
                <span>Mais Restritivo (10)</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Visitantes com score igual ou acima deste valor serão redirecionados para a página segura.
              </p>
            </div>
            
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">
                Países Permitidos
              </span>
              <div className="mt-1 space-y-2">
                <div className="flex items-center">
                  <input
                    id="country-br"
                    name="country"
                    type="checkbox"
                    value="BR"
                    checked={formData.allowedCountries.includes('BR')}
                    onChange={handleCountryChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="country-br" className="ml-2 block text-sm text-gray-700">
                    Brasil (BR)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="country-pt"
                    name="country"
                    type="checkbox"
                    value="PT"
                    checked={formData.allowedCountries.includes('PT')}
                    onChange={handleCountryChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="country-pt" className="ml-2 block text-sm text-gray-700">
                    Portugal (PT)
                  </label>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Apenas tráfego destes países será considerado para aprovação.
              </p>
            </div>
          </div>
          
          <div className="pt-6">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save className="h-4 w-4 mr-1" />
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
      
      {/* Test Filter Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Testar Configuração de Filtro
            </h3>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Simule o comportamento do sistema com a configuração atual.
          </p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <button
            type="button"
            onClick={handleTestFilter}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Simular Análise de Tráfego
          </button>
          
          {testResults && (
            <div className="mt-6 p-4 border rounded-md">
              <h4 className="text-md font-medium text-gray-900 mb-2">
                Resultado do Teste:
              </h4>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Score de Risco:</span> {testResults.score} / 10
                </p>
                
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Status:</span>{' '}
                  {testResults.approved ? (
                    <span className="text-green-600 font-medium">Aprovado</span>
                  ) : (
                    <span className="text-red-600 font-medium">Bloqueado</span>
                  )}
                </p>
                
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Redirecionamento:</span>{' '}
                  <span className="text-blue-600">{testResults.redirect}</span>
                </p>
                
                <p className="text-sm text-gray-500 italic mt-2">
                  Nota: Este é um teste de simulação. Scores reais são calculados com base em múltiplos fatores.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;