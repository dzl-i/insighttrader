

resource "aws_sqs_queue" "preprocess_text_queue" {
  name                      = "${var.group_name}_${terraform.workspace}_preprocess_text_queue"
  delay_seconds             = 90
  max_message_size          = 256000
  message_retention_seconds = 240
  receive_wait_time_seconds = 20
  visibility_timeout_seconds = 200
}

resource "aws_lambda_event_source_mapping" "preprocess_text_poller" {
  event_source_arn = aws_sqs_queue.preprocess_text_queue.arn
  function_name    = aws_lambda_function.preprocess_text.arn

  batch_size = 50
  scaling_config {
    maximum_concurrency = 2
  }

  maximum_batching_window_in_seconds = 60

  depends_on = [
    aws_lambda_function.preprocess_text
  ]
}
