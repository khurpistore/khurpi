import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Shield, Save, Loader2, Eye, Edit, Truck, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPages = () => {
  const [activeTab, setActiveTab] = useState('privacy-policy');
  const [pages, setPages] = useState({
    'privacy-policy': { title: 'Privacy Policy', content: '' },
    'terms-conditions': { title: 'Terms and Conditions', content: '' },
    'shipping-policy': { title: 'Shipping Policy', content: '' },
    'cancellation-refund': { title: 'Cancellations and Refunds', content: '' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    try {
      const [privacyRes, termsRes, shippingRes, refundRes] = await Promise.all([
        axios.get(`${API}/pages/privacy-policy`),
        axios.get(`${API}/pages/terms-conditions`),
        axios.get(`${API}/pages/shipping-policy`),
        axios.get(`${API}/pages/cancellation-refund`)
      ]);
      setPages({
        'privacy-policy': privacyRes.data,
        'terms-conditions': termsRes.data,
        'shipping-policy': shippingRes.data,
        'cancellation-refund': refundRes.data
      });
    } catch (error) {
      console.error('Failed to fetch page content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (pageKey) => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/pages/${pageKey}`, pages[pageKey]);
      toast.success('Content Saved', {
        description: `${pages[pageKey].title} has been updated.`
      });
    } catch (error) {
      toast.error('Save Failed', {
        description: 'Could not save content. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePage = (pageKey, field, value) => {
    setPages(prev => ({
      ...prev,
      [pageKey]: { ...prev[pageKey], [field]: value }
    }));
  };

  const renderMarkdownPreview = (content) => (
    <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg min-h-[400px] overflow-auto">
      <ReactMarkdown
        components={{
          h1: ({children}) => <h1 className="text-xl font-bold text-primary mt-4 mb-2">{children}</h1>,
          h2: ({children}) => <h2 className="text-lg font-semibold text-gray-800 mt-4 mb-2 border-b pb-1">{children}</h2>,
          h3: ({children}) => <h3 className="text-base font-medium text-gray-700 mt-3 mb-1">{children}</h3>,
          p: ({children}) => <p className="text-gray-600 mb-3 text-sm">{children}</p>,
          ul: ({children}) => <ul className="list-disc list-inside space-y-1 mb-3 text-gray-600 text-sm">{children}</ul>,
          ol: ({children}) => <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-600 text-sm">{children}</ol>,
          li: ({children}) => <li className="ml-2">{children}</li>,
          strong: ({children}) => <strong className="font-semibold text-gray-800">{children}</strong>,
          table: ({children}) => <table className="w-full border-collapse mb-3 text-sm">{children}</table>,
          th: ({children}) => <th className="border border-gray-300 px-2 py-1 bg-gray-100">{children}</th>,
          td: ({children}) => <td className="border border-gray-300 px-2 py-1">{children}</td>,
        }}
      >
        {content || '*No content yet. Start typing in the editor.*'}
      </ReactMarkdown>
    </div>
  );

  const pageConfig = [
    { key: 'privacy-policy', label: 'Privacy Policy', icon: Shield },
    { key: 'terms-conditions', label: 'Terms & Conditions', icon: FileText },
    { key: 'shipping-policy', label: 'Shipping Policy', icon: Truck },
    { key: 'cancellation-refund', label: 'Cancellations & Refunds', icon: RotateCcw }
  ];

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Page Content</h1>
            <p className="text-muted-foreground">Manage legal pages and policies</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="rounded-full"
          >
            {previewMode ? <Edit className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
          <strong>Markdown Supported:</strong> Use # for headings, ** for bold, - for lists, | for tables
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            {pageConfig.map(page => (
              <TabsTrigger key={page.key} value={page.key} className="flex items-center gap-1 text-xs sm:text-sm">
                <page.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{page.label}</span>
                <span className="sm:hidden">{page.label.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {pageConfig.map(page => (
            <TabsContent key={page.key} value={page.key}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <page.icon className="w-5 h-5 text-primary" />
                    {page.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={`${page.key}-title`}>Page Title</Label>
                    <Input
                      id={`${page.key}-title`}
                      value={pages[page.key].title}
                      onChange={(e) => updatePage(page.key, 'title', e.target.value)}
                      placeholder={page.label}
                      className="mt-1"
                    />
                  </div>
                  
                  {previewMode ? (
                    <div>
                      <Label>Preview</Label>
                      {renderMarkdownPreview(pages[page.key].content)}
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor={`${page.key}-content`}>Content (Markdown)</Label>
                      <Textarea
                        id={`${page.key}-content`}
                        value={pages[page.key].content}
                        onChange={(e) => updatePage(page.key, 'content', e.target.value)}
                        placeholder={`Enter ${page.label.toLowerCase()} content using Markdown...`}
                        className="mt-1 min-h-[400px] font-mono text-sm"
                      />
                    </div>
                  )}

                  {pages[page.key].last_updated && (
                    <p className="text-xs text-muted-foreground">
                      Last updated: {new Date(pages[page.key].last_updated).toLocaleString()}
                    </p>
                  )}

                  <Button 
                    onClick={() => handleSave(page.key)} 
                    disabled={saving}
                    className="w-full sm:w-auto rounded-full"
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save {page.label}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
};

export default AdminPages;
