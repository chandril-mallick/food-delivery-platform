import React, { useState, useEffect } from 'react';
import { ProductionChecker } from '../utils/productionCheck';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

const ProductionReadinessCheck = () => {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const runChecks = async () => {
    setChecking(true);
    try {
      const checkResults = await ProductionChecker.runAllChecks();
      setResults(checkResults);
    } catch (error) {
      console.error('Production check failed:', error);
      setResults({
        passed: false,
        results: {
          environment: [`Check failed: ${error.message}`],
          firebase: { success: false, message: 'Check failed' },
          supabase: { success: false, message: 'Check failed' },
          auth: { success: false, message: 'Check failed' }
        }
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    runChecks();
  }, []);

  const getStatusIcon = (success) => {
    if (success) return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusColor = (success) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  if (checking) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center space-x-3">
          <Loader className="w-6 h-6 animate-spin text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-800">
            Running Production Readiness Checks...
          </h2>
        </div>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Production Readiness Check
          </h1>
          <button
            onClick={runChecks}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Re-run Checks
          </button>
        </div>

        {/* Overall Status */}
        <div className={`p-4 rounded-lg border-2 mb-6 ${
          results.passed 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center space-x-3">
            {results.passed ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-500" />
            )}
            <div>
              <h3 className={`text-lg font-semibold ${
                results.passed ? 'text-green-800' : 'text-red-800'
              }`}>
                {results.passed ? '✅ Ready for Production' : '❌ Not Ready for Production'}
              </h3>
              <p className={`text-sm ${
                results.passed ? 'text-green-600' : 'text-red-600'
              }`}>
                {results.passed 
                  ? 'All systems are functioning correctly'
                  : 'Issues found that need to be resolved'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Quick Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-center mb-2">
              {getStatusIcon(results.results.environment.length === 0)}
            </div>
            <p className={`font-medium ${getStatusColor(results.results.environment.length === 0)}`}>
              Environment
            </p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-center mb-2">
              {getStatusIcon(results.results.firebase.success)}
            </div>
            <p className={`font-medium ${getStatusColor(results.results.firebase.success)}`}>
              Firebase
            </p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-center mb-2">
              {getStatusIcon(results.results.supabase.success)}
            </div>
            <p className={`font-medium ${getStatusColor(results.results.supabase.success)}`}>
              Supabase
            </p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-center mb-2">
              {getStatusIcon(results.results.auth.success)}
            </div>
            <p className={`font-medium ${getStatusColor(results.results.auth.success)}`}>
              Authentication
            </p>
          </div>
        </div>

        {/* Toggle Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-gray-700"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>

        {/* Detailed Results */}
        {showDetails && (
          <div className="mt-6 space-y-4">
            {/* Environment Variables */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                {getStatusIcon(results.results.environment.length === 0)}
                <span className="ml-2">Environment Variables</span>
              </h4>
              {results.results.environment.length === 0 ? (
                <p className="text-green-600">All required environment variables are set</p>
              ) : (
                <ul className="text-red-600 space-y-1">
                  {results.results.environment.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Firebase */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                {getStatusIcon(results.results.firebase.success)}
                <span className="ml-2">Firebase Connection</span>
              </h4>
              <p className={results.results.firebase.success ? 'text-green-600' : 'text-red-600'}>
                {results.results.firebase.message}
              </p>
            </div>

            {/* Supabase */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                {getStatusIcon(results.results.supabase.success)}
                <span className="ml-2">Supabase Connection</span>
              </h4>
              <p className={results.results.supabase.success ? 'text-green-600' : 'text-red-600'}>
                {results.results.supabase.message}
              </p>
            </div>

            {/* Authentication */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                {getStatusIcon(results.results.auth.success)}
                <span className="ml-2">Authentication Service</span>
              </h4>
              <p className={results.results.auth.success ? 'text-green-600' : 'text-red-600'}>
                {results.results.auth.message}
              </p>
            </div>
          </div>
        )}

        {/* Action Items */}
        {!results.passed && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Action Items:</h4>
            <ul className="text-yellow-700 space-y-1 text-sm">
              {results.results.environment.length > 0 && (
                <li>• Fix missing environment variables</li>
              )}
              {!results.results.firebase.success && (
                <li>• Check Firebase configuration and connection</li>
              )}
              {!results.results.supabase.success && (
                <li>• Verify Supabase setup and credentials</li>
              )}
              {!results.results.auth.success && (
                <li>• Fix authentication service initialization</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionReadinessCheck;
