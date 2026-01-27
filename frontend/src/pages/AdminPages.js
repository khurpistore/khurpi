import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Shield, Save, Loader2, Eye, Edit } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPages = () => {
  const [activeTab, setActiveTab] = useState('privacy-policy');
  const [privacyPolicy, setPrivacyPolicy] = useState({ title: '', content: '' });
  const [termsConditions, setTermsConditions] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    try {
      const [privacyRes, termsRes] = await Promise.all([
        axios.get(`${API}/pages/privacy-policy`),
        axios.get(`${API}/pages/terms-conditions`)
      ]);
      setPrivacyPolicy(privacyRes.data);
      setTermsConditions(termsRes.data);
    } catch (error) {
      console.error('Failed to fetch page content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (type) => {
    setSaving(true);
    try {
      const data = type === 'privacy-policy' ? privacyPolicy : termsConditions;
      await axios.put(`${API}/admin/pages/${type}`, data);
      toast.success('Content Saved', {
        description: `${type === 'privacy-policy' ? 'Privacy Policy' : 'Terms & Conditions'} has been updated.`
      });
    } catch (error) {
      toast.error('Save Failed', {
        description: 'Could not save content. Please try again.'
      });
    } finally {
      setSaving(false);
    }
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
        }}
      >
        {content || '*No content yet. Start typing in the editor.*'}
      </ReactMarkdown>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Page Content</h1>
          <p className="text-muted-foreground">Manage Privacy Policy and Terms & Conditions</p>
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
        <strong>Markdown Supported:</strong> Use # for headings, ** for bold, - for lists, etc.
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="privacy-policy" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacy Policy
          </TabsTrigger>
          <TabsTrigger value="terms-conditions" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Terms & Conditions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="privacy-policy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="privacy-title">Page Title</Label>
                <Input
                  id="privacy-title"
                  value={privacyPolicy.title}
                  onChange={(e) => setPrivacyPolicy(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Privacy Policy"
                  className="mt-1"
                />
              </div>
              
              {previewMode ? (
                <div>
                  <Label>Preview</Label>
                  {renderMarkdownPreview(privacyPolicy.content)}
                </div>
              ) : (
                <div>
                  <Label htmlFor="privacy-content">Content (Markdown)</Label>
                  <Textarea
                    id="privacy-content"
                    value={privacyPolicy.content}
                    onChange={(e) => setPrivacyPolicy(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter privacy policy content using Markdown..."
                    className="mt-1 min-h-[400px] font-mono text-sm"
                  />
                </div>
              )}

              {privacyPolicy.last_updated && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(privacyPolicy.last_updated).toLocaleString()}
                </p>
              )}

              <Button 
                onClick={() => handleSave('privacy-policy')} 
                disabled={saving}
                className="w-full sm:w-auto rounded-full"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Privacy Policy
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terms-conditions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Terms & Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="terms-title">Page Title</Label>
                <Input
                  id="terms-title"
                  value={termsConditions.title}
                  onChange={(e) => setTermsConditions(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Terms and Conditions"
                  className="mt-1"
                />
              </div>
              
              {previewMode ? (
                <div>
                  <Label>Preview</Label>
                  {renderMarkdownPreview(termsConditions.content)}
                </div>
              ) : (
                <div>
                  <Label htmlFor="terms-content">Content (Markdown)</Label>
                  <Textarea
                    id="terms-content"
                    value={termsConditions.content}
                    onChange={(e) => setTermsConditions(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter terms and conditions content using Markdown..."
                    className="mt-1 min-h-[400px] font-mono text-sm"
                  />
                </div>
              )}

              {termsConditions.last_updated && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(termsConditions.last_updated).toLocaleString()}
                </p>
              )}

              <Button 
                onClick={() => handleSave('terms-conditions')} 
                disabled={saving}
                className="w-full sm:w-auto rounded-full"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Terms & Conditions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPages;
