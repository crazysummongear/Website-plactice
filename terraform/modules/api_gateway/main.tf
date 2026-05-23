# API Gateway 定義モジュール

# ========================================
# REST API
# ========================================
resource "aws_api_gateway_rest_api" "api" {
  name        = "${var.project_name}-api-${var.environment}"
  description = "API for ${var.project_name} application"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name        = "${var.project_name}-api-${var.environment}"
    Environment = var.environment
  }
}

# ========================================
# Cognito オーソライザー
# ========================================
resource "aws_api_gateway_authorizer" "cognito" {
  name            = "${var.project_name}-cognito-authorizer-${var.environment}"
  rest_api_id     = aws_api_gateway_rest_api.api.id
  type            = "COGNITO_USER_POOLS"
  provider_arns   = [var.cognito_user_pool_arn]
  identity_source = "method.request.header.Authorization"
}

# ========================================
# リソース定義
# ========================================

# 1. /transactions
resource "aws_api_gateway_resource" "transactions" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "transactions"
}

# 2. /transactions/{id}
resource "aws_api_gateway_resource" "transaction_id" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.transactions.id
  path_part   = "{id}"
}

# 3. /categories
resource "aws_api_gateway_resource" "categories" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "categories"
}

# 4. /csv
resource "aws_api_gateway_resource" "csv" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "csv"
}

# 5. /csv/upload-url
resource "aws_api_gateway_resource" "csv_upload_url" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.csv.id
  path_part   = "upload-url"
}

# ========================================
# メソッド & 統合定義
# ========================================

# ----------------------------------------
# 1. GET /transactions
# ----------------------------------------
resource "aws_api_gateway_method" "get_transactions" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.transactions.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "get_transactions" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.transactions.id
  http_method             = aws_api_gateway_method.get_transactions.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.transactions_lambda_invoke_arn
}

# ----------------------------------------
# 2. POST /transactions
# ----------------------------------------
resource "aws_api_gateway_method" "post_transactions" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.transactions.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "post_transactions" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.transactions.id
  http_method             = aws_api_gateway_method.post_transactions.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.transactions_lambda_invoke_arn
}

# ----------------------------------------
# 3. PUT /transactions/{id}
# ----------------------------------------
resource "aws_api_gateway_method" "put_transaction" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.transaction_id.id
  http_method   = "PUT"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "put_transaction" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.transaction_id.id
  http_method             = aws_api_gateway_method.put_transaction.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.transactions_lambda_invoke_arn
}

# ----------------------------------------
# 4. DELETE /transactions/{id}
# ----------------------------------------
resource "aws_api_gateway_method" "delete_transaction" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.transaction_id.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "delete_transaction" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.transaction_id.id
  http_method             = aws_api_gateway_method.delete_transaction.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.transactions_lambda_invoke_arn
}

# ----------------------------------------
# 5. GET /categories
# ----------------------------------------
resource "aws_api_gateway_method" "get_categories" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.categories.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "get_categories" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.categories.id
  http_method             = aws_api_gateway_method.get_categories.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.categories_lambda_invoke_arn
}

# ----------------------------------------
# 6. POST /categories
# ----------------------------------------
resource "aws_api_gateway_method" "post_categories" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.categories.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "post_categories" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.categories.id
  http_method             = aws_api_gateway_method.post_categories.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.categories_lambda_invoke_arn
}

# ----------------------------------------
# 7. POST /csv/upload-url
# ----------------------------------------
resource "aws_api_gateway_method" "post_csv_upload" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.csv_upload_url.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "post_csv_upload" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.csv_upload_url.id
  http_method             = aws_api_gateway_method.post_csv_upload.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.csv_import_lambda_invoke_arn
}

# ========================================
# CORS OPTIONS メソッド & MOCK 統合定義
# ========================================

# CORS 設定用モジュール（手動定義）
# OPTIONS メソッドを各リソースに追加

# A. /transactions
resource "aws_api_gateway_method" "options_transactions" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.transactions.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_transactions" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.transactions.id
  http_method = aws_api_gateway_method.options_transactions.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_transactions" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.transactions.id
  http_method = aws_api_gateway_method.options_transactions.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options_transactions" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.transactions.id
  http_method = aws_api_gateway_method.options_transactions.http_method
  status_code = aws_api_gateway_method_response.options_transactions.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT,DELETE'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_integration.options_transactions]
}

