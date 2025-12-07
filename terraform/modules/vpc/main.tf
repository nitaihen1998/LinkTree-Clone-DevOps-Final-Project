resource "aws_vpc" "this" {
  cidr_block           = var.cidr_block
  enable_dns_support   = true
  enable_dns_hostnames = true
}

resource "aws_internet_gateway" "igw"{
  vpc_id = aws_vpc.this.id
}

resource "aws_subnet" "public_a"{
    vpc_id            = aws_vpc.this.id
    cidr_block        = var.public_subnet_a_cidr
    availability_zone = "${var.region}a"
    map_public_ip_on_launch = true

    tags = {
      Name = "${var.environment}-public-subnet-a"
      Environment = var.environment
      "kubernetes.io/role/elb" = "1"
    }
}

resource "aws_subnet" "public_b"{
    vpc_id            = aws_vpc.this.id
    cidr_block        = var.public_subnet_b_cidr
    availability_zone = "${var.region}b"
    map_public_ip_on_launch = true

    tags = {
      Name = "${var.environment}-public-subnet-b"
      Environment = var.environment
      "kubernetes.io/role/elb" = "1"
    }
}




# Route Tables - send traffic to IGW for public subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  tags = {
    Name = "${var.environment}-public-rt"
  }
}


# Associations - public subnets to public route table

resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}


