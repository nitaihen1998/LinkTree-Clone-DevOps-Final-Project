variable "cluster_name" {
  type        = string
  description = "Name of the EKS cluster"
}

variable "environment" {
  type        = string
  description = "Environment (dev/prod)"
}

variable "region" {
  description = "The AWS region where the EKS cluster will be created."
  type        = string
}

variable "vpc_id" {
  description = "The ID of the VPC where the EKS cluster will be deployed."
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs for the EKS cluster."
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for the EKS cluster."
  type        = list(string)
}

variable "eks_cluster_role_arn" {
  description = "The ARN of the IAM role for the EKS cluster."
  type        = string
}