# B. /transactions/{id}
resource "aws_api_gateway_method" "options_transaction_id" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.transaction_id.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_transaction_id" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.transaction_id.id
  http_method = aws_api_gateway_method.options_transaction_id.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_transaction_id" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.transaction_id.id
  http_method = aws_api_gateway_method.options_transaction_id.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options_transaction_id" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.transaction_id.id
  http_method = aws_api_gateway_method.options_transaction_id.http_method
  status_code = aws_api_gateway_method_response.options_transaction_id.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT,DELETE'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_integration.options_transaction_id]
}

# C. /categories
resource "aws_api_gateway_method" "options_categories" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.categories.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_categories" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.categories.id
  http_method = aws_api_gateway_method.options_categories.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_categories" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.categories.id
  http_method = aws_api_gateway_method.options_categories.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options_categories" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.categories.id
  http_method = aws_api_gateway_method.options_categories.http_method
  status_code = aws_api_gateway_method_response.options_categories.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT,DELETE'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_integration.options_categories]
}

# D. /csv/upload-url
resource "aws_api_gateway_method" "options_csv_upload" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.csv_upload_url.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_csv_upload" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.csv_upload_url.id
  http_method = aws_api_gateway_method.options_csv_upload.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_csv_upload" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.csv_upload_url.id
  http_method = aws_api_gateway_method.options_csv_upload.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options_csv_upload" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.csv_upload_url.id
  http_method = aws_api_gateway_method.options_csv_upload.http_method
  status_code = aws_api_gateway_method_response.options_csv_upload.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT,DELETE'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_integration.options_csv_upload]
}

# ========================================
# Lambda 呼び出し権限 (API Gateway用)
# ========================================
resource "aws_lambda_permission" "apigw_transactions" {
  statement_id  = "AllowAPIGatewayInvokeTransactions"
  action        = "lambda:InvokeFunction"
  function_name = var.transactions_lambda_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "apigw_categories" {
  statement_id  = "AllowAPIGatewayInvokeCategories"
  action        = "lambda:InvokeFunction"
  function_name = var.categories_lambda_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "apigw_csv_import" {
  statement_id  = "AllowAPIGatewayInvokeCsvImport"
  action        = "lambda:InvokeFunction"
  function_name = var.csv_import_lambda_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

# ========================================
# デプロイ & ステージ設定
# ========================================

# 全てのリソース・メソッド・統合に依存するデプロイ設定
resource "aws_api_gateway_deployment" "api" {
  rest_api_id = aws_api_gateway_rest_api.api.id

  # 変更検知をトリガーさせて自動再デプロイを行う
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.transactions.id,
      aws_api_gateway_resource.transaction_id.id,
      aws_api_gateway_resource.categories.id,
      aws_api_gateway_resource.csv.id,
      aws_api_gateway_resource.csv_upload_url.id,

      aws_api_gateway_method.get_transactions.id,
      aws_api_gateway_integration.get_transactions.id,
      aws_api_gateway_method.post_transactions.id,
      aws_api_gateway_integration.post_transactions.id,

      aws_api_gateway_method.put_transaction.id,
      aws_api_gateway_integration.put_transaction.id,
      aws_api_gateway_method.delete_transaction.id,
      aws_api_gateway_integration.delete_transaction.id,

      aws_api_gateway_method.get_categories.id,
      aws_api_gateway_integration.get_categories.id,
      aws_api_gateway_method.post_categories.id,
      aws_api_gateway_integration.post_categories.id,

      aws_api_gateway_method.post_csv_upload.id,
      aws_api_gateway_integration.post_csv_upload.id,

      aws_api_gateway_method.options_transactions.id,
      aws_api_gateway_integration.options_transactions.id,
      aws_api_gateway_method.options_transaction_id.id,
      aws_api_gateway_integration.options_transaction_id.id,
      aws_api_gateway_method.options_categories.id,
      aws_api_gateway_integration.options_categories.id,
      aws_api_gateway_method.options_csv_upload.id,
      aws_api_gateway_integration.options_csv_upload.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "api" {
  deployment_id = aws_api_gateway_deployment.api.id
  rest_api_id   = aws_api_gateway_rest_api.api.id
  stage_name    = var.environment
}
