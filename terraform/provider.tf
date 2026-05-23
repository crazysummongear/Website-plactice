terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  profile = var.aws_profile
  region  = "ap-northeast-1"

  default_tags {
    tags = {
      Project     = "kakei"
      Environment = "dev"
      Owner       = "individual"
      ManagedBy   = "Terraform"
      CostCenter  = "learning-investment"
    }
  }
}

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}