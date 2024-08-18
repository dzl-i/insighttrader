

resource "aws_sqs_queue" "data_processing_queue" {
  name                      = "${var.group_name}_${terraform.workspace}_data_processing_queue"
  delay_seconds             = 30
  max_message_size          = 2560
  message_retention_seconds = 240
  receive_wait_time_seconds = 20
  visibility_timeout_seconds = 200
}

resource "aws_lambda_event_source_mapping" "data_processing_poller" {
  event_source_arn = aws_sqs_queue.data_processing_queue.arn
  function_name    = aws_lambda_function.data_processing.arn

  batch_size = 50
  scaling_config {
    maximum_concurrency = 2
  }

  maximum_batching_window_in_seconds = 60

  depends_on = [
    aws_lambda_function.data_processing
  ]
}
