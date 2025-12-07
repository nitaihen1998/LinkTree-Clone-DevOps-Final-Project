variable "region" {
  description = "The AWS region where the VPC will be created."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "The environment for the VPC (dev/prod)."
  type        = string
}

variable "cidr_block" {
  description = "The CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_a_cidr" {
  description = "The CIDR block for the public subnet."
  type        = string
  default     = "10.0.1.0/24"
}

variable "public_subnet_b_cidr" {
  description = "The CIDR block for the public subnet."
  type        = string
  default     = "10.0.2.0/24"
}

variable "private_subnet_a_cidr" {
  description = "The CIDR block for the private subnet."
  type        = string
  default     = "10.0.3.0/24"
}

variable "private_subnet_b_cidr" {
  description = "The CIDR block for the private subnet."
  type        = string
  default     = "10.0.4.0/24"
}