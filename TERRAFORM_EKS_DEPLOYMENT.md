# Complete Terraform to EKS Deployment Guide

This guide provides step-by-step instructions to deploy your LinkHub application to AWS EKS using Terraform.

---

## Table of Contents

1. [Prerequisites & Setup](#prerequisites--setup)
2. [Terraform File Contents](#terraform-file-contents)
3. [Deployment Execution Steps](#deployment-execution-steps)
4. [Verification & Access](#verification--access)
5. [Troubleshooting](#troubleshooting)
6. [Cleanup](#cleanup)

---

## Prerequisites & Setup

### Step 1: Install Required Tools

Run the following commands in PowerShell:

```powershell
# Install Terraform (if not already installed)
choco install terraform

# Install AWS CLI v2
choco install awscli

# Install kubectl
choco install kubernetes-cli

# Verify all installations
terraform --version
aws --version
kubectl version --client
```

### Step 2: Create AWS Account & IAM User

1. Go to https://aws.amazon.com and create a free account
2. Sign in to AWS Console
3. Navigate to **IAM (Identity and Access Management)**
4. Click **Users** in the left sidebar
5. Click **Create user** button
6. Enter username: `terraform-user`
7. Click **Next**
8. Click **Attach policies directly**
9. Search for and select: `AdministratorAccess`
   - (Or for security: select `AmazonEKSFullAccess`, `AmazonVPCFullAccess`, `AmazonEC2FullAccess`, `IAMFullAccess`)
10. Click **Next** → **Create user**
11. Click on the created user
12. Click **Security credentials** tab
13. Click **Create access key**
14. Select **Command Line Interface (CLI)**
15. Check "I understand the above recommendation..."
16. Click **Next** → **Create access key**
17. **Download the CSV file** (SAVE THIS SAFELY - you'll need Access Key ID and Secret Access Key)

### Step 3: Configure AWS CLI

Run in PowerShell:

```powershell
aws configure
```

When prompted, enter:
- **AWS Access Key ID**: [paste from CSV]
- **AWS Secret Access Key**: [paste from CSV]
- **Default region**: us-east-1
- **Default output format**: json

Verify connection:

```powershell
aws sts get-caller-identity
# Should output your AWS account info
```

### Step 4: Verify Docker Images Exist

```powershell
# Check your Docker Hub images are uploaded
docker pull orlevov/linktree-backend:latest
docker pull orlevov/linktree-frontend:latest
# Both should pull successfully
```

### Step 5: Get MongoDB Atlas Connection String

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign in to your MongoDB Atlas account
3. Go to your cluster
4. Click **Connect**
5. Choose **Drivers** → **Node.js**
6. Copy the connection string: `mongodb+srv://username:password@cluster.mongodb.net/linktree?retryWrites=true&w=majority`
7. Keep this handy - you'll need it for `terraform.tfvars`

---

## Terraform File Contents

### Step 6: Fill `terraform/variables.tf`

Open the file `terraform/variables.tf` and copy/paste this entire content:

```hcl
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "linktree-eks"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "node_count" {
  description = "Number of worker nodes"
  type        = number
  default     = 2
}

variable "node_instance_type" {
  description = "EC2 instance type for worker nodes"
  type        = string
  default     = "t3.medium"
}

variable "backend_image" {
  description = "Docker image for backend service"
  type        = string
  default     = "orlevov/linktree-backend:latest"
}

variable "frontend_image" {
  description = "Docker image for frontend service"
  type        = string
  default     = "orlevov/linktree-frontend:latest"
}

variable "jwt_secret" {
  description = "JWT secret key for authentication"
  type        = string
  sensitive   = true
}

variable "mongo_uri" {
  description = "MongoDB Atlas connection string"
  type        = string
  sensitive   = true
}
```

### Step 7: Fill `terraform/terraform.tfvars`

Open the file `terraform/terraform.tfvars` and copy/paste this content:

```hcl
aws_region           = "us-east-1"
cluster_name         = "linktree-eks"
environment          = "production"
node_count           = 2
node_instance_type   = "t3.medium"
backend_image        = "orlevov/linktree-backend:latest"
frontend_image       = "orlevov/linktree-frontend:latest"
jwt_secret           = "your-secret-jwt-key-change-this-to-random-string"
mongo_uri            = "mongodb+srv://username:password@cluster.mongodb.net/linktree?retryWrites=true&w=majority"
```

**⚠️ IMPORTANT:** 
- Replace `your-secret-jwt-key-change-this-to-random-string` with a strong random string (generate from https://randomkeygen.com/)
- Replace MongoDB URI with your actual MongoDB Atlas connection string
- **Add this file to `.gitignore` before committing!**

Add to `.gitignore`:
```
terraform.tfvars
```

### Step 8: Fill `terraform/networking.tf`

Open the file `terraform/networking.tf` and copy/paste this entire content:

```hcl
# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.cluster_name}-vpc"
    Environment = var.environment
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "${var.cluster_name}-igw"
    Environment = var.environment
  }
}

# Public Subnets (for ALB and NAT)
resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.cluster_name}-public-subnet-1"
    Environment = var.environment
  }
}

resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = data.aws_availability_zones.available.names[1]
  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.cluster_name}-public-subnet-2"
    Environment = var.environment
  }
}

# Private Subnets (for EKS nodes)
resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = {
    Name        = "${var.cluster_name}-private-subnet-1"
    Environment = var.environment
  }
}

resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.12.0/24"
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = {
    Name        = "${var.cluster_name}-private-subnet-2"
    Environment = var.environment
  }
}

# Elastic IP for NAT Gateway
resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name        = "${var.cluster_name}-eip"
    Environment = var.environment
  }

  depends_on = [aws_internet_gateway.main]
}

# NAT Gateway (in public subnet for private nodes to access internet)
resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_1.id

  tags = {
    Name        = "${var.cluster_name}-nat"
    Environment = var.environment
  }

  depends_on = [aws_internet_gateway.main]
}

# Route Table for Public Subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block      = "0.0.0.0/0"
    gateway_id      = aws_internet_gateway.main.id
  }

  tags = {
    Name        = "${var.cluster_name}-public-rt"
    Environment = var.environment
  }
}

# Associate Public Route Table with Public Subnets
resource "aws_route_table_association" "public_1" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}

# Route Table for Private Subnets
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = {
    Name        = "${var.cluster_name}-private-rt"
    Environment = var.environment
  }
}

# Associate Private Route Table with Private Subnets
resource "aws_route_table_association" "private_1" {
  subnet_id      = aws_subnet.private_1.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_2" {
  subnet_id      = aws_subnet.private_2.id
  route_table_id = aws_route_table.private.id
}

# Security Group for EKS Control Plane
resource "aws_security_group" "cluster" {
  name        = "${var.cluster_name}-cluster-sg"
  description = "Security group for EKS cluster"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.cluster_name}-cluster-sg"
    Environment = var.environment
  }
}

# Security Group for Worker Nodes
resource "aws_security_group" "node" {
  name        = "${var.cluster_name}-node-sg"
  description = "Security group for EKS worker nodes"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.cluster.id]
  }

  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.cluster_name}-node-sg"
    Environment = var.environment
  }
}

# Data source for availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

# Outputs for networking
output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = [aws_subnet.public_1.id, aws_subnet.public_2.id]
}

output "private_subnet_ids" {
  value = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}

output "cluster_security_group_id" {
  value = aws_security_group.cluster.id
}

output "node_security_group_id" {
  value = aws_security_group.node.id
}
```

### Step 9: Fill `terraform/iam.tf`

Open the file `terraform/iam.tf` and copy/paste this entire content:

```hcl
# EKS Cluster IAM Role
resource "aws_iam_role" "cluster" {
  name = "${var.cluster_name}-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
  }
}

# Attach EKS Service Policy to Cluster Role
resource "aws_iam_role_policy_attachment" "cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSServiceRolePolicy"
  role       = aws_iam_role.cluster.name
}

# Attach VPC Resource Controller Policy to Cluster Role
resource "aws_iam_role_policy_attachment" "cluster_vpc_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
  role       = aws_iam_role.cluster.name
}

# EKS Node Group IAM Role
resource "aws_iam_role" "node" {
  name = "${var.cluster_name}-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
  }
}

# Attach Worker Node Policy to Node Role
resource "aws_iam_role_policy_attachment" "node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.node.name
}

# Attach CNI Policy to Node Role (for networking)
resource "aws_iam_role_policy_attachment" "node_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.node.name
}

# Attach ECR Read-Only Policy to Node Role (to pull Docker images)
resource "aws_iam_role_policy_attachment" "node_ecr_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.node.name
}

# Output IAM role ARNs
output "cluster_role_arn" {
  value = aws_iam_role.cluster.arn
}

output "node_role_arn" {
  value = aws_iam_role.node.arn
}
```

### Step 10: Fill `terraform/main.tf`

Open the file `terraform/main.tf` and copy/paste this entire content:

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Local variables for tagging
locals {
  cluster_name = var.cluster_name
  environment  = var.environment

  tags = {
    Name        = local.cluster_name
    Environment = local.environment
    ManagedBy   = "Terraform"
  }
}

# EKS Cluster
resource "aws_eks_cluster" "main" {
  name     = local.cluster_name
  role_arn = aws_iam_role.cluster.arn
  version  = "1.28"

  vpc_config {
    subnet_ids              = concat([aws_subnet.public_1.id, aws_subnet.public_2.id], [aws_subnet.private_1.id, aws_subnet.private_2.id])
    security_groups         = [aws_security_group.cluster.id]
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  depends_on = [
    aws_iam_role_policy_attachment.cluster_policy,
    aws_iam_role_policy_attachment.cluster_vpc_policy,
  ]

  tags = local.tags
}

# EKS Node Group
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${local.cluster_name}-node-group"
  node_role_arn   = aws_iam_role.node.arn

  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]

  scaling_config {
    desired_size = var.node_count
    max_size     = var.node_count + 2
    min_size     = var.node_count
  }

  instance_types = [var.node_instance_type]

  depends_on = [
    aws_iam_role_policy_attachment.node_policy,
    aws_iam_role_policy_attachment.node_cni_policy,
    aws_iam_role_policy_attachment.node_ecr_policy,
  ]

  tags = local.tags

  lifecycle {
    create_before_destroy = true
  }
}

# Configure Kubernetes Provider
provider "kubernetes" {
  host                   = aws_eks_cluster.main.endpoint
  cluster_ca_certificate = base64decode(aws_eks_cluster.main.certificate_authority[0].data)
  token                  = data.aws_eks_auth.cluster.token
}

# Get auth token for Kubernetes provider
data "aws_eks_auth" "cluster" {
  name = aws_eks_cluster.main.name
}

# Output cluster information
output "cluster_endpoint" {
  value       = aws_eks_cluster.main.endpoint
  description = "EKS cluster endpoint"
}

output "cluster_security_group_id" {
  value       = aws_security_group.cluster.id
  description = "Security group ID for the EKS cluster"
}

output "cluster_iam_role_arn" {
  value       = aws_iam_role.cluster.arn
  description = "IAM role ARN for the EKS cluster"
}

output "node_group_id" {
  value       = aws_eks_node_group.main.id
  description = "EKS node group ID"
}
```

### Step 11: Fill `terraform/kubernetes.tf`

Open the file `terraform/kubernetes.tf` and copy/paste this entire content:

```hcl
# Create namespace for the application
resource "kubernetes_namespace" "linktree" {
  metadata {
    name = "linktree"
  }

  depends_on = [aws_eks_node_group.main]
}

# Backend Deployment
resource "kubernetes_deployment" "backend" {
  metadata {
    name      = "linktree-backend"
    namespace = kubernetes_namespace.linktree.metadata[0].name

    labels = {
      app = "linktree-backend"
    }
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        app = "linktree-backend"
      }
    }

    template {
      metadata {
        labels = {
          app = "linktree-backend"
        }
      }

      spec {
        container {
          image            = var.backend_image
          image_pull_policy = "Always"
          name             = "backend"

          port {
            container_port = 5000
          }

          env {
            name = "MONGO_URI"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.mongodb.metadata[0].name
                key  = "mongo_uri"
              }
            }
          }

          env {
            name = "JWT_SECRET"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.jwt.metadata[0].name
                key  = "jwt_secret"
              }
            }
          }

          env {
            name  = "NODE_ENV"
            value = "production"
          }

          resources {
            requests = {
              cpu    = "250m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }
        }
      }
    }
  }

  depends_on = [
    kubernetes_namespace.linktree,
    kubernetes_secret.mongodb,
    kubernetes_secret.jwt,
  ]
}

# Backend Service
resource "kubernetes_service" "backend" {
  metadata {
    name      = "linktree-backend"
    namespace = kubernetes_namespace.linktree.metadata[0].name
  }

  spec {
    selector = {
      app = "linktree-backend"
    }

    type = "ClusterIP"

    port {
      port        = 80
      target_port = 5000
      protocol    = "TCP"
    }
  }

  depends_on = [kubernetes_deployment.backend]
}

# Frontend Deployment
resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = "linktree-frontend"
    namespace = kubernetes_namespace.linktree.metadata[0].name

    labels = {
      app = "linktree-frontend"
    }
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        app = "linktree-frontend"
      }
    }

    template {
      metadata {
        labels = {
          app = "linktree-frontend"
        }
      }

      spec {
        container {
          image            = var.frontend_image
          image_pull_policy = "Always"
          name             = "frontend"

          port {
            container_port = 3000
          }

          resources {
            requests = {
              cpu    = "128m"
              memory = "128Mi"
            }
            limits = {
              cpu    = "256m"
              memory = "256Mi"
            }
          }
        }
      }
    }
  }

  depends_on = [kubernetes_namespace.linktree]
}

