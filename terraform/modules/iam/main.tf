# IAM for EKS Cluster

resource "aws_iam_role" "eks_cluster_role" {
  name = "${var.cluster_name}-${var.environment}-eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }

      }
    ]
  })

    tags = {
        Name = "${var.cluster_name}-cluster-role"
        Environment = var.environment
    }
}

# Attach the AmazonEKSClusterPolicy to the IAM role

resource "aws_iam_role_policy_attachment" "eks_cluster_AmazonEKSClusterPolicy" {
  role       = aws_iam_role.eks_cluster_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}



# IAM for worker nodes (ec2 node group)

resource "aws_iam_role" "node_role" {
    name = "${var.cluster_name}-node-role"

    assume_role_policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Action = "sts:AssumeRole"
                Effect = "Allow"
                Principal = {
                    Service = "ec2.amazonaws.com"
                }    
            }

        ]
    })
    tags = {
        Name = "${var.cluster_name}-node-role"
        Environment = var.environment
    }
}

# Attach required AWS-managed policies for nodes

resource "aws_iam_role_policy_attachment" "node_AmazonEKSWorkerNodePolicy" {
    role       = aws_iam_role.node_role.name
    policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

# Attach the AmazonEKS_CNI_Policy to the node role 
resource "aws_iam_role_policy_attachment" "node_AmazonEKS_CNI_Policy" {
    role       = aws_iam_role.node_role.name
    policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

resource "aws_iam_role_policy_attachment" "eks_cluster_AmazonEKSServicePolicy" {
  role       = aws_iam_role.eks_cluster_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSServicePolicy"
}


# Attach the ECR ReadOnly policy to the node role

resource "aws_iam_role_policy_attachment" "node_AmazonEC2ContainerRegistryReadOnly" {
    role       = aws_iam_role.node_role.name
    policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

