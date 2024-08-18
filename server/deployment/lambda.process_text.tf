resource "null_resource" "build_process_text" {
  triggers = {
    always_run = "${timestamp()}"
  }

  provisioner "local-exec" {
    command = "bash ${path.module}/../code/process_text/build.sh"
  }
}

resource "aws_lambda_function" "process_text" {
  function_name = "${var.group_name}_${terraform.workspace}_process_text"
  role             = aws_iam_role.iam_for_lambda.arn
  image_uri     = "381491885579.dkr.ecr.ap-southeast-2.amazonaws.com/seng3011-f11a-crunch-processing:latest"

  environment {
    variables = {
      ENV            = "${terraform.workspace}"
      GLOBAL_S3_NAME = "${var.global_s3_name}"
      
      DB_ENDPOINT   = "f11a-crunch.cluster-ctme6y8c0ta6.ap-southeast-2.rds.amazonaws.com"
      DB_NAME       = "postgres"
      DB_USER       = "postgres"
      DB_PASSWORD   = "jQUAffrthmbfnlqhNWYR"
      DB_PORT       = "5432"
    }
  }
  
  package_type = "Image"
  memory_size  = 2048
  timeout      = 180

  vpc_config {
    security_group_ids = ["sg-0066b12ba09ee0ab4"]
    subnet_ids         = ["subnet-0162e9ca045234d15", "subnet-0d4c66d8d3680353d", "subnet-0279c4cee6fc8fc21"]
  }

  depends_on = [null_resource.build_process_text]
}

resource "aws_lambda_permission" "process_text" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.process_text.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.aws_apigatewayv2_api.api_gateway_global.execution_arn}/*/*/process_text"
}

resource "aws_apigatewayv2_integration" "process_text" {
  api_id           = var.gateway_api_id
  integration_type = "AWS_PROXY"

  integration_uri    = aws_lambda_function.process_text.invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "process_text" {
  api_id    = var.gateway_api_id
  route_key = "POST /${var.group_name}/process_text"

  target = "integrations/${aws_apigatewayv2_integration.process_text.id}"
}
