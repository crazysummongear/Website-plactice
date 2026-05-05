output "distribution_id" {
  description = "CloudFront ディストリビューションID"
  value       = aws_cloudfront_distribution.frontend.id
}

output "distribution_arn" {
  description = "CloudFront ディストリビューションARN"
  value       = aws_cloudfront_distribution.frontend.arn
}

output "distribution_domain_name" {
  description = "CloudFront ディストリビューションドメイン名"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "distribution_url" {
  description = "CloudFront ディストリビューションURL"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}
