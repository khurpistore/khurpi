import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PrivacyPolicy = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API}/settings/pages/privacy-policy`);
      setContent(response.data.content || getDefaultContent());
    } catch (error) {
      setContent(getDefaultContent());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultContent = () => `
## Privacy Policy

**Last Updated: January 2025**

### 1. Information We Collect

We collect information you provide directly to us, such as:
- Name and contact information (phone number, delivery address)
- Order and subscription details
- Payment information (processed securely through our payment partners)

### 2. How We Use Your Information

We use the information we collect to:
- Process and deliver your orders
- Manage your subscriptions
- Send order updates and delivery notifications
- Improve our services and customer experience

### 3. Information Sharing

We do not sell your personal information. We may share your information with:
- Delivery partners to fulfill your orders
- Payment processors to complete transactions

### 4. Data Security

We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.

### 5. Contact Us

If you have any questions about this Privacy Policy, please contact us at:
- Email: khurpi.store@gmail.com
- Phone: +91 9971818259
  `;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Privacy Policy</h1>
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8 prose prose-green max-w-none">
            <div 
              className="whitespace-pre-wrap text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: content.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-primary mt-6 mb-3">$1</h3>')
                  .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-primary mt-8 mb-4">$1</h2>')
                  .replace(/^\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                  .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
