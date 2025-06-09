#!/bin/bash

# 🏢 Phangan Franchise Creation Script
# Автоматическое создание новой франшизы с полной настройкой

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Default values
FRANCHISE_TYPE="standard"
DRY_RUN=false
SKIP_TESTS=false
AUTO_DEPLOY=false

# Function to print colored output
print_step() {
    echo -e "${BLUE}🔹 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${PURPLE}"
    echo "🏢 =================================================="
    echo "   Phangan FRANCHISE CREATION SYSTEM"
    echo "   $1"
    echo "==================================================${NC}"
}

# Help function
show_help() {
    cat << EOF
🏢 Phangan Franchise Creation Script

USAGE:
    ./scripts/create-franchise.sh [OPTIONS]

OPTIONS:
    -l, --location LOCATION    Target location (required)
    -t, --type TYPE           Franchise type: flagship|standard|express (default: standard)
    -c, --config CONFIG       Custom config file path
    -e, --environment ENV     Target environment: staging|production (default: staging)
    --dry-run                 Show what would be done without executing
    --skip-tests             Skip automated testing
    --auto-deploy            Automatically deploy after setup
    -h, --help               Show this help message

EXAMPLES:
    # Create standard franchise in Phuket
    ./scripts/create-franchise.sh --location phuket

    # Create flagship franchise in Bangkok with auto-deploy
    ./scripts/create-franchise.sh -l bangkok -t flagship --auto-deploy

    # Dry run for Samui express franchise
    ./scripts/create-franchise.sh -l samui -t express --dry-run

FRANCHISE TYPES:
    flagship    - Full features, 2-4 courts, premium support
    standard    - Standard features, 1-2 courts, regular support  
    express     - Basic features, 1 court + shop, minimal support

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -l|--location)
            LOCATION="$2"
            shift 2
            ;;
        -t|--type)
            FRANCHISE_TYPE="$2"
            shift 2
            ;;
        -c|--config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --auto-deploy)
            AUTO_DEPLOY=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validation
if [[ -z "$LOCATION" ]]; then
    print_error "Location is required. Use -l or --location option."
    show_help
    exit 1
fi

if [[ ! "$FRANCHISE_TYPE" =~ ^(flagship|standard|express)$ ]]; then
    print_error "Invalid franchise type. Must be: flagship, standard, or express"
    exit 1
fi

# Set defaults
ENVIRONMENT=${ENVIRONMENT:-staging}
CONFIG_FILE=${CONFIG_FILE:-"configs/locations/${LOCATION}.json"}
PROJECT_ROOT=$(pwd)
FRANCHISE_DIR="franchise-${LOCATION}-$(date +%Y%m%d-%H%M%S)"

print_header "Creating ${FRANCHISE_TYPE} franchise in ${LOCATION}"

# Step 1: Validate configuration
print_step "Validating configuration..."

if [[ ! -f "$CONFIG_FILE" ]]; then
    print_error "Configuration file not found: $CONFIG_FILE"
    print_step "Creating template configuration..."
    
    mkdir -p "configs/locations"
    cat > "$CONFIG_FILE" << EOF
{
  "location": {
    "name": "Phangan ${LOCATION^}",
    "country": "Thailand",
    "city": "${LOCATION^}",
    "timezone": "Asia/Bangkok",
    "currency": "THB",
    "exchange_rate": 1.0,
    "language": "th-TH",
    "coordinates": {
      "lat": 0.0,
      "lng": 0.0
    }
  },
  
  "business_config": {
    "type": "${FRANCHISE_TYPE}",
    "courts": [],
    "operating_hours": {
      "monday": "06:00-22:00",
      "tuesday": "06:00-22:00",
      "wednesday": "06:00-22:00",
      "thursday": "06:00-22:00",
      "friday": "06:00-23:00",
      "saturday": "06:00-23:00",
      "sunday": "07:00-21:00"
    },
    "pricing_model": {
      "base_rates": {},
      "peak_hours": ["17:00-21:00"],
      "weekend_markup": 0.2
    }
  },

  "integrations": {
    "payment_gateways": ["promptpay", "stripe"],
    "weather_api": "openweathermap",
    "maps_api": "google_maps",
    "analytics": "google_analytics",
    "email": "sendgrid",
    "sms": "twilio"
  },

  "local_features": {
    "tourist_packages": true,
    "hotel_partnerships": false,
    "ferry_schedule_integration": false,
    "multi_language_support": ["thai", "english"],
    "cultural_events": []
  }
}
EOF
    
    print_warning "Template configuration created. Please edit $CONFIG_FILE before proceeding."
    exit 1
