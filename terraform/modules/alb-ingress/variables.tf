variable "cluster_name" {
  type        = string
  description = "Name of the EKS cluster"
}

variable "environment" {
  type        = string
  description = "Environment (dev/prod)"
}

variable "region" {
  description = "The AWS region where the ALB Controller will be deployed."
  type        = string
}

variable "oidc_provider_arn" {
  description = "The ARN of the OIDC provider for the EKS cluster."
  type        = string
}

variable "oidc_provider_url" {
  description = "The URL of the OIDC provider for the EKS cluster."
  type        = string
}
