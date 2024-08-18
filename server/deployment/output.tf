output "api_endpoint" {
  value = data.aws_apigatewayv2_api.api_gateway_global.api_endpoint
}

output "afr_import_service" {
  value = aws_apigatewayv2_route.afr_import_service.route_key
}

output "retrieval_service" {
  value = aws_apigatewayv2_route.retrieval_service.route_key
}

output "list_s3" {
  value = aws_apigatewayv2_route.list_s3.route_key
}

output "afr_preprocessing_service" {
  value = aws_apigatewayv2_route.test_preprocessing.route_key
}

output "afr_analysis_service" {
  value = aws_apigatewayv2_route.afr_analysis_service.route_key
}

output "afr_importer" {
  value = aws_apigatewayv2_route.afr_importer.route_key
}

output "data_import" {
  value = aws_apigatewayv2_route.data_import.route_key
}

output "preprocess_text" {
  value = aws_apigatewayv2_route.preprocess_text.route_key
}

output "data_retrieval" {
  value = aws_apigatewayv2_route.data_retrieval.route_key
}

output "data_aggregation" {
  value = aws_apigatewayv2_route.data_aggregation.route_key
}

output "test_live" {
  value = aws_apigatewayv2_route.test_live.route_key
}

output "cognito_trigger" {
  value = aws_apigatewayv2_route.cognito_trigger.route_key
}
