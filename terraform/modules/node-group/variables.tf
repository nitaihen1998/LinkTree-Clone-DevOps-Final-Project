variable "cluster_name" {
  type        = string
  description = "Name of the EKS cluster"
}

variable "node_role_arn" {
  description = "The ARN of the IAM role for the EKS worker nodes."
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the EKS cluster."
  type        = list(string)
}


variable "environment" {
  type        = string
  description = "Environment (dev/prod)"
}

variable "desired_size" {
  description = "Desired number of worker nodes in the node group."
  type        = number
  default     = 2
}

variable "min_size" {
  description = "Minimum number of worker nodes in the node group."
  type        = number
  default     = 1
}

variable "max_size" {
  description = "Maximum number of worker nodes in the node group."
  type        = number
  default     = 3
}

variable "instance_types" {
    description = "ec2 instance types for the worker nodes."
    type        = list(string)
    default     = ["t3.medium"]

}