provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "PharmaFlow"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "anam-tabassum64"
    }
  }
}
