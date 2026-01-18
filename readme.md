# 🔗 LinkTree Clone - DevSecOps Final Project

<div align="center">

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Kubernetes](https://img.shields.io/badge/kubernetes-326ce5.svg?&style=for-the-badge&logo=kubernetes&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

**BIU DevSecOps20 Final Project**

A full-stack LinkTree clone application with complete DevOps pipeline implementation

[Features](#-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [DevOps Pipeline](#-devops-pipeline)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 About

This project is a comprehensive implementation of a LinkTree clone, developed as the final project for BIU's DevSecOps20 course. It demonstrates modern DevOps practices, including containerization, orchestration, infrastructure as code, and CI/CD automation.

The application allows users to create a personalized landing page with multiple links, similar to the popular LinkTree service. 

## ✨ Features

- 🔗 **Multi-link Management** - Create and manage multiple links from a single page
- 🎨 **Customizable Profiles** - Personalize your link page with custom themes and layouts
- 📱 **Responsive Design** - Works seamlessly across desktop and mobile devices
- 🔒 **Secure Architecture** - Built with security best practices in mind
- 🚀 **Cloud-Native** - Containerized and ready for Kubernetes deployment
- 📊 **Monitoring Ready** - Integrated with observability tools

## 🏗️ Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │         │             │         │             │
│   Frontend  │────────▶│   Backend   │────────▶│  Database   │
│  (React/JS) │         │  (Node. js)  │         │             │
│             │         │             │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
       │                       │                       │
       └───────────────────────┴───────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Kubernetes Cluster │
                    │   (Container Orchestration) │
                    └─────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React / Vanilla JavaScript
- **Styling**: CSS3
- **Build Tool**: Webpack / Vite

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB / PostgreSQL

### DevOps & Infrastructure
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **IaC**: Terraform
- **CI/CD**: GitHub Actions
- **Cloud Provider**: AWS / GCP / Azure

## 📁 Project Structure

```
LinkTree-Clone-DevOps-Final-Project/
├── . github/                  # GitHub Actions workflows
│   └── workflows/
├── backend/                  # Backend application
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── frontend/                 # Frontend application
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package. json
├── k8s/                     # Kubernetes manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
├── terraform/               # Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── . gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Docker
- Kubernetes cluster (minikube/kind for local development)
- Terraform (v1.0+)
- kubectl

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/nitaihen1998/LinkTree-Clone-DevOps-Final-Project. git
   cd LinkTree-Clone-DevOps-Final-Project
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

### Docker Development

1. **Build Docker images**
   ```bash
   # Backend
   docker build -t linktree-backend:latest ./backend
   
   # Frontend
   docker build -t linktree-frontend:latest ./frontend
   ```

2. **Run with Docker Compose** (if available)
   ```bash
   docker-compose up
   ```

## 🔄 DevOps Pipeline

### CI/CD Workflow

The project uses GitHub Actions for continuous integration and deployment:

1. **Code Push** → Triggers GitHub Actions workflow
2. **Build & Test** → Runs unit and integration tests
3. **Security Scan** → Performs vulnerability scanning
4. **Docker Build** → Builds container images
5. **Push to Registry** → Pushes images to container registry
6. **Deploy to K8s** → Deploys to Kubernetes cluster

### Infrastructure as Code

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Plan infrastructure changes
terraform plan

# Apply infrastructure
terraform apply
```

## 🚢 Deployment

### Kubernetes Deployment

1. **Apply Kubernetes manifests**
   ```bash
   kubectl apply -f k8s/
   ```

2. **Verify deployment**
   ```bash
   kubectl get pods
   kubectl get services
   ```

3. **Access the application**
   ```bash
   kubectl port-forward service/linktree-frontend 3000:80
   ```

### Production Deployment

For production deployment, ensure you: 
- Configure environment variables
- Set up proper secrets management
- Enable SSL/TLS certificates
- Configure monitoring and logging
- Set resource limits and autoscaling

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is created for educational purposes as part of the BIU DevSecOps20 course.

---

<div align="center">

**Built with ❤️ for DevSecOps20**

[Report Bug](https://github.com/nitaihen1998/LinkTree-Clone-DevOps-Final-Project/issues) • [Request Feature](https://github.com/nitaihen1998/LinkTree-Clone-DevOps-Final-Project/issues)

</div>
