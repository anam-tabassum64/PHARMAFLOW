# Use the pre-created PharmaFlow Security Group in AWS ap-south-1
# Preserves existing rules: Port 22 SSH restricted, Port 80, Port 443 public, Port 5432 private
data "aws_security_group" "pharmaflow_sg" {
  name = var.security_group_name
}