# Frontend Service (LoadBalancer)
resource "kubernetes_service" "frontend" {
  metadata {
    name      = "linktree-frontend"
    namespace = kubernetes_namespace.linktree.metadata[0].name
  }

  spec {
    selector = {
      app = "linktree-frontend"
    }

    type = "LoadBalancer"

    port {
      port        = 80
      target_port = 3000
      protocol    = "TCP"
    }
  }

  depends_on = [kubernetes_deployment.frontend]
}

output "backend_service_ip" {
  value       = kubernetes_service.backend.spec[0].cluster_ip
  description = "Backend service cluster IP"
}

output "frontend_service_endpoint" {
  value       = try(kubernetes_service.frontend.status[0].load_balancer[0].ingress[0].hostname, "Pending...")
  description = "Frontend LoadBalancer endpoint"
}
```

### Step 12: Fill `terraform/secrets.tf`

Open the file `terraform/secrets.tf` and copy/paste this entire content:

```hcl
# MongoDB URI Secret
resource "kubernetes_secret" "mongodb" {
  metadata {
    name      = "mongodb-secret"
    namespace = kubernetes_namespace.linktree.metadata[0].name
  }

  data = {
    mongo_uri = var.mongo_uri
  }

  type = "Opaque"

  depends_on = [kubernetes_namespace.linktree]
}