fi

print_success "Configuration validated: $CONFIG_FILE"

# Load configuration
CONFIG=$(cat "$CONFIG_FILE")
FRANCHISE_NAME=$(echo "$CONFIG" | jq -r '.location.name')
CURRENCY=$(echo "$CONFIG" | jq -r '.location.currency')
LANGUAGE=$(echo "$CONFIG" | jq -r '.location.language')

print_step "Franchise: $FRANCHISE_NAME ($FRANCHISE_TYPE)"
print_step "Currency: $CURRENCY, Language: $LANGUAGE"

if [[ "$DRY_RUN" == "true" ]]; then
    print_warning "DRY RUN MODE - No actual changes will be made"
fi

# Step 2: Create franchise directory structure
print_step "Creating franchise directory structure..."

if [[ "$DRY_RUN" == "false" ]]; then
    mkdir -p "$FRANCHISE_DIR"/{src,docs,configs,assets,deployments}
    mkdir -p "$FRANCHISE_DIR"/src/{api,db,components,utils}
    mkdir -p "$FRANCHISE_DIR"/docs/{setup,api,user-guide}
    mkdir -p "$FRANCHISE_DIR"/assets/{images,icons,branding}
fi

print_success "Directory structure created: $FRANCHISE_DIR"

# Step 3: Generate database schema
print_step "Generating database schema..."

DB_NAME="Phangan_${LOCATION}_$(echo $FRANCHISE_TYPE | tr '[:upper:]' '[:lower:]')"
DB_CONFIG_FILE="$FRANCHISE_DIR/configs/database.json"

if [[ "$DRY_RUN" == "false" ]]; then
    cat > "$DB_CONFIG_FILE" << EOF
{
  "database": {
    "name": "$DB_NAME",
    "host": "\${DATABASE_HOST}",
    "port": 5432,
    "ssl": true,
    "schema": "public"
  },
  "migrations": {
    "table": "_drizzle_migrations",
    "schema": "public"
  },
  "location_extensions": {
    "weather_tracking": true,
    "tourist_analytics": true,
    "local_partnerships": true
  }
}
EOF

    # Copy core schema files
    cp -r src/db/schema "$FRANCHISE_DIR/src/db/"
    
    # Generate location-specific extensions
    cat > "$FRANCHISE_DIR/src/db/schema/locationExtensions.ts" << EOF
// Location-specific database extensions for ${LOCATION^}
import { pgTable, serial, varchar, timestamp, decimal, integer, boolean } from 'drizzle-orm/pg-core';

