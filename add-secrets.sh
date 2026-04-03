#!/bin/bash
# Script to add production database secrets to GitHub
# Run this in your terminal

# Ensure you're logged in to gh CLI with proper scope
gh auth status || gh auth login

echo "Adding DATABASE_URL to GitHub secrets..."
echo "postgresql://neondb_owner:npg_iDC8o1GZeulQ@ep-autumn-moon-alfykavd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require" | gh secret set DATABASE_URL -R BeanMap/roasters-hub

echo "Adding DIRECT_URL to GitHub secrets..."
echo "postgresql://neondb_owner:npg_iDC8o1GZeulQ@ep-autumn-moon-alfykavd.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require" | gh secret set DIRECT_URL -R BeanMap/roasters-hub

echo "✅ Secrets added successfully!"
echo ""
echo "Verify:"
gh secret list -R BeanMap/roasters-hub