# JWT Secret
resource "kubernetes_secret" "jwt" {
  metadata {
    name      = "jwt-secret"
    namespace = kubernetes_namespace.linktree.metadata[0].name
  }

  data = {
    jwt_secret = var.jwt_secret
  }

  type = "Opaque"

  depends_on = [kubernetes_namespace.linktree]
}
```

### Step 13: Fill `terraform/outputs.tf`

Open the file `terraform/outputs.tf` and copy/paste this entire content:

```hcl
output "cluster_name" {
  value       = aws_eks_cluster.main.name
  description = "EKS cluster name"
}

output "cluster_endpoint" {
  value       = aws_eks_cluster.main.endpoint
  description = "EKS cluster API endpoint"
}

output "cluster_version" {
  value       = aws_eks_cluster.main.version
  description = "EKS cluster version"
}

output "region" {
  value       = var.aws_region
  description = "AWS region"
}

output "vpc_id" {
  value       = aws_vpc.main.id
  description = "VPC ID"
}

output "node_group_id" {
  value       = aws_eks_node_group.main.id
  description = "EKS node group ID"
}

output "node_group_status" {
  value       = aws_eks_node_group.main.status
  description = "EKS node group status"
}

output "frontend_service_endpoint" {
  value       = try(kubernetes_service.frontend.status[0].load_balancer[0].ingress[0].hostname, "Waiting for LoadBalancer to be provisioned...")
  description = "Frontend LoadBalancer endpoint (access your app here)"
}

