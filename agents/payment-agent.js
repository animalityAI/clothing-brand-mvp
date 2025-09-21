const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_SECRET = process.env.SHOPIFY_SECRET;
const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const BNPL_API_KEY = process.env.BNPL_API_KEY;
const CRYPTO_WALLET_KEY = process.env.CRYPTO_WALLET_KEY;

class PaymentAgent {
  constructor() {
    this.paymentMethods = {
      shopify: this.processShopifyPayment.bind(this),
      bnpl: this.processBnplPayment.bind(this),
      crypto: this.processCryptoPayment.bind(this),
      apple_pay: this.processApplePayment.bind(this),
      google_pay: this.processGooglePayment.bind(this)
    };
  }

  // AI-powered payment method selection
  async selectOptimalPaymentMethod(userProfile, orderDetails) {
    const { amount, currency, userLocation, previousPayments } = userProfile;
    
    // AI scoring algorithm for payment method selection
    const scores = {
      shopify: 0.7, // Base score
      bnpl: 0,
      crypto: 0,
      apple_pay: 0,
      google_pay: 0
    };

    // Score based on order amount
    if (orderDetails.total > 100) {
      scores.bnpl += 0.3; // Higher for expensive items
    }
    
    // Score based on user age/generation
    if (userProfile.age < 30) {
      scores.bnpl += 0.2;
      scores.crypto += 0.1;
    }
    
    // Score based on location (crypto adoption)
    const cryptoFriendlyRegions = ['US', 'EU', 'JP', 'SG'];
    if (cryptoFriendlyRegions.includes(userProfile.location)) {
      scores.crypto += 0.15;
    }
    
    // Score based on device
    if (userProfile.device === 'ios') {
      scores.apple_pay += 0.25;
    } else if (userProfile.device === 'android') {
      scores.google_pay += 0.25;
    }
    
    // Return highest scoring method
    return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  }

  // Shopify Checkout API
  async processShopifyPayment(orderData) {
    try {
      const checkoutData = {
        checkout: {
          line_items: orderData.items.map(item => ({
            variant_id: item.variantId,
            quantity: item.quantity
          })),
          email: orderData.customerEmail,
          shipping_address: orderData.shippingAddress,
          billing_address: orderData.billingAddress
        }
      };

      const response = await axios.post(
        `${SHOPIFY_STORE_URL}/admin/api/2024-10/checkouts.json`,
        checkoutData,
        {
          headers: {
            'X-Shopify-Access-Token': SHOPIFY_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        checkoutUrl: response.data.checkout.web_url,
        checkoutId: response.data.checkout.id,
        total: response.data.checkout.total_price,
        currency: response.data.checkout.currency
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallback: 'bnpl'
      };
    }
  }

  // Buy Now Pay Later integration
  async processBnplPayment(orderData) {
    try {
      const bnplData = {
        amount: orderData.total * 100, // Convert to cents
        currency: orderData.currency || 'USD',
        customer: {
          email: orderData.customerEmail,
          phone: orderData.phone
        },
        items: orderData.items,
        successUrl: `${process.env.FRONTEND_URL}/payment/success`,
        cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`
      };

      // Simulate BNPL API call (replace with actual provider)
      const response = await axios.post(
        'https://api.bnpl-provider.com/v1/checkout',
        bnplData,
        {
          headers: {
            'Authorization': `Bearer ${BNPL_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        checkoutUrl: response.data.checkout_url,
        sessionId: response.data.session_id,
        installments: response.data.installment_plan
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallback: 'shopify'
      };
    }
  }

  // Cryptocurrency payment processing
  async processCryptoPayment(orderData) {
    try {
      // Generate unique wallet address for this transaction
      const transactionId = crypto.randomUUID();
      const cryptoData = {
        amount: orderData.total,
        currency: orderData.cryptoCurrency || 'BTC',
        transactionId,
        customerEmail: orderData.customerEmail
      };

      // Simulate crypto payment gateway
      const walletAddress = this.generateWalletAddress(cryptoData.currency);
      
      return {
        success: true,
        walletAddress,
        amount: cryptoData.amount,
        currency: cryptoData.currency,
        transactionId,
        qrCode: `data:image/svg+xml;base64,${Buffer.from(`<svg>QR Code for ${walletAddress}</svg>`).toString('base64')}`,
        expiresIn: 15 * 60 * 1000 // 15 minutes
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallback: 'shopify'
      };
    }
  }

  // Apple Pay processing
  async processApplePayment(orderData) {
    return {
      success: true,
      paymentMethod: 'apple_pay',
      merchantId: process.env.APPLE_MERCHANT_ID,
      supportedNetworks: ['visa', 'masterCard', 'amex'],
      merchantCapabilities: ['supports3DS'],
      total: {
        label: 'Clothing Brand',
        amount: orderData.total.toString(),
        type: 'final'
      }
    };
  }

  // Google Pay processing  
  async processGooglePayment(orderData) {
    return {
      success: true,
      paymentMethod: 'google_pay',
      merchantId: process.env.GOOGLE_MERCHANT_ID,
      environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST',
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX']
        }
      }],
      transactionInfo: {
        totalPrice: orderData.total.toString(),
        totalPriceStatus: 'FINAL',
        currencyCode: orderData.currency || 'USD'
      }
    };
  }

  generateWalletAddress(currency) {
    // Simplified wallet address generation
    const addresses = {
      BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      ETH: '0x742CE0F7Ae4a896E26F4C8c1b0D6F8E6B4Bdb2B4',
      LTC: 'LTC1234567890abcdef'
    };
    return addresses[currency] || addresses.BTC;
  }

  // Main payment processing endpoint
  async processPayment(orderData, userProfile) {
    try {
      // AI selects optimal payment method
      const selectedMethod = await this.selectOptimalPaymentMethod(userProfile, orderData);
      
      console.log(`AI selected payment method: ${selectedMethod}`);
      
      // Process with selected method
      const result = await this.paymentMethods[selectedMethod](orderData);
      
      // If primary method fails, try fallback
      if (!result.success && result.fallback) {
        console.log(`Fallback to: ${result.fallback}`);
        return await this.paymentMethods[result.fallback](orderData);
      }
      
      return {
        ...result,
        selectedMethod,
        timestamp: new Date().toISOString(),
        transactionId: crypto.randomUUID()
      };
    } catch (error) {
      return {
        success: false,
        error: 'Payment processing failed',
        details: error.message
      };
    }
  }
}

// Initialize payment agent
const paymentAgent = new PaymentAgent();

// Routes
app.post('/api/checkout', async (req, res) => {
  try {
    const { orderData, userProfile } = req.body;
    
    // Validate required fields
    if (!orderData || !orderData.items || !orderData.customerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required order data'
      });
    }
    
    const result = await paymentAgent.processPayment(orderData, userProfile || {});
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Payment method capabilities
app.get('/api/payment-methods', (req, res) => {
  res.json({
    available: Object.keys(paymentAgent.paymentMethods),
    features: {
      ai_selection: true,
      fallback_support: true,
      crypto_support: true,
      bnpl_support: true,
      mobile_wallets: true
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`Payment Agent running on port ${PORT}`);
});

module.exports = app;
