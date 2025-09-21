# Clothing Brand MVP Specifications

## Brand Info
- **Style**: Minimalist
- **Primary Colors**: #000000, #FFFFFF, #F5F5F5 (light gray)
- **Typography**: Inter (sans-serif), 16px base
- **Target**: Modern, clean aesthetic

## Layout Specification
- **Layout**: Grid view (3 cols desktop, 2 cols tablet, 1 col mobile)
- **Responsive**: Mobile-first approach
- **Navigation**: Header with logo, search, cart
- **Footer**: Links, social, contact

## Technical Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **3D Viewer**: Three.js + GLTF loader
- **Database**: PostgreSQL
- **Cache**: Redis
- **Payment**: Custom agent + Shopify Checkout API

## API Endpoints
```
GET /api/products - List products
GET /api/products/:id - Product details
GET /api/products/:id/3d - 3D model URL
POST /api/checkout - Generate payment URL
GET /api/health - System status
```

## Deployment
- **Target**: AWS Lightsail
- **Containers**: Docker Compose
- **CI/CD**: GitHub Actions
- **Domain**: Custom domain with SSL

## Testing
- **Unit**: Jest + Testing Library
- **E2E**: Playwright
- **API**: Supertest
- **Coverage**: 80% minimum

## Naming Conventions
- **Variables**: camelCase (productId, userName)
- **Functions**: camelCase (fetchProducts, calculateTotal)
- **Classes**: PascalCase (ProductService, PaymentAgent)
- **Constants**: UPPER_CASE (API_BASE_URL, MAX_RETRIES)
- **Files**: kebab-case (product-service.ts, payment-agent.js)

## Token Optimization
- Minified JSON responses
- Compressed image assets
- Tree-shaken bundles
- CDN for static assets

## Performance Targets
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **Bundle Size**: < 200KB gzipped
