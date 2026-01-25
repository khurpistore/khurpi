import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TermsOfService = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API}/settings/pages/terms-of-service`);
      setContent(response.data.content || getDefaultContent());
    } catch (error) {
      setContent(getDefaultContent());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultContent = () => `
## Terms of Service

**Last Updated: January 2025**

### 1. Acceptance of Terms

By accessing and using Khurpi's services, you agree to be bound by these Terms of Service.

### 2. Products and Services

- All microgreens are sold in standard 5×7 inch trays
- Products are freshly harvested and delivered within the NOIDA area
- Subscription plans are billed monthly

### 3. Orders and Delivery

- Orders are confirmed upon successful payment or COD acceptance
- Delivery is available Monday through Saturday
- Delivery timing may vary based on location and demand

### 4. Subscription Terms

- Subscriptions are billed monthly in advance
- You may pause or cancel your subscription at any time
- Cancellation must be done 24 hours before the next delivery

### 5. Refunds and Returns

- Fresh produce is non-returnable due to its perishable nature
- Refunds may be issued for damaged or incorrect orders
- Contact us within 24 hours of delivery for any issues

### 6. Limitation of Liability

Khurpi is not liable for any indirect, incidental, or consequential damages arising from the use of our services.

### 7. Contact Us

For any questions regarding these terms:
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
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Terms of Service</h1>
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

export default TermsOfService;
