# Output variables for the VPC module
output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.this.id
}

output "public_subnet_ids" {
  description = "The IDs of the public subnets"
  value = [
    aws_subnet.public_a.id,
    aws_subnet.public_b.id
  ]
}



output "internet_gateway_id" {
  description = "The ID of the Internet Gateway"
  value       = aws_internet_gateway.igw.id
}

output "private_subnet_ids" {
  description = "The IDs of the private subnets"
  value = [
    aws_subnet.private_a.id,
    aws_subnet.private_b.id
  ]
}

output "nat_gateway_ids" {
  description = "The IDs of the NAT Gateways"
  value = [
    aws_nat_gateway.nat_a.id,
    aws_nat_gateway.nat_b.id
  ]
}


