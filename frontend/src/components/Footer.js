import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show footer on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="/khurpi-logo.png" 
                alt="Khurpi" 
                className="h-12 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-sm text-white/80">
              Fresh, organic microgreens delivered to your doorstep in NOIDA. 
              Subscribe for regular deliveries and enjoy nature's superfoods.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <button onClick={() => navigate('/products')} className="hover:text-white transition-colors">
                  Products
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/subscription/create')} className="hover:text-white transition-colors">
                  Start Subscription
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/cart')} className="hover:text-white transition-colors">
                  Cart
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/profile')} className="hover:text-white transition-colors">
                  My Profile
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>hello@khurpi.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Sector 62, NOIDA, UP 201301</span>
              </li>
            </ul>
          </div>

          {/* Delivery Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Delivery</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>Currently serving NOIDA only</li>
              <li>Delivery: Mon - Sat</li>
              <li>Fresh harvest guaranteed</li>
              <li>Free delivery on subscriptions</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/60">
          <p>© 2025 Khurpi. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button className="hover:text-white transition-colors">Privacy Policy</button>
            <button className="hover:text-white transition-colors">Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
