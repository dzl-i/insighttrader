# Define a role for the lambda function
# - The name must be prefixed with SENG3011_ otherwise AWS will reject it
# - Make sure to proper prefix your role name.
# - You don't need to change assume_role_policy. 
# - You should change managed_policy_arns to be a list of policy ARNs.
# - You can have all your functions using the same role, or create multiple
#     for different functions.
resource "aws_iam_role" "iam_for_lambda" {
  name = "SENG3011_${var.group_name}_${terraform.workspace}_iam_for_lambda"

  assume_role_policy = jsonencode(
    {
      Version = "2012-10-17",
      Statement = [
        {
          Action = "sts:AssumeRole",
          Principal = {
            Service = "lambda.amazonaws.com"
          },
          Effect = "Allow",
          Sid    = ""
        }
      ]
  })
  managed_policy_arns = [
    aws_iam_policy.list_s3_permission.arn,
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    aws_iam_policy.sqs_permission.arn,
    aws_iam_policy.database_permission.arn,
    "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole",
    aws_iam_policy.lambda_permission.arn,
  ]
}

# Define a new policy allowing your function to access the S3 bucket
# - The name must be prefixed with SENG3011_ otherwise AWS will reject it
# - The more specific, the better. Only ask for permission that your function
#     really need. Be careful with permissions that will result in addition, 
#     modification or deletion of data. This is a way to prevent you from
#     accident or mistakes destroying your work.
resource "aws_iam_policy" "list_s3_permission" {
  name = "SENG3011_${var.group_name}_${terraform.workspace}_list_s3_permission"

  policy = jsonencode(
    {
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Sid": "ListObjectsInBucket",
          "Effect" : "Allow",
          "Action" : "s3:ListBucket",
          "Resource" : "arn:aws:s3:::${var.global_s3_name}"
        },
        {
          "Sid": "AllObjectActions",
          "Effect" : "Allow",
          "Action" : "s3:*Object",
          "Resource" : "arn:aws:s3:::${var.global_s3_name}/*"
        }
      ]
  })
}

# resource "aws_iam_user_policy_attachment" "user_sqs_permission" {
#   user       = "SE3011-24-GITH-01"
#   policy_arn = aws_iam_policy.sqs_permission.arn
# }

# Policy for the SQS queue
resource "aws_iam_policy" "sqs_permission" {
  name = "SENG3011_${var.group_name}_${terraform.workspace}_sqs_permission"

  policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "SQSQueueActions",
        "Effect": "Allow",
        "Action": [
          "sqs:CreateQueue",
          "sqs:ListQueues",
          "sqs:DeleteQueue",
          "sqs:GetQueueAttributes",
          "sqs:SetQueueAttributes",
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:PurgeQueue"
        ],
        "Resource": "*"
      }
    ]
  })
}

resource "aws_iam_policy" "database_permission" {
  name        = "SENG3011_${var.group_name}_${terraform.workspace}_database_permission"
  description = "Policy for DynamoDB access for group ${var.group_name} in workspace ${terraform.workspace}"

  policy = jsonencode({
    "Version" = "2012-10-17"
    "Statement" = [
      {
        "Effect" = "Allow"
        "Action" = [
          "dynamodb:Get*",
          "dynamodb:Put*",
          "dynamodb:Update*",
          "dynamodb:Delete*",
          "dynamodb:Scan",
          "dynamodb:Query",
          "dynamodb:CreateTable",
          "dynamodb:DeleteTable",
          "dynamodb:BatchGet*",
          "dynamodb:DescribeStream",
          "dynamodb:DescribeTable",
          "dynamodb:BatchWrite*",
        ]
        "Resource" = "*"
      },
    ]
  })
}

resource "aws_iam_policy" "lambda_permission" {
  name        = "SENG3011_${var.group_name}_${terraform.workspace}_lambda_permission"
  description = "Policy for Lambda invocation for group ${var.group_name} in workspace ${terraform.workspace}"

  policy = jsonencode({
    "Version" = "2012-10-17"
    "Statement" = [
      {
        "Effect" = "Allow"
        "Action" = [
          "lambda:InvokeFunction"
        ]
        "Resource" = "*"
      },
    ]
  })
}

resource "aws_iam_policy" "aurora_rds_permission" {
  name = "SENG3011_${var.group_name}_${terraform.workspace}_aurora_rds_permission"
  description = "IAM policy for accessing Aurora database"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DescribeSubnets",
          "ec2:DeleteNetworkInterface",
          "ec2:AssignPrivateIpAddresses",
          "ec2:UnassignPrivateIpAddresses"
        ]
        Effect = "Allow"
        Resource = "arn:aws:rds:ap-southeast-2:381491885579:cluster:f11a-crunch"
      },
    ]
  })
}