output "backend_service_cluster_ip" {
  value       = kubernetes_service.backend.spec[0].cluster_ip
  description = "Backend service internal cluster IP"
}

output "namespace" {
  value       = kubernetes_namespace.linktree.metadata[0].name
  description = "Kubernetes namespace for the application"
}

output "kubeconfig_update_command" {
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${aws_eks_cluster.main.name}"
  description = "Command to update local kubeconfig"
}
```

### Step 14: Update `terraform/.gitignore`

Open the file `terraform/.gitignore` and copy/paste this content:

```
# Terraform files
.terraform/
.terraform.lock.hcl
*.tfstate
*.tfstate.*
*.tfstate.backup

# Environment/Secrets
terraform.tfvars
.env
*.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

---

## Deployment Execution Steps

### Step 15: Navigate to Terraform Directory

Open PowerShell and run:

```powershell
cd "C:\Users\orlev\OneDrive\Desktop\DevOps Projects\final project\terraform"
```

### Step 16: Initialize Terraform

```powershell
terraform init
```

**What this does:**
- Downloads the required provider plugins (AWS, Kubernetes)
- Creates `.terraform` directory
- Sets up Terraform backend

**Duration:** 1-2 minutes

### Step 17: Validate Terraform Configuration

```powershell
terraform validate
```

