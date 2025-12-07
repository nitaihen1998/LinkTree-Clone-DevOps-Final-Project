output "alb_controller_role_arn" {
  description = "IAM role ARN used by the AWS Load Balancer Controller via IRSA"
  value       = aws_iam_role.alb_controller_role.arn
}
