# Kubernetes Manifests Explanation - LinkHub Project

This document provides a detailed breakdown of all Kubernetes (K8s) manifests currently in your project and explains what each configuration does.

---

## Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Detailed Manifest Breakdown](#detailed-manifest-breakdown)
4. [How They Work Together](#how-they-work-together)
5. [Current vs. Production Issues](#current-vs-production-issues)
6. [How to Deploy](#how-to-deploy)

---

## Overview

Your Kubernetes manifests are configuration files (written in YAML) that define how your application should run on a Kubernetes cluster. They describe:

- **Namespaces**: Isolated environments within your cluster
- **Deployments**: How many replicas of your app should run
- **Services**: How to expose and access your deployments
- **Secrets**: How to securely store sensitive data

Your current setup is designed to run your LinkHub application (React frontend + Node.js backend) on any Kubernetes cluster (local, EKS, GKE, etc.).

---

## Directory Structure

```
k8s/
├── namespace.yaml              ← Defines isolated namespace
├── README.md                   ← Basic deployment instructions
├── backend/
│   ├── deployment.yaml         ← Backend container config
│   └── service.yaml            ← Backend network exposure
├── frontend/
│   ├── deployment.yaml         ← Frontend container config
│   └── service.yaml            ← Frontend network exposure
└── secrets/
    ├── secret.yaml             ← MongoDB connection credentials
    └── dockerhub-secret.yaml   ← Docker Hub authentication
```

---

## Detailed Manifest Breakdown

### 1. **Namespace (`namespace.yaml`)**

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: linkhub
```

**What it does:**
- Creates an isolated namespace called `linkhub`
- Acts like a "virtual cluster" within your Kubernetes cluster
- All your resources (pods, services, secrets) will run in this namespace
- Provides logical separation and easier management

**Why you need it:**
- Organizes your app's components separately from other applications
- Allows you to apply resource quotas and access control per namespace
- Makes it easier to delete or reset just your app without affecting other workloads

**Current status:** ✅ Simple and correct

---

### 2. **Secrets (`secrets/secret.yaml`)**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mongodb-atlas-secret
  namespace: linkhub
type: Opaque
stringData:
  connectionString: "mongodb+srv://or:aiFN6NIyv9tm8RWS@linktree.bsyscn0.mongodb.net/?appName=linktree"
```

**What it does:**
- Stores MongoDB connection credentials securely
- Uses `Opaque` type (generic key-value secrets)
- The `connectionString` key contains your MongoDB Atlas connection URL
- Referenced by the backend deployment to connect to the database

**How it works:**
- Kubernetes stores this data in `etcd` (encrypted at rest in production)
- Backend pods read this value via environment variable injection
- Better than hardcoding credentials in the deployment manifest

**Security considerations:**
- ⚠️ **WARNING**: This file contains real MongoDB credentials in plain text
- ❌ Should NOT be committed to Git
- ✅ Should be in `.gitignore`
- For production: Use external secret management (AWS Secrets Manager, HashiCorp Vault)

**Current status:** ⚠️ Works locally but insecure for production

---

### 3. **Docker Hub Secret (`secrets/dockerhub-secret.yaml`)**

```yaml
apiVersion: v1
data:
  .dockerconfigjson: eyJhdXRocyI6eyJodHRwczovL2luZGV4LmRvY2tlci5pby92MS8iOnsidXNlcm5hbWUiOiJvcmxldm92IiwicGFzc3dvcmQiOiI5ODU2NzU4RUwiLCJlbWFpbCI6Im9ybGV2b3YwMkBnbWFpbC5jb20iLCJhdXRoIjoiYjNKc1pYWnZkam81T0RVMk56VTRSVXc9In19fQ==
kind: Secret
metadata:
  name: dockerhub-secret
  namespace: linkhub
type: kubernetes.io/dockerconfigjson
```

**What it does:**
- Stores Docker Hub authentication credentials
- Uses `kubernetes.io/dockerconfigjson` type (Docker registry credentials)
- The encoded `data` contains your Docker username and password
- Allows Kubernetes to pull private images from Docker Hub (if needed)

**Current usage:**
- Your images (`orlevov/finalproject-backend:2.4`, `orlevov/finalproject-frontend:2.5`) are likely public
- This secret isn't currently used in your deployments
- Only needed if you were using private Docker images

**Security considerations:**
- ⚠️ Contains base64-encoded credentials (not encrypted)
- ❌ Should NOT be committed to Git
- For production: Use private container registries with IAM-based authentication

**Current status:** ⚠️ Not actively used but configured

---

### 4. **Backend Deployment (`backend/deployment.yaml`)**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
  namespace: linkhub
  labels:
    app: backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend-container
          image: orlevov/finalproject-backend:2.4
          imagePullPolicy: Never
          ports:
            - containerPort: 5000
          resources:
            limits:
              memory: "256Mi"
              cpu: "500m"
            requests:
              memory: "128Mi"
              cpu: "250m"
          env:
            - name: MONGO_URI
              valueFrom:
                secretKeyRef:
                  name: mongodb-atlas-secret
                  key: connectionString
            - name: PORT
              value: "5000"
            - name: JWT_SECRET
              value: "09c278d68f2b9ace3f8e6b30bf03d81"
```

**What it does:**
- Defines a Kubernetes Deployment for your Node.js backend
- Tells Kubernetes how to run and manage your backend service

**Breaking it down:**

| Section | Explanation |
|---------|------------|
| `metadata.name` | Name of the deployment: `backend-deployment` |
| `metadata.namespace` | Runs in the `linkhub` namespace |
| `labels.app` | Label for identification and selection |
| `replicas: 1` | Runs exactly 1 copy of the backend |
| `selector.matchLabels` | Kubernetes uses this to find pods to manage |
| `image` | Docker image to run: `orlevov/finalproject-backend:2.4` |
| `imagePullPolicy: Never` | Don't try to pull from registry (local testing only) |
| `containerPort: 5000` | Backend listens on port 5000 |
| `resources.requests` | Kubernetes reserves these resources (min guarantee) |
| `resources.limits` | Kubernetes kills pod if it exceeds these resources |
| `env.MONGO_URI` | Injects MongoDB connection from secret |
| `env.PORT` | Sets port environment variable |
| `env.JWT_SECRET` | JWT secret for token generation |

**Resource specifications:**
- **Requests** (guaranteed): 128Mi RAM, 250m CPU
  - CPU in millicores: 250m = 0.25 CPU
  - Used for pod scheduling
- **Limits** (maximum allowed): 256Mi RAM, 500m CPU
  - Pod gets throttled/killed if exceeded

**Issues with current configuration:**

| Issue | Problem | Impact |
|-------|---------|--------|
| `replicas: 1` | Only 1 backend running | No high availability, single point of failure |
| `imagePullPolicy: Never` | Can't pull images from registry | Only works locally, fails on cloud K8s |
| Hardcoded `JWT_SECRET` | Secret visible in manifest | Security issue, should use Secret object |
| No liveness probe | Kubernetes doesn't check if backend is healthy | Dead pods stay running |
| No readiness probe | Kubernetes doesn't know when pod is ready | May route traffic to loading pods |

**Current status:** ⚠️ Works for local testing, not production-ready

---

### 5. **Backend Service (`backend/service.yaml`)**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-svc
  namespace: linkhub
spec:
  selector:
    app: backend
  type: ClusterIP
  ports:
    - protocol: TCP
      port: 5000
      targetPort: 5000
```

**What it does:**
- Exposes the backend deployment within the cluster
- Creates a stable network endpoint for the frontend to communicate with
- Uses `ClusterIP` type (internal-only access)

**Breaking it down:**

| Section | Explanation |
|---------|------------|
| `selector.app: backend` | Routes traffic to pods labeled `app: backend` |
| `type: ClusterIP` | Internal-only service (not exposed to internet) |
| `port: 5000` | Service listens on port 5000 |
| `targetPort: 5000` | Forwards traffic to container port 5000 |

**How it works:**
1. Frontend needs to call backend API
2. Frontend connects to `backend-svc:5000` (DNS name inside cluster)
3. Service load-balances traffic across all backend pods
4. Request reaches backend container on port 5000

**Example frontend code:**
```javascript
// Inside frontend running in K8s cluster
const response = await fetch('http://backend-svc:5000/api/auth/login', {
  method: 'POST',
  // ...
});
```

**Current status:** ✅ Correct for internal communication

---

### 6. **Frontend Deployment (`frontend/deployment.yaml`)**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
  namespace: linkhub
  labels:
    app: frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend-container
          image: orlevov/finalproject-frontend:2.5
          imagePullPolicy: Never
          ports:
            - containerPort: 3000
          resources:
            limits:
              memory: "512Mi"
              cpu: "500m"
            requests:
              memory: "256Mi"
              cpu: "250m"
```

**What it does:**
- Defines a Kubernetes Deployment for your React frontend
- Similar structure to backend but runs the frontend app

**Key differences from backend:**

| Aspect | Backend | Frontend |
|--------|---------|----------|
| Container port | 5000 | 3000 |
| Memory request | 128Mi | 256Mi |
| Image tag | 2.4 | 2.5 |
| Environment variables | Has MONGO_URI, JWT_SECRET | None needed |
| Replicas | 1 | 1 |

**Why more memory for frontend:**
- React apps bundle all dependencies into the browser
- JavaScript framework takes more memory than minimal backend APIs

**Issues with current configuration:**
- `replicas: 1` - No high availability
- `imagePullPolicy: Never` - Only works locally
- No environment variables for API endpoint (hardcoded in code)
- No health checks

**Current status:** ⚠️ Works for local testing, not production-ready

---

### 7. **Frontend Service (`frontend/service.yaml`)**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-svc
  namespace: linkhub
spec:
  selector:
    app: frontend
  type: LoadBalancer
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
```

**What it does:**
- Exposes the frontend deployment to the internet
- Creates an external IP/DNS name for users to access the app
- Uses `LoadBalancer` type (external access)

**Breaking it down:**

| Section | Explanation |
|---------|------------|
| `type: LoadBalancer` | Exposes to internet, creates external IP |
| `port: 80` | External port (HTTP standard) |
| `targetPort: 3000` | Internal container port |

**How it works:**

```
User Browser
    ↓ (http://external-ip:80)
LoadBalancer Service
    ↓ (routes to port 3000)
Frontend Pod
    ↓ (runs React app on :3000)
Browser gets HTML/JS/CSS
```

**Service types in Kubernetes:**

| Type | Access | Use Case |
|------|--------|----------|
| **ClusterIP** | Internal only | Backend services |
| **NodePort** | Node IP + port | Testing, internal routing |
| **LoadBalancer** | External IP + port | Public-facing apps |
| **ExternalName** | DNS CNAME | External service routing |

**Current status:** ✅ Correct for external access

---

## How They Work Together

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  Kubernetes Cluster                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Namespace: linkhub                                         │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                       │ │
│  │  ┌──────────────────────────────────────────────┐   │ │
│  │  │  Frontend LoadBalancer Service              │   │ │
│  │  │  - Listens on 0.0.0.0:80                    │   │ │
│  │  │  - Routes to pod port 3000                  │   │ │
│  │  │  - Creates external IP (cloud) or NodePort  │   │ │
│  │  └──────────────────────────────────────────────┘   │ │
│  │           ↓ Routes traffic                           │ │
│  │  ┌──────────────────────────────────────────────┐   │ │
│  │  │  Frontend Deployment (replicas: 1)          │   │ │
│  │  │  ┌────────────────────────────────────────┐ │   │ │
│  │  │  │ Pod: frontend-deployment-xxx           │ │   │ │
│  │  │  │ Image: orlevov/finalproject-...:2.5    │ │   │ │
│  │  │  │ Port: 3000 (React app)                │ │   │ │
│  │  │  │ Memory: 256-512Mi                     │ │   │ │
│  │  │  │ CPU: 250-500m                         │ │   │ │
│  │  │  └────────────────────────────────────────┘ │   │ │
│  │  └──────────────────────────────────────────────┘   │ │
│  │                                                       │ │
│  │  Frontend pod makes API calls to backend             │ │
│  │           ↓                                           │ │
│  │           → http://backend-svc:5000/api/*            │ │
│  │           ↓                                           │ │
│  │  ┌──────────────────────────────────────────────┐   │ │
│  │  │  Backend ClusterIP Service                  │   │ │
│  │  │  - Internal DNS name: backend-svc          │   │ │
│  │  │  - Listens on port 5000                    │   │ │
│  │  │  - Only accessible from within cluster     │   │ │
│  │  └──────────────────────────────────────────────┘   │ │
│  │           ↓ Routes traffic                           │ │
│  │  ┌──────────────────────────────────────────────┐   │ │
│  │  │  Backend Deployment (replicas: 1)           │   │ │
│  │  │  ┌────────────────────────────────────────┐ │   │ │
│  │  │  │ Pod: backend-deployment-xxx            │ │   │ │
│  │  │  │ Image: orlevov/finalproject-...:2.4    │ │   │ │
│  │  │  │ Port: 5000 (Node.js Express API)      │ │   │ │
│  │  │  │ Memory: 128-256Mi                     │ │   │ │
│  │  │  │ CPU: 250-500m                         │ │   │ │
│  │  │  │ Env: MONGO_URI (from Secret)         │ │   │ │
│  │  │  │ Env: JWT_SECRET                      │ │   │ │
│  │  │  └────────────────────────────────────────┘ │   │ │
│  │  └──────────────────────────────────────────────┘   │ │
│  │           ↓ Connects to MongoDB                      │ │
│  │           → mongodb+srv://or:aiFN6NIyv9tm@...       │ │
│  │                                                       │ │
│  │  ┌──────────────────────────────────────────────┐   │ │
│  │  │  Secrets                                    │   │ │
│  │  │  - mongodb-atlas-secret                    │   │ │
│  │  │    (connectionString)                      │   │ │
│  │  │  - dockerhub-secret                        │   │ │
│  │  │    (Docker credentials - unused)           │   │ │
│  │  └──────────────────────────────────────────────┘   │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         ↓
    ┌─────────────────┐
    │ MongoDB Atlas   │
    │ (Cloud DB)      │
    └─────────────────┘
```

### Data Flow Example

**User accessing your app:**

```
1. User opens browser → http://your-external-ip
2. LoadBalancer Service receives request on port 80
3. Routes to Frontend Pod on port 3000
4. Frontend pod returns React HTML/CSS/JS
5. Browser loads React app
6. User logs in
7. React frontend sends request to backend-svc:5000/api/auth/login
8. Backend Pod receives request
9. Backend connects to MongoDB using MONGO_URI from Secret
10. Backend validates credentials, generates JWT token
11. Returns token to frontend
12. User can now access dashboard
```

---

## Current vs. Production Issues

### Issues in Current Configuration

| Issue | Current State | Production Impact | Fix Required |
|-------|---------------|-------------------|--------------|
| **Replicas** | 1 each | Pod dies = app down | Use `replicas: 2+` with pod disruption budgets |
| **Image Pull Policy** | `Never` | Can't deploy to cloud | Change to `IfNotPresent` or `Always` |
| **JWT Secret** | Hardcoded in manifest | Security breach | Move to Secret object |
| **Health Checks** | None | Dead pods stay running | Add liveness/readiness probes |
| **Resource Limits** | Set but basic | May OOM or throttle | Monitor and adjust based on metrics |
| **Image Tags** | Fixed (2.4, 2.5) | No auto-updates | Use CI/CD to update on new builds |
| **Ingress** | No Ingress defined | No domain routing | Add Ingress for DNS-based routing |
| **ConfigMap** | No ConfigMap | Backend URL hardcoded | Use ConfigMap for environment-specific config |
| **Auto-scaling** | No HPA | Manual scaling only | Add Horizontal Pod Autoscaler |
| **Network Policies** | None | No traffic control | Add NetworkPolicy for security |

### Recommended Production Improvements

```yaml
# Example: Better liveness probe
livenessProbe:
  httpGet:
    path: /api/health
    port: 5000
  initialDelaySeconds: 30
  periodSeconds: 10

# Example: Better readiness probe
readinessProbe:
  httpGet:
    path: /api/ready
    port: 5000
  initialDelaySeconds: 10
  periodSeconds: 5

# Example: Pod Disruption Budget (for updates without downtime)
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: backend-pdb
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: backend
```

---

## How to Deploy

### Deploy Locally (for testing)

```powershell
# 1. Create namespace
kubectl apply -f k8s/namespace.yaml

# 2. Create secrets
kubectl apply -f k8s/secrets/secret.yaml
kubectl apply -f k8s/secrets/dockerhub-secret.yaml

# 3. Deploy backend
kubectl apply -f k8s/backend/deployment.yaml
kubectl apply -f k8s/backend/service.yaml

# 4. Deploy frontend
kubectl apply -f k8s/frontend/deployment.yaml
kubectl apply -f k8s/frontend/service.yaml

# 5. Verify deployment
kubectl get all -n linkhub

# 6. Get frontend URL
kubectl get svc frontend-svc -n linkhub
# Copy the EXTERNAL-IP (or use port-forward for local)

# 7. Access app
# Local: kubectl port-forward -n linkhub svc/frontend-svc 3000:80
# Then open: http://localhost:3000
```

### Deploy to EKS (via Terraform)

Your Terraform files (in `terraform/kubernetes.tf`) will:
1. Create the `linkhub` namespace
2. Apply backend and frontend deployments
3. Create services
4. Inject secrets from Terraform variables

This is what we covered in `TERRAFORM_EKS_DEPLOYMENT.md`.

### Manual Deployment to Cloud K8s

Before deploying to cloud (EKS, GKE, AKS):

1. **Change image pull policy:**
   ```yaml
   imagePullPolicy: IfNotPresent  # or Always
   ```

2. **Update image names:**
   - Ensure images are pushed to Docker Hub
   - Use full path: `docker.io/orlevov/finalproject-backend:latest`

3. **Use external secrets:**
   - Don't hardcode `JWT_SECRET` in deployment
   - Create a Kubernetes Secret:
     ```bash
     kubectl create secret generic jwt-secret \
       --from-literal=jwt-secret='your-random-jwt-key' \
       -n linkhub
     ```

4. **Update MongoDB connection:**
   - Ensure MongoDB IP whitelist includes your K8s cluster
   - Update `secret.yaml` with correct credentials

5. **Set multiple replicas:**
   ```yaml
   replicas: 2  # or more for production
   ```

6. **Apply all manifests:**
   ```bash
   kubectl apply -k k8s/  # Uses kustomization.yaml if present
   ```

---

## Summary

### What You Currently Have

✅ **Basic production-ready structure:**
- Namespace for isolation
- Deployments for both services
- Services for networking (internal + external)
- Secrets for credentials
- Resource limits defined

⚠️ **Issues for production:**
- Only 1 replica each (no high availability)
- `imagePullPolicy: Never` (can't use on cloud)
- Hardcoded JWT_SECRET (security issue)
- No health checks
- No auto-scaling
- No Ingress for domain routing

### Next Steps to Production

1. **Fix image pull policy** → Use `IfNotPresent` or `Always`
2. **Move JWT to Secret** → Don't hardcode in deployment
3. **Increase replicas** → Use at least 2 for backend/frontend
4. **Add health probes** → Liveness and readiness checks
5. **Set up Ingress** → Domain-based routing
6. **Configure auto-scaling** → Horizontal Pod Autoscaler
7. **Use the Terraform setup** → For cloud deployment to EKS

Your manifests form a solid foundation. With the fixes above, you'll have a production-ready setup ready to deploy to AWS EKS using Terraform!

