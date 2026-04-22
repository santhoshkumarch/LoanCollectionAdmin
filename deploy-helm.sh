#!/bin/bash

# Helm deployment script for SalesRepAdminDashboard

NAMESPACE="sales-rep-namespace"
CHART_PATH="./charts/sales-rep-admin-dashboard"

# Default values
IMAGE_TAG="latest"
IMAGE_REPO="ghcr.io/nivebalu/sales-rep-admin-dashboard"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -r|--repo)
            IMAGE_REPO="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Deploy the SalesRepAdminDashboard Helm chart"
            echo ""
            echo "Options:"
            echo "  -t, --tag TAG         Image tag to deploy (default: latest)"
            echo "  -n, --namespace NS    Namespace to deploy to (default: sales-rep-namespace)"
            echo "  -r, --repo REPO       Image repository (default: ghcr.io/nivebalu/sales-rep-admin-dashboard)"
            echo "  -h, --help            Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

echo "Starting Helm deployment..."

echo "Image repository: $IMAGE_REPO"
echo "Image tag: $IMAGE_TAG"
echo "Namespace: $NAMESPACE"

# Create namespace if it doesn't exist
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# Install or upgrade the release using Helm
if helm status sales-rep-admin-dashboard -n "$NAMESPACE" >/dev/null 2>&1; then
    echo "Updating existing release..."
    helm upgrade sales-rep-admin-dashboard "$CHART_PATH" \
        --namespace "$NAMESPACE" \
        --set image.tag="$IMAGE_TAG" \
        --set image.repository="$IMAGE_REPO" \
        --timeout=300s
else
    echo "Installing new release..."
    helm install sales-rep-admin-dashboard "$CHART_PATH" \
        --namespace "$NAMESPACE" \
        --set image.tag="$IMAGE_TAG" \
        --set image.repository="$IMAGE_REPO" \
        --create-namespace \
        --timeout=300s
fi

# Wait for deployment to be ready
echo "Waiting for deployment to be ready..."
kubectl rollout status deployment/sales-rep-admin-dashboard -n "$NAMESPACE" --timeout=300s

# Show deployment status
echo "Deployment status:"
kubectl get pods -n "$NAMESPACE"

echo "Helm deployment completed!"
echo "Check the status with: kubectl get pods -n $NAMESPACE"
echo "Check Helm status with: helm status sales-rep-admin-dashboard -n $NAMESPACE"