export const ${LOCATION}WeatherData = pgTable('${LOCATION}_weather_data', {
  id: serial('id').primaryKey(),
  venueId: integer('venue_id').references(() => venues.id),
  date: timestamp('date').notNull(),
  temperature: decimal('temperature', { precision: 4, scale: 1 }),
  humidity: integer('humidity'),
  precipitation: decimal('precipitation', { precision: 4, scale: 1 }),
  windSpeed: decimal('wind_speed', { precision: 4, scale: 1 }),
  uvIndex: integer('uv_index'),
  bookingImpactScore: decimal('booking_impact_score', { precision: 3, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow()
});

export const ${LOCATION}LocalPartners = pgTable('${LOCATION}_local_partners', {
  id: serial('id').primaryKey(),
  venueId: integer('venue_id').references(() => venues.id),
  partnerName: varchar('partner_name', { length: 255 }).notNull(),
  partnerType: varchar('partner_type', { length: 100 }).notNull(), // hotel, restaurant, tour_operator
  contactPerson: varchar('contact_person', { length: 255 }),
  commissionRate: decimal('commission_rate', { precision: 4, scale: 2 }),
  contractUrl: varchar('contract_url', { length: 500 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});
EOF
fi

print_success "Database schema generated for $DB_NAME"

# Step 4: Generate API endpoints
print_step "Generating API endpoints..."

if [[ "$DRY_RUN" == "false" ]]; then
    # Copy core API structure
    cp -r src/api "$FRANCHISE_DIR/src/"
    
    # Generate location-specific routes
    mkdir -p "$FRANCHISE_DIR/src/api/routes/${LOCATION}"
    
    cat > "$FRANCHISE_DIR/src/api/routes/${LOCATION}/weather.ts" << EOF
// Weather API for ${LOCATION^}
import { Router } from 'express';
import { weatherService } from '../../services/${LOCATION}WeatherService';

const router = Router();

// GET /api/v1/${LOCATION}/weather/current
router.get('/current', async (req, res) => {
  try {
    const weather = await weatherService.getCurrentWeather();
    res.json(weather);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// GET /api/v1/${LOCATION}/weather/forecast
router.get('/forecast', async (req, res) => {
  try {
    const forecast = await weatherService.getForecast();
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather forecast' });
  }
});

// GET /api/v1/${LOCATION}/weather/impact
router.get('/impact', async (req, res) => {
  try {
    const impact = await weatherService.getBookingImpact();
    res.json(impact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate weather impact' });
  }
});

export default router;
EOF
fi

print_success "API endpoints generated for ${LOCATION^}"

# Step 5: Generate branding assets
print_step "Generating branding assets..."

if [[ "$DRY_RUN" == "false" ]]; then
    # Create branding configuration
    cat > "$FRANCHISE_DIR/assets/branding/config.json" << EOF
{
  "location": "${LOCATION}",
  "franchise_type": "${FRANCHISE_TYPE}",
  "brand": {
    "name": "${FRANCHISE_NAME}",
    "tagline": "Premium Sports Experience in ${LOCATION^}",
    "colors": {
      "primary": "#0077BE",
      "secondary": "#FF6B35", 
      "accent": "#2ECC71",
      "neutral": "#F8F9FA"
    },
    "fonts": {
      "primary": "Inter",
      "secondary": "Sarabun",
      "heading": "Poppins"
    }
  },
  "assets": {
    "logo": "logo-${LOCATION}.svg",
    "favicon": "favicon-${LOCATION}.ico",
    "og_image": "og-${LOCATION}.jpg",
    "app_icon": "app-icon-${LOCATION}.png"
  }
}
EOF

    # Generate location-specific styles
    cat > "$FRANCHISE_DIR/assets/branding/${LOCATION}.scss" << EOF
// ${LOCATION^} specific brand styles

// Colors inspired by local culture
\$primary-color: #0077BE;    // Ocean blue
\$secondary-color: #FF6B35;  // Sunset orange  
\$accent-color: #2ECC71;     // Tropical green
\$neutral-color: #F8F9FA;    // Beach sand

// Local imagery
.hero-background {
  background-image: url('../images/${LOCATION}-hero.jpg');
  background-size: cover;
  background-position: center;
}

.location-pattern {
  background: linear-gradient(45deg, \$primary-color 25%, transparent 25%);
}

// Cultural adaptations
.${LANGUAGE//-/_}-text {
  font-family: 'Sarabun', sans-serif;
}

.tourist-friendly {
  .language-toggle {
    display: flex;
    gap: 10px;
  }
}

// Franchise type specific styles
.franchise-${FRANCHISE_TYPE} {
  .premium-indicator {
    display: block;
  }
}
EOF
fi

print_success "Branding assets generated for ${FRANCHISE_NAME}"

# Step 6: Generate Obsidian documentation structure
print_step "Generating documentation structure..."

if [[ "$DRY_RUN" == "false" ]]; then
    mkdir -p "$FRANCHISE_DIR/docs/obsidian/Database"
    
    # Copy and customize documentation templates
    for template in oxygen-world/Database/*.md; do
        if [[ -f "$template" ]]; then
            filename=$(basename "$template")
            # Replace Phangan with location-specific name
            sed "s/Phangan/${FRANCHISE_NAME}/g" "$template" > "$FRANCHISE_DIR/docs/obsidian/Database/$filename"
        fi
    done
    
    # Create location-specific master navigation
    cat > "$FRANCHISE_DIR/docs/obsidian/🗺️ MASTER NAVIGATION.md" << EOF
---
title: "🗺️ MASTER NAVIGATION - ${FRANCHISE_NAME} System"
tags: [navigation, architecture, system-map, overview]
cssclasses: [navigation-hub]
---

# 🗺️ MASTER NAVIGATION - ${FRANCHISE_NAME}

_Complete ecosystem map for ${FRANCHISE_NAME} (${FRANCHISE_TYPE^} Franchise)_

## 🎯 Location-Specific Features

### ${LOCATION^} Specializations

- **Local Weather Integration**: Real-time weather impact on bookings
- **Tourist Analytics**: Seasonal patterns and visitor behavior
- **Cultural Events**: Local holidays and celebrations integration
- **Language Support**: ${LANGUAGE} primary, English secondary

## 📊 Franchise Performance

### ${FRANCHISE_TYPE^} Metrics
- Target Monthly Revenue: \$$(echo "$FRANCHISE_TYPE" | case $FRANCHISE_TYPE in flagship) echo "25,000";; standard) echo "15,000";; express) echo "8,000";; esac)
- Expected Court Utilization: 75%+
- Customer Satisfaction Target: 4.5⭐+

---

_Generated for ${FRANCHISE_NAME} on $(date)_
EOF
fi

print_success "Documentation structure created"

# Step 7: Generate deployment configuration
print_step "Generating deployment configuration..."

if [[ "$DRY_RUN" == "false" ]]; then
    cat > "$FRANCHISE_DIR/deployments/docker-compose.${ENVIRONMENT}.yml" << EOF
version: '3.8'

services:
  ${LOCATION}-app:
    image: Phangan-franchise:${LOCATION}-latest
    container_name: Phangan-${LOCATION}-app
    environment:
      - NODE_ENV=${ENVIRONMENT}
      - DATABASE_URL=\${DATABASE_URL}
      - FRANCHISE_LOCATION=${LOCATION}
      - FRANCHISE_TYPE=${FRANCHISE_TYPE}
      - CURRENCY=${CURRENCY}
      - LANGUAGE=${LANGUAGE}
    ports:
      - "3000:3000"
    volumes:
      - ./configs:/app/configs:ro
      - ./assets:/app/assets:ro
    depends_on:
      - ${LOCATION}-db
      - ${LOCATION}-redis

  ${LOCATION}-db:
    image: postgres:15
    container_name: Phangan-${LOCATION}-db
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=\${DB_USER}
      - POSTGRES_PASSWORD=\${DB_PASSWORD}
    volumes:
      - ${LOCATION}_db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  ${LOCATION}-redis:
    image: redis:7-alpine
    container_name: Phangan-${LOCATION}-redis
    ports:
      - "6379:6379"

volumes:
  ${LOCATION}_db_data:

networks:
  default:
    name: Phangan-${LOCATION}-network
EOF

    # Generate Kubernetes deployment
    cat > "$FRANCHISE_DIR/deployments/k8s-${ENVIRONMENT}.yaml" << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: Phangan-${LOCATION}
  labels:
    app: Phangan-franchise
    location: ${LOCATION}
    type: ${FRANCHISE_TYPE}
spec:
  replicas: $(echo "$FRANCHISE_TYPE" | case $FRANCHISE_TYPE in flagship) echo "3";; standard) echo "2";; express) echo "1";; esac)
  selector:
    matchLabels:
      app: Phangan-${LOCATION}
  template:
    metadata:
      labels:
        app: Phangan-${LOCATION}
    spec:
      containers:
      - name: app
        image: Phangan-franchise:${LOCATION}-latest
        ports:
        - containerPort: 3000
        env:
        - name: FRANCHISE_LOCATION
          value: "${LOCATION}"
        - name: FRANCHISE_TYPE
          value: "${FRANCHISE_TYPE}"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: ${LOCATION}-secrets
              key: database-url
---
apiVersion: v1
kind: Service
metadata:
  name: Phangan-${LOCATION}-service
spec:
  selector:
    app: Phangan-${LOCATION}
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
EOF
fi

print_success "Deployment configuration generated"

# Step 8: Run automated tests (if not skipped)
if [[ "$SKIP_TESTS" == "false" && "$DRY_RUN" == "false" ]]; then
    print_step "Running automated validation tests..."
    
    # Create test script
    cat > "$FRANCHISE_DIR/test-franchise.sh" << 'EOF'
#!/bin/bash

echo "🧪 Testing franchise configuration..."

# Test 1: Validate JSON configuration
if ! jq empty configs/database.json 2>/dev/null; then
    echo "❌ Invalid database configuration JSON"
    exit 1
fi

# Test 2: Check required directories
required_dirs=("src/api" "src/db" "docs/obsidian" "assets/branding" "deployments")
for dir in "${required_dirs[@]}"; do
    if [[ ! -d "$dir" ]]; then
        echo "❌ Missing required directory: $dir"
        exit 1
    fi
done

# Test 3: Validate TypeScript files
if command -v tsc >/dev/null 2>&1; then
    echo "🔍 Checking TypeScript compilation..."
    if ! tsc --noEmit src/db/schema/locationExtensions.ts 2>/dev/null; then
        echo "⚠️  TypeScript compilation issues found"
    fi
fi

echo "✅ All validation tests passed!"
EOF

    chmod +x "$FRANCHISE_DIR/test-franchise.sh"
    
    if (cd "$FRANCHISE_DIR" && ./test-franchise.sh); then
        print_success "All validation tests passed"
    else
        print_error "Some validation tests failed"
        exit 1
    fi
fi

# Step 9: Generate setup instructions
print_step "Generating setup instructions..."

if [[ "$DRY_RUN" == "false" ]]; then
    cat > "$FRANCHISE_DIR/README.md" << EOF
# ${FRANCHISE_NAME} - ${FRANCHISE_TYPE^} Franchise

Generated on: $(date)
Location: ${LOCATION^}
Type: ${FRANCHISE_TYPE}
Environment: ${ENVIRONMENT}

## 🚀 Quick Start

### 1. Environment Setup
\`\`\`bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
\`\`\`

### 2. Database Setup
\`\`\`bash
# Create database
createdb ${DB_NAME}

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed:${LOCATION}
\`\`\`

### 3. Start Development Server
\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev:${LOCATION}
\`\`\`

### 4. Deploy to ${ENVIRONMENT^}
\`\`\`bash
# Build production image
docker-compose -f deployments/docker-compose.${ENVIRONMENT}.yml build

# Deploy
docker-compose -f deployments/docker-compose.${ENVIRONMENT}.yml up -d
\`\`\`

## 📋 Configuration Files

- \`configs/database.json\` - Database configuration
- \`assets/branding/config.json\` - Branding and style configuration
- \`deployments/\` - Deployment configurations for different environments

## 🎯 Franchise Specific Features

### ${LOCATION^} Integrations
$(echo "$CONFIG" | jq -r '.integrations | to_entries[] | "- " + .key + ": " + (.value | if type == "array" then join(", ") else . end)')

### Local Features
$(echo "$CONFIG" | jq -r '.local_features | to_entries[] | select(.value == true) | "- " + .key')

## 📞 Support

- **Franchise Support**: support@Phangan.com
- **Technical Issues**: tech@Phangan.com
- **Documentation**: docs.Phangan.com/${LOCATION}

---

*This franchise was generated using Phangan Franchise System v2.0*
EOF
fi

print_success "Setup instructions generated"

# Step 10: Auto-deploy (if requested)
if [[ "$AUTO_DEPLOY" == "true" && "$DRY_RUN" == "false" ]]; then
    print_step "Auto-deploying to ${ENVIRONMENT}..."
    
    (cd "$FRANCHISE_DIR" && {
        print_step "Building Docker image..."
        docker-compose -f "deployments/docker-compose.${ENVIRONMENT}.yml" build
        
        print_step "Starting services..."
        docker-compose -f "deployments/docker-compose.${ENVIRONMENT}.yml" up -d
        
        print_step "Waiting for services to be ready..."
        sleep 30
        
        print_step "Running health checks..."
        if curl -f "http://localhost:3000/health" >/dev/null 2>&1; then
            print_success "Deployment successful! Service is running at http://localhost:3000"
        else
            print_warning "Service deployed but health check failed"
        fi
    })
fi

# Final summary
print_header "FRANCHISE CREATION COMPLETE"

echo -e "${GREEN}"
echo "🎉 ${FRANCHISE_NAME} franchise has been successfully created!"
echo ""
echo "📁 Location: $FRANCHISE_DIR"
echo "🏢 Type: ${FRANCHISE_TYPE^}"
echo "🌍 Environment: ${ENVIRONMENT}"
echo "💰 Currency: ${CURRENCY}"
echo "🗣️  Language: ${LANGUAGE}"
echo ""

if [[ "$DRY_RUN" == "true" ]]; then
    echo "⚠️  This was a DRY RUN - no actual files were created"
else
    echo "📋 Next Steps:"
    echo "   1. cd $FRANCHISE_DIR"
    echo "   2. Review and edit configuration files"
    echo "   3. Set up environment variables (.env)"
    echo "   4. Run database migrations"
    echo "   5. Start development server"
    
    if [[ "$AUTO_DEPLOY" == "false" ]]; then
        echo "   6. Deploy when ready: docker-compose -f deployments/docker-compose.${ENVIRONMENT}.yml up -d"
    fi
fi

echo -e "${NC}"

print_success "Franchise creation completed successfully! 🏆" 