# Kubernetes Manifests for Linktree

This directory contains all Kubernetes manifests for deploying the Linktree application.

## 📋 Files Overview

| File | Purpose |
|------|---------|
| `namespace.yaml` | Creates isolated namespace for the app |
| `mongodb-secret.yaml` | Stores MongoDB credentials securely |
| `backend-deployment.yaml` | Deployment config for backend service |
| `backend-service.yaml` | Exposes backend service internally |
| `frontend-deployment.yaml` | Deployment config for frontend service |
| `frontend-service.yaml` | Exposes frontend service externally |
| `ingress.yaml` | Routes external traffic (optional) |
| `kustomization.yaml` | Bundles all manifests for easy deployment |

## 🚀 Quick Start

### Prerequisites
- Kubernetes cluster running (kubectl configured)
- Docker images pushed to Docker Hub
- kubectl installed

### Deploy All at Once

```bash
# Using Kustomize (recommended)
kubectl apply -k k8s/

# Or deploy individual files
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/mongodb-secret.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

### Verify Deployment

```bash
# Check namespace
kubectl get namespace

# Check deployments
kubectl get deployments -n linktree

# Check pods
kubectl get pods -n linktree

# Check services
kubectl get services -n linktree

# View logs
kubectl logs -n linktree -l app=backend
kubectl logs -n linktree -l app=frontend

# Port forward to access locally
kubectl port-forward -n linktree svc/frontend-service 3000:80
kubectl port-forward -n linktree svc/backend-service 5000:5000
```

## 🔐 Secrets Management

### Update MongoDB Credentials

Edit `mongodb-secret.yaml` with your actual credentials:

```yaml
stringData:
  mongo-uri: "mongodb+srv://username:password@cluster.mongodb.net/db"
  jwt-secret: "your-secret-key"
```

Then apply:
```bash
kubectl apply -f k8s/mongodb-secret.yaml
```

**⚠️ IMPORTANT:** Never commit secrets to Git! Use `.gitignore` for these files in production.

## 🖼️ Architecture

```
┌─────────────────────────────────────┐
│        Kubernetes Cluster           │
├─────────────────────────────────────┤
│  Namespace: linktree                │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Frontend Deployment (2)    │  │
│  │   - Pod 1                    │  │
│  │   - Pod 2                    │  │
│  │   Service (LoadBalancer)     │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Backend Deployment (2)     │  │
│  │   - Pod 1                    │  │
│  │   - Pod 2                    │  │
│  │   Service (ClusterIP)        │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Secrets                    │  │
│  │   - MongoDB URI              │  │
│  │   - JWT Secret               │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
         ↓
MongoDB Atlas (Cloud)

## 🚀 Next Steps

1. Configure Ingress for domain-based routing
2. Set up CI/CD pipeline to auto-deploy on image changes
3. Configure horizontal pod autoscaling (HPA)
4. Set up monitoring with Prometheus/Grafana
5. Configure backup strategy for MongoDB

---

For more information, see the main [README.md](../README.md)
