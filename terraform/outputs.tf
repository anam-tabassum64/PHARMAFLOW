output "ec2_public_ip" {
  description = "Public IPv4 address of PharmaFlow EC2 host"
  value       = aws_instance.pharmaflow_server.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS hostname of PharmaFlow EC2 host"
  value       = aws_instance.pharmaflow_server.public_dns
}

output "instance_id" {
  description = "AWS EC2 Instance ID"
  value       = aws_instance.pharmaflow_server.id
}

output "security_group_id" {
  description = "Security Group ID"
  value       = aws_security_group.pharmaflow_sg.id
}

output "deployment_info" {
  description = "Deployment environment and operational metadata"
  value = {
    project          = "PharmaFlow"
    environment      = var.environment
    aws_region       = var.aws_region
    instance_type    = var.instance_type
    deployment_dir   = var.deployment_dir
    default_ssh_user = "ubuntu"
  }
}

output "ssh_connection_command" {
  description = "Convenience SSH command to connect to EC2 host"
  value       = "ssh -i pharmaflow-ec2-key.pem ubuntu@${aws_instance.pharmaflow_server.public_ip}"
}

output "healthcheck_urls" {
  description = "Service healthcheck and monitoring URLs once deployed"
  value = {
    web_ui     = "http://${aws_instance.pharmaflow_server.public_ip}"
    api_health = "http://${aws_instance.pharmaflow_server.public_ip}/health"
    api_ready  = "http://${aws_instance.pharmaflow_server.public_ip}/ready"
    metrics    = "http://${aws_instance.pharmaflow_server.public_ip}/metrics"
    swagger    = "http://${aws_instance.pharmaflow_server.public_ip}/docs"
    grafana    = "http://${aws_instance.pharmaflow_server.public_ip}/grafana/"
    prometheus = "http://${aws_instance.pharmaflow_server.public_ip}/prometheus/"
  }
}
