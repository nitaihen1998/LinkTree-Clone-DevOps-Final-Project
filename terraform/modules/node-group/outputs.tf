output "node_group_name" {
  description = "The name of the EKS managed node group"
  value       = aws_eks_node_group.default.node_group_name
}