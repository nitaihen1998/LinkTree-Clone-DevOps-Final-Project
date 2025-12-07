resource "aws_eks_cluster" "this" {
  name     = var.cluster_name
  role_arn = var.eks_cluster_role_arn

  version = "1.30"

  vpc_config {
    subnet_ids = concat(var.public_subnet_ids, var.private_subnet_ids)
    endpoint_public_access  = true
    endpoint_private_access = false
  }

  tags = {
    Name        = var.cluster_name
    Environment = var.environment
  }
}

data "tls_certificate" "oidc" {
  url = aws_eks_cluster.this.identity[0].oidc[0].issuer
}
resource "aws_iam_openid_connect_provider" "eks" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.oidc.certificates[0].sha1_fingerprint]
  url             = aws_eks_cluster.this.identity[0].oidc[0].issuer
}
