// terraform/modules/api_gateway/main.tf

# データソース
data "aws_region" "current" {}

# REST API
resource "aws_api_gateway_rest_api" "kakei_api" {
  name        = "${var.project_name}-${var.environment}-api"
  description = "Kakei API Gateway with Cognito authorizer"
}

# Cognito authorizer
resource "aws_api_gateway_authorizer" "cognito" {
  name                   = "${var.project_name}-${var.environment}-cognito"
  rest_api_id            = aws_api_gateway_rest_api.kakei_api.id
  identity_source        = "method.request.header.Authorization"
  type                   = "COGNITO_USER_POOLS"
  provider_arns          = [var.cognito_user_pool_arn]
}

# Helper to create resource + method + integration
locals {
  resources = {
    transactions = {
      path = "transactions"
      methods = ["GET", "POST", "PUT", "DELETE"]
    }
    categories = {
      path = "categories"
      methods = ["GET", "POST"]
    }
    csv_import = {
      path = "csv/upload-url"
      methods = ["POST"]
    }
  }
}

# Create resources recursively
resource "aws_api_gateway_resource" "root" {
  rest_api_id = aws_api_gateway_rest_api.kakei_api.id
  parent_id    = aws_api_gateway_rest_api.kakei_api.root_resource_id
  path_part    = ""
}

# Iterate over locals.resources
resource "aws_api_gateway_resource" "api_resources" {
  for_each = local.resources
  rest_api_id = aws_api_gateway_rest_api.kakei_api.id
  parent_id   = aws_api_gateway_rest_api.kakei_api.root_resource_id
  path_part   = each.value.path
}

# Methods and integrations
resource "aws_api_gateway_method" "methods" {
  for_each = {
    for item in flatten([
      for r_name, r in local.resources : [
        for m in r.methods : {
          key         = "${r_name}-${m}"
          resource_id = aws_api_gateway_resource.api_resources[r_name].id
          http_method = m
        }
      ]
    ]) : item.key => item
  }
  rest_api_id   = aws_api_gateway_rest_api.kakei_api.id
  resource_id    = each.value.resource_id
  http_method   = each.value.http_method
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

# Lambda integration per method
resource "aws_api_gateway_integration" "lambda_integration" {
  for_each = aws_api_gateway_method.methods
  rest_api_id = aws_api_gateway_rest_api.kakei_api.id
  resource_id  = each.value.resource_id
  http_method  = each.value.http_method
  integration_http_method = "POST"
  type        = "AWS_PROXY"
  uri = {
    "transactions-GET"    = var.transactions_lambda_invoke_arn
    "transactions-POST"   = var.transactions_lambda_invoke_arn
    "transactions-PUT"    = var.transactions_lambda_invoke_arn
    "transactions-DELETE"  = var.transactions_lambda_invoke_arn
    "categories-GET"       = var.categories_lambda_invoke_arn
    "categories-POST"      = var.categories_lambda_invoke_arn
    "csv_import-POST"      = var.csv_import_lambda_invoke_arn
  }["${each.key}"]
}

# CORS configuration (allow all origins for simplicity)
resource "aws_api_gateway_method_response" "cors" {
  for_each = aws_api_gateway_method.methods
  rest_api_id = aws_api_gateway_rest_api.kakei_api.id
  resource_id  = each.value.resource_id
  http_method  = each.value.http_method
  status_code  = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

resource "aws_api_gateway_integration_response" "cors" {
  for_each = aws_api_gateway_method.methods
  rest_api_id = aws_api_gateway_rest_api.kakei_api.id
  resource_id  = each.value.resource_id
  http_method  = each.value.http_method
  status_code  = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
  }
}

# Enable OPTIONS method for CORS preflight
resource "aws_api_gateway_method" "options" {
  for_each = aws_api_gateway_resource.api_resources
  rest_api_id = aws_api_gateway_rest_api.kakei_api.id
  resource_id  = each.value.id
  http_method  = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_integration" {
  for_each = aws_api_gateway_method.options
  rest_api_id = aws_api_gateway_rest_api.kakei_api.id
  resource_id  = each.value.resource_id
  http_method  = each.value.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{statusCode:200}"
  }
}

resource "aws_api_gateway_method_response" "options_response" {
  for_each = aws_api_gateway_method.options
  rest_api_id = aws_api_gateway_rest_api.kakei_api.id
  resource_id  = each.value.resource_id
  http_method  = each.value.http_method
  status_code  = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

resource "aws_api_gateway_integration_response" "options_integration_response" {
  for_each = aws_api_gateway_method.options
  rest_api_id = aws_api_gateway_rest_api.kakei_api.id
  resource_id  = each.value.resource_id
  http_method  = each.value.http_method
  status_code  = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
  }
}

# Deployment
resource "aws_api_gateway_deployment" "deployment" {
  depends_on = [aws_api_gateway_integration.lambda_integration]
  rest_api_id = aws_api_gateway_rest_api.kakei_api.id
  stage_name  = var.environment
}
