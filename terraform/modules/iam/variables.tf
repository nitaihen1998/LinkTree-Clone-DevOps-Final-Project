variable "cluster_name" {
  type        = string
  description = "Name of the EKS cluster"
}

variable "environment" {
  type        = string
  description = "Environment (dev/prod)"
}
