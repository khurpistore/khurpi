import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MapPin, Clock, MessageCircle, Headphones, Loader2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Contact = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/store/settings`);
        setSettings(res.data);
      } catch (e) {
        setSettings({});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const phone = settings?.phone || '+91 9971818259';
  const email = settings?.email || 'khurpi.store@gmail.com';
  const address = settings?.address || 'E-312, ACE City, Noida Extension, 201306';
  const opening = settings?.opening_time || '07:00';
  const closing = settings?.closing_time || '21:00';
  const telHref = `tel:${phone.replace(/[^+\d]/g, '')}`;
  const waHref = `https://wa.me/${phone.replace(/[^\d]/g, '')}`;

  const cards = [
    {
      id: 'phone',
      icon: Phone,
      label: 'Call Us',
      value: phone,
      href: telHref,
      sub: 'Talk to our support team'
    },
    {
      id: 'email',
      icon: Mail,
      label: 'Email Us',
      value: email,
      href: `mailto:${email}`,
      sub: 'We reply within 24 hours'
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp',
      value: 'Chat with us',
      href: waHref,
      sub: 'Quick help on the go'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white" data-testid="contact-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
            <Headphones className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary heading-text">Help & Support</h1>
        </div>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          Have a question about an order, subscription, or delivery? Our team is here to help. Reach us through any of the options below.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {cards.map(({ id, icon: Icon, label, value, href, sub }) => (
            <a
              key={id}
              href={href}
              target={id === 'whatsapp' ? '_blank' : undefined}
              rel="noopener noreferrer"
              data-testid={`contact-${id}`}
              className="group block rounded-2xl border border-green-100 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white text-primary transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-sm text-primary font-medium break-words mt-0.5">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </a>
          ))}
        </div>

        <Card className="border-green-100">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-start gap-3" data-testid="contact-address">
              <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold">Our Address</p>
                <p className="text-sm text-muted-foreground">{address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3" data-testid="contact-hours">
              <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold">Support Hours</p>
                <p className="text-sm text-muted-foreground">Monday – Saturday, {opening} – {closing}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
