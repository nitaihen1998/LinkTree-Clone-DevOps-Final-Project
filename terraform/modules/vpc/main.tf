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

# Private Subnets (for EKS worker nodes)
resource "aws_subnet" "private_a"{
    vpc_id            = aws_vpc.this.id
    cidr_block        = var.private_subnet_a_cidr
    availability_zone = "${var.region}a"
    map_public_ip_on_launch = false

    tags = {
      Name = "${var.environment}-private-subnet-a"
      Environment = var.environment
      "kubernetes.io/role/internal-elb" = "1"
    }
}

resource "aws_subnet" "private_b"{
    vpc_id            = aws_vpc.this.id
    cidr_block        = var.private_subnet_b_cidr
    availability_zone = "${var.region}b"
    map_public_ip_on_launch = false

    tags = {
      Name = "${var.environment}-private-subnet-b"
      Environment = var.environment
      "kubernetes.io/role/internal-elb" = "1"
    }
}

# Elastic IPs for NAT Gateways (one per AZ for HA)
resource "aws_eip" "nat_a"{
  domain = "vpc"
  
  tags = {
    Name = "${var.environment}-eip-nat-a"
    Environment = var.environment
  }

  depends_on = [aws_internet_gateway.igw]
}

resource "aws_eip" "nat_b"{
  domain = "vpc"
  
  tags = {
    Name = "${var.environment}-eip-nat-b"
    Environment = var.environment
  }

  depends_on = [aws_internet_gateway.igw]
}

# NAT Gateways (one per AZ in public subnets for high availability)
resource "aws_nat_gateway" "nat_a"{
  allocation_id = aws_eip.nat_a.id
  subnet_id     = aws_subnet.public_a.id

  tags = {
    Name = "${var.environment}-nat-a"
    Environment = var.environment
  }

  depends_on = [aws_internet_gateway.igw]
}

resource "aws_nat_gateway" "nat_b"{
  allocation_id = aws_eip.nat_b.id
  subnet_id     = aws_subnet.public_b.id

  tags = {
    Name = "${var.environment}-nat-b"
    Environment = var.environment
  }

  depends_on = [aws_internet_gateway.igw]
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

# Private Route Tables (via NAT Gateways for outbound internet access)
resource "aws_route_table" "private_a" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_a.id
  }

  tags = {
    Name = "${var.environment}-private-rt-a"
  }
}

resource "aws_route_table" "private_b" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_b.id
  }

  tags = {
    Name = "${var.environment}-private-rt-b"
  }
}

# Associate private subnets with their respective route tables
resource "aws_route_table_association" "private_a" {
  subnet_id      = aws_subnet.private_a.id
  route_table_id = aws_route_table.private_a.id
}

resource "aws_route_table_association" "private_b" {
  subnet_id      = aws_subnet.private_b.id
  route_table_id = aws_route_table.private_b.id
}


