
# Get EKS cluster info
data "aws_eks_cluster" "cluster" {
  name = var.cluster_name
}

data "aws_eks_cluster_auth" "cluster" {
  name = var.cluster_name
}

# 1. Download the official ALB IAM policy JSON

data "http" "alb_policy" {
  url = "https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.7.1/docs/install/iam_policy.json"
}


# 2. Create IAM Policy for ALB Controller

resource "aws_iam_policy" "alb_controller_policy" {
  name        = "${var.cluster_name}-alb-controller-policy"
  description = "IAM policy for AWS Load Balancer Controller"
  policy      = data.http.alb_policy.response_body
}


# 3. IAM Role for ALB Controller (IRSA)

resource "aws_iam_role" "alb_controller_role" {
  name = "${var.cluster_name}-alb-controller-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRoleWithWebIdentity"

      # Use OIDC provider from EKS module output
      Principal = {
        Federated = var.oidc_provider_arn
      }

      Condition = {
        "StringEquals" = {
          # Must match the Kubernetes Service Account name
          "${var.oidc_provider_url}:sub" = "system:serviceaccount:kube-system:aws-load-balancer-controller"
        }
      }
    }]
  })
}


# 4. Attach IAM Policy to the Role
resource "aws_iam_role_policy_attachment" "alb_policy_attachment" {
  role       = aws_iam_role.alb_controller_role.name
  policy_arn = aws_iam_policy.alb_controller_policy.arn
}
