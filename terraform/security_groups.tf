# PharmaFlow Security Group
# Restricts SSH to trusted IP, opens HTTP 80 and HTTPS 443
# Strictly isolates database port 5432 within the private Docker bridge network
resource "aws_security_group" "pharmaflow_sg" {
  name        = var.security_group_name
  description = "PharmaFlow security group: Port 80, 443 public; Port 22 restricted; Port 5432 private"

  ingress {
    description = "SSH access restricted to trusted administrator IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  ingress {
    description = "HTTP reverse proxy traffic"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS encrypted reverse proxy traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Outbound internet access for container registry and package updates"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = var.security_group_name
  }
}