**What this does:**
- Checks for syntax errors in your configuration files
- Validates HCL syntax

### Step 18: Review Deployment Plan

```powershell
terraform plan -out=tfplan
```

**What this does:**
- Shows all resources that will be created
- Displays the plan without applying it
- Creates `tfplan` file for use in the apply step

**Duration:** 2-3 minutes

**Review the output carefully** to ensure everything looks correct:
- VPC and subnets
- Security groups
- IAM roles
- EKS cluster
- Node group
- Kubernetes deployments and services

### Step 19: Apply Terraform Configuration

```powershell
terraform apply tfplan
```

**⚠️ WARNING:** This command will create AWS resources and **you will be charged** for them!

**What this does:**
- Creates VPC with subnets, security groups, NAT gateway
- Creates IAM roles and policies
- Creates EKS cluster (15-20 minutes)
- Creates 2 worker nodes (5-10 minutes)
- Deploys backend and frontend to Kubernetes
- Creates MongoDB and JWT secrets
- Creates LoadBalancer for frontend access

**Total time: 20-30 minutes**

Once the deployment completes, you'll see output like:

```
Apply complete! Resources added: 47.

Outputs:

cluster_name = "linktree-eks"
cluster_endpoint = "https://xxx.eks.us-east-1.amazonaws.com"
frontend_service_endpoint = "aBc123.elb.us-east-1.amazonaws.com"
kubeconfig_update_command = "aws eks update-kubeconfig --region us-east-1 --name linktree-eks"
...
```

---

## Verification & Access

### Step 20: Update Local kubeconfig

After Terraform completes, run:

```powershell
aws eks update-kubeconfig --region us-east-1 --name linktree-eks
```

This configures `kubectl` to connect to your EKS cluster.

### Step 21: Verify Cluster Connection

```powershell
# Check cluster info
kubectl cluster-info

# List worker nodes
kubectl get nodes

# List all pods in linktree namespace
kubectl get pods -n linktree

# List all services
kubectl get svc -n linktree
```

Expected output:
```
NAME                                          STATUS   ROLES    AGE   VERSION
ip-10-0-11-xxx.ec2.internal                   Ready    <none>   5m    v1.28.x
ip-10-0-12-xxx.ec2.internal                   Ready    <none>   5m    v1.28.x

NAME                          READY   STATUS    RESTARTS   AGE
linktree-backend-xxx-yyyy      1/1     Running   0          2m
linktree-backend-xxx-zzzz      1/1     Running   0          2m
linktree-frontend-xxx-aaaa     1/1     Running   0          2m
linktree-frontend-xxx-bbbb     1/1     Running   0          2m
```

### Step 22: Get Frontend URL

```powershell
kubectl get svc linktree-frontend -n linktree --watch
```

Wait for the `EXTERNAL-IP` column to show an address (initially displays `<pending>`).

Example output:
```
NAME                   TYPE           CLUSTER-IP       EXTERNAL-IP              PORT(S)        AGE
linktree-frontend      LoadBalancer   10.100.x.x       aBc123.elb.us-east-1...  80:31234/TCP   5m
```

