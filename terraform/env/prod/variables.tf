variable "cluster_name" {
  type        = string
  description = "Name of the EKS cluster"
}

variable "environment" {
  type        = string
  description = "Environment (dev/prod)"
}

variable "region" {
  type        = string
  description = "AWS region"
}

variable "public_subnet_ids" {
  type = list(string)
  default = []
}

variable "private_subnet_ids" {
  type = list(string)
  default = []
}
