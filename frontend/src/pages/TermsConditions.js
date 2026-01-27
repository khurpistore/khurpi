import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TermsConditions = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API}/pages/terms-conditions`);
      setContent(response.data);
    } catch (error) {
      console.error('Failed to fetch terms and conditions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">
            {content?.title || 'Terms and Conditions'}
          </h1>
        </div>
        
        {content?.last_updated && (
          <p className="text-sm text-muted-foreground mb-6">
            Last Updated: {new Date(content.last_updated).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        )}

        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="prose prose-green max-w-none">
              {content?.content ? (
                <ReactMarkdown
                  components={{
                    h1: ({children}) => <h1 className="text-2xl font-bold text-primary mt-6 mb-4">{children}</h1>,
                    h2: ({children}) => <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3 border-b pb-2">{children}</h2>,
                    h3: ({children}) => <h3 className="text-lg font-medium text-gray-700 mt-4 mb-2">{children}</h3>,
                    p: ({children}) => <p className="text-gray-600 mb-4 leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="list-disc list-inside space-y-2 mb-4 text-gray-600">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-600">{children}</ol>,
                    li: ({children}) => <li className="ml-4">{children}</li>,
                    strong: ({children}) => <strong className="font-semibold text-gray-800">{children}</strong>,
                    a: ({children, href}) => <a href={href} className="text-primary hover:underline">{children}</a>,
                  }}
                >
                  {content.content}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">No terms and conditions content available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsConditions;
