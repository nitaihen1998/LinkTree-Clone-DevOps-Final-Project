output "eks_cluster_role_arn" {
    description = "IAM role ARN for the EKS cluster control plane"
    value       = aws_iam_role.eks_cluster_role.arn
}

output "node_role_arn" {
    description = "IAM role ARN for the EKS worker nodes"
    value       = aws_iam_role.node_role.arn
}


