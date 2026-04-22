# Kubernetes Deployment Setup

This document explains how to set up your VPS with K3s, Helm, and Traefik to deploy the SalesRepAdminDashboard application.

## Prerequisites

### VPS Setup

- A VPS with at least 2GB RAM (K3s has minimal resource requirements)
- Ubuntu 20.04 or later (or similar Linux distribution)
- SSH access to your VPS
- Domain name pointing to your VPS IP address (optional, but recommended for TLS)
- Helm installed on your VPS

## VPS Configuration

### 1. Install K3s on your VPS

Connect to your VPS via SSH and run:

```bash
curl -sfL https://get.k3s.io | sh -
```

This will install K3s with default settings. Traefik is included by default with K3s.

### 2. Configure kubectl

After installing K3s, you'll need to configure kubectl to connect to your cluster:

```bash
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $USER:$USER ~/.kube/config
chmod 600 ~/.kube/config
```

Alternatively, you can run kubectl commands with sudo:

```bash
kubectl get nodes
```

### 3. Verify Helm is installed

Check that Helm is properly installed:

```bash
helm version
```

## GitHub Configuration

### 1. Set up GitHub Secrets

You need to configure the following secrets in your GitHub repository:

- `K3S_HOST`: Your VPS IP address (173.249.27.177 based on the information provided)
- `K3S_USERNAME`: Your VPS SSH username (vickylance)
- `K3S_SSH_KEY`: Your SSH private key content for accessing the VPS
- `GHCR_PAT`: A GitHub Personal Access Token with package:write permissions

### 2. Configure Environment

You'll also need to set up a GitHub environment named `production` for the workflow.

## GitHub Secrets Setup

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret" and add each of the following:

- **Name**: `K3S_HOST`, **Value**: `173.249.27.177`
- **Name**: `K3S_USERNAME`, **Value**: `vickylance`
- **Name**: `K3S_SSH_KEY`, **Value**: Paste your SSH private key content
- **Name**: `GHCR_PAT`, **Value**: Your GitHub Personal Access Token

## GitHub Environment Setup

1. In your repository, go to Settings > Environments
2. Click "New environment"
3. Name it `production`
4. Under "Environment secrets", add the same secrets as above

## Domain Configuration

1. Update the `charts/sales-rep-admin-dashboard/values.yaml` file with your actual domain name instead of `sales-rep.yourdomain.com`
2. Point your domain's A record to your VPS IP address (173.249.27.177)

## SSL/TLS Configuration

Traefik should automatically obtain SSL certificates if you're using a real domain name. If you're using a test domain or IP address, you might need to adjust the TLS configuration accordingly.

## Testing the Setup

After setting up everything:

1. Trigger the manual deployment workflow from GitHub Actions
2. Select the image tag you want to deploy
3. Check the GitHub Actions workflow logs
4. Verify the deployment in your Kubernetes cluster:
   ```bash
   kubectl get pods -n sales-rep-namespace
   kubectl get services -n sales-rep-namespace
   kubectl get ingress -n sales-rep-namespace
   ```

## Local Helm Deployment (Optional)

If you want to deploy manually from your local machine:

1. Update your values file with the correct domain, image tag, etc.
2. Run the following from the repository root:
   ```bash
   helm install sales-rep-admin-dashboard ./charts/sales-rep-admin-dashboard \
     --namespace sales-rep-namespace \
     --set image.tag="latest" \
     --create-namespace
   ```

## Troubleshooting

### Check K3s Status

```bash
sudo systemctl status k3s
```

### Check Cluster Status

```bash
kubectl get nodes
kubectl get pods --all-namespaces
```

### View Logs

```bash
kubectl logs -n sales-rep-namespace deployment/sales-rep-admin-dashboard
```

### Check Ingress

```bash
kubectl describe ingress -n sales-rep-namespace sales-rep-admin-dashboard
```

### Check Helm Status

```bash
helm list -n sales-rep-namespace
helm status sales-rep-admin-dashboard -n sales-rep-namespace
```

## Security Considerations

- Restrict SSH access to specific IPs if possible
- Use strong authentication for your VPS
- Keep K3s and Helm updated
- Regularly rotate your GitHub Personal Access Token
- Consider setting up a firewall on your VPS
