# EKS Cluster Name
output "cluster_name" {
  description = "The name of the EKS cluster"
  value       = aws_eks_cluster.this.name
}

# EKS Cluster Endpoint (API Server URL)
output "cluster_endpoint" {
  description = "The endpoint for the EKS Kubernetes API"
  value       = aws_eks_cluster.this.endpoint
}

# EKS Cluster Certificate Authority
output "cluster_certificate_authority" {
  description = "Kubernetes cluster CA data"
  value       = aws_eks_cluster.this.certificate_authority[0].data
}


output "oidc_provider_arn" {
  description = "OIDC Provider ARN for IRSA"
  value       = aws_iam_openid_connect_provider.eks.arn
}

output "oidc_provider_url" {
  description = "OIDC Provider URL"
  value       = aws_iam_openid_connect_provider.eks.url
}
