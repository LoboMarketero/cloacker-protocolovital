import React, { useState } from 'react';
import { Leaf, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

const questions = [
  {
    id: 1,
    text: "Como você se sente ao longo do dia?",
    options: [
      "Sempre com energia",
      "Energia variável",
      "Frequentemente cansado(a)",
      "Muito cansado(a)"
    ]
  },
  {
    id: 2,
    text: "Como está seu sono?",
    options: [
      "Durmo muito bem",
      "Às vezes tenho insônia",
      "Frequentemente acordo cansado(a)",
      "Tenho dificuldade para dormir"
    ]
  },
  {
    id: 3,
    text: "Como está sua alimentação?",
    options: [
      "Muito equilibrada",
      "Moderadamente equilibrada",
      "Pouco equilibrada",
      "Preciso melhorar muito"
    ]
  }
];

function SafePage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [whatsapp, setWhatsapp] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const validateBrazilianPhone = (phone: string) => {
    // Remove all non-numeric characters
    const numbers = phone.replace(/\D/g, '');
    
    // Check if it's a valid Brazilian phone number
    // Must be either 10 or 11 digits (with DDD)
    if (numbers.length < 10 || numbers.length > 11) {
      return false;
    }
    
    // Check if DDD is valid (10-99)
    const ddd = parseInt(numbers.substring(0, 2));
    if (ddd < 11 || ddd > 99) {
      return false;
    }
    
    return true;
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Format the number as (XX) XXXXX-XXXX or (XX) XXXX-XXXX
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 6)}-${numbers.substring(6)}`;
    } else {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7, 11)}`;
    }
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setWhatsapp(formattedNumber);
    setError('');
  };

  const handleWhatsappSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateBrazilianPhone(whatsapp)) {
      setError('Por favor, insira um número de WhatsApp válido no formato (XX) XXXXX-XXXX');
      return;
    }
    
    setSubmitted(true);
  };

  const calculateResult = () => {
    // Simple result calculation based on answers
    const positiveAnswers = answers.filter(
      answer => answer === questions[0].options[0] || 
                answer === questions[1].options[0] ||
                answer === questions[2].options[0]
    ).length;

    if (positiveAnswers >= 2) {
      return "Parabéns! Você já tem bons hábitos, mas pode melhorar ainda mais!";
    } else {
      return "Identificamos oportunidades para melhorar sua qualidade de vida!";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="ml-2 text-xl font-semibold text-gray-900">
              Protocolo Vital
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {!showResult ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-8">
              <div className="flex justify-between mb-4">
                {questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 w-full mx-1 rounded ${
                      idx <= currentQuestion ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {questions[currentQuestion].text}
              </h2>
            </div>

            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  className="w-full p-4 text-left rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  {option}
                  <ArrowRight className="float-right h-5 w-5 text-green-600" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {!submitted ? (
              <>
                <div className="text-center mb-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Análise Concluída!
                  </h2>
                  <p className="text-lg text-gray-700 mb-4">
                    {calculateResult()}
                  </p>
                  <p className="text-gray-600">
                    Deixe seu WhatsApp para receber o resultado completo e dicas personalizadas:
                  </p>
                </div>

                <form onSubmit={handleWhatsappSubmit} className="max-w-sm mx-auto">
                  <div className="mb-4">
                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp (formato: (XX) XXXXX-XXXX)
                    </label>
                    <input
                      type="tel"
                      id="whatsapp"
                      value={whatsapp}
                      onChange={handleWhatsappChange}
                      placeholder="(11) 98765-4321"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        error ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {error && (
                      <div className="mt-2 flex items-center text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {error}
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Receber Resultado Completo
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Obrigado!
                </h2>
                <p className="text-lg text-gray-700">
                  Em breve você receberá o resultado completo e dicas personalizadas no seu WhatsApp!
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-8 py-4 text-center text-sm text-gray-500">
        © 2024 Protocolo Vital. Todos os direitos reservados.
      </footer>
    </div>
  );
}

export default SafePage;