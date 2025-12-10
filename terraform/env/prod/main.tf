module "vpc" {
  source      = "../../modules/vpc"
  environment = var.environment
  region      = var.region
}

module "iam" {
  source = "../../modules/iam"
  cluster_name = var.cluster_name
  environment  = var.environment    
}

module "eks" {
  source          = "../../modules/eks"
  cluster_name    = var.cluster_name
  environment     = var.environment
  region          = var.region
  vpc_id          = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids
  eks_cluster_role_arn = module.iam.eks_cluster_role_arn
  depends_on           = [module.iam]
}

module "node-group" {
  source            = "../../modules/node-group"
  cluster_name      = module.eks.cluster_name
  subnet_ids        = module.vpc.private_subnet_ids
  node_role_arn     = module.iam.node_role_arn
  environment       = var.environment
  depends_on        = [module.eks]
}