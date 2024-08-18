resource "null_resource" "build_test_preprocessing" {
  triggers = {
    always_run = "${timestamp()}"
  }

  provisioner "local-exec" {
    command = "bash ${path.module}/../code/afr_preprocessing_service/build.sh"
  }
}

resource "aws_lambda_function" "test_preprocessing" {
  function_name = "${var.group_name}_${terraform.workspace}_test_preprocessing"
  role          = "arn:aws:iam::381491885579:role/role-lambda-student"
  image_uri     = "381491885579.dkr.ecr.ap-southeast-2.amazonaws.com/seng3011-f11a-crunch-preprocessing:latest"

  environment {
    variables = {
      ENV            = "${terraform.workspace}"
      GLOBAL_S3_NAME = "${var.global_s3_name}"
    }
  }

  package_type = "Image"
  memory_size  = 1024
  timeout      = 500
}

resource "aws_lambda_permission" "test_preprocessing" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.test_preprocessing.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.aws_apigatewayv2_api.api_gateway_global.execution_arn}/*/*/test_preprocessing"
}

resource "aws_apigatewayv2_integration" "test_preprocessing" {
  api_id           = var.gateway_api_id
  integration_type = "AWS_PROXY"

  integration_uri    = aws_lambda_function.test_preprocessing.invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "test_preprocessing" {
  api_id    = var.gateway_api_id
  route_key = "POST /${var.group_name}/test_preprocessing"

  target = "integrations/${aws_apigatewayv2_integration.test_preprocessing.id}"
}
