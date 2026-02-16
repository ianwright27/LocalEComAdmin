/**
 * WrightCommerce Branding Configuration
 * 
 * Core branding is unchangeable (platform identity)
 * Client branding can be customized via environment variables
 */

export const branding = {
  // Core WrightCommerce Platform (PERMANENT - DO NOT CHANGE)
  platform: {
    name: 'WrightCommerce',
    tagline: 'E-commerce for East African Businesses',
    footer: 'Powered by WrightCommerce',
    copyright: `© ${new Date().getFullYear()} WrightCommerce. All rights reserved.`,
    support: {
      email: 'support@wrightcommerce.com',
      phone: '+254 700 000000',
      docs: 'https://docs.wrightcommerce.com'
    },
    social: {
      twitter: 'https://twitter.com/wrightcommerce',
      linkedin: 'https://linkedin.com/company/wrightcommerce',
      github: 'https://github.com/wrightcommerce'
    }
  },

  // Client/Business Branding (Customizable via .env)
  client: {
    businessName: process.env.REACT_APP_BUSINESS_NAME || 'WrightCommerce',
    logo: process.env.REACT_APP_LOGO_URL || null,
    colors: {
      primary: process.env.REACT_APP_PRIMARY_COLOR || '#2c3e50',
      accent: process.env.REACT_APP_ACCENT_COLOR || '#e67e22',
    }
  },

  // UI Theme
  theme: {
    colors: {
      primary: '#2c3e50',
      secondary: '#34495e',
      accent: '#e67e22',
      success: '#2ecc71',
      warning: '#f39c12',
      danger: '#e74c3c',
      info: '#3498db',
      light: '#ecf0f1',
      dark: '#2c3e50',
    },
    spacing: {
      sidebar: '250px',
      header: '70px',
    }
  }
};

export default branding;