Copy the `EXTERNAL-IP` value.

### Step 23: Access Your Application

Open your web browser and navigate to:

```
http://EXTERNAL-IP
```

Replace `EXTERNAL-IP` with the value from Step 22.

You should now see your LinkHub application running on EKS!

---

## Troubleshooting

### Issue: Terraform init fails

**Solution:**
```powershell
# Verify AWS credentials are configured
aws sts get-caller-identity

# Check AWS CLI version
aws --version

# Check Terraform version
terraform --version
```

### Issue: Pods are not running

**Solution:**
```powershell
# Check pod status
kubectl describe pod <pod-name> -n linktree

# Check pod logs
kubectl logs <pod-name> -n linktree

# Check events in the namespace
kubectl get events -n linktree
```

### Issue: LoadBalancer endpoint is still pending after 15 minutes

**Solution:**
```powershell
# Check service status
kubectl describe svc linktree-frontend -n linktree

# Check if nodes are ready
kubectl get nodes

# Check if pods are running
kubectl get pods -n linktree
```

### Issue: Backend cannot connect to MongoDB

**Solution:**
1. Verify MongoDB Atlas cluster is running
2. Verify IP whitelist in MongoDB Atlas allows cluster traffic:
   - Go to MongoDB Atlas → Network Access
   - Add `0.0.0.0/0` (or your VPC CIDR) to IP Whitelist
3. Verify MONGO_URI in `terraform.tfvars` is correct
4. Check logs: `kubectl logs <backend-pod> -n linktree`

### Issue: Images not pulling from Docker Hub

**Solution:**
1. Verify Docker images are public:
   - Go to https://hub.docker.com
   - Check that `linktree-backend` and `linktree-frontend` are public
2. If private, create a Docker Hub secret:
   ```powershell
   kubectl create secret docker-registry dockerhub-secret \
     --docker-server=https://index.docker.io/v1/ \
     --docker-username=<your-dockerhub-username> \
     --docker-password=<your-dockerhub-password> \
     --docker-email=<your-email> \
     -n linktree
   ```

### Issue: AWS provider authentication fails

**Solution:**
```powershell
# Check if AWS credentials are set
aws sts get-caller-identity

# If not working, configure again
aws configure

# Verify region is set correctly
echo $env:AWS_REGION
```

---

## Cleanup

### Destroy All AWS Resources

**⚠️ WARNING: This is irreversible! All resources will be deleted.**

To tear down the entire infrastructure and stop incurring costs:

```powershell
cd terraform
terraform destroy
```

You'll be prompted to confirm. Type `yes` to proceed.

**What gets deleted:**
- EKS cluster
- Worker nodes
- VPC, subnets, security groups
- IAM roles
- NAT Gateway and Elastic IP
- All Kubernetes resources

**Duration:** 10-15 minutes

---

## Summary

**What you've deployed:**

✅ AWS VPC with public and private subnets  
✅ NAT Gateway for private node internet access  
✅ EKS cluster (Kubernetes control plane)  
✅ 2 EC2 worker nodes (t3.medium instances)  
✅ IAM roles and policies  
✅ Backend deployment (2 replicas)  
✅ Frontend deployment (2 replicas)  
✅ Kubernetes services and LoadBalancer  
✅ Secrets for MongoDB URI and JWT key  

**Total cost estimate (monthly):**
- EKS cluster: ~$73
- 2 t3.medium nodes: ~$60/month
- NAT Gateway: ~$32/month
- Data transfer: ~$5-15/month

**Total: ~$170-190/month**

You can reduce costs by using smaller instance types or deleting resources when not in use.

---

## Next Steps

After successful deployment:

1. **Monitor your application** - Use CloudWatch to monitor resources
2. **Set up auto-scaling** - Add Horizontal Pod Autoscaler for dynamic scaling
3. **Configure DNS** - Route a domain to your LoadBalancer
4. **Enable HTTPS** - Add SSL certificate to your LoadBalancer
5. **Set up CI/CD** - Add GitHub Actions to automatically deploy on code push
6. **Implement backups** - Set up MongoDB backups and EBS snapshots
7. **Add monitoring** - Integrate Prometheus/Grafana for metrics

