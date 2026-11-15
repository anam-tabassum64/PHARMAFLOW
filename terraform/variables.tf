variable "aws_region" {
  description = "AWS deployment region (Mumbai)"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "production"
}

variable "instance_type" {
  description = "EC2 instance type (t3.micro is AWS Free-Tier eligible)"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "Pre-created AWS EC2 Key Pair name"
  type        = string
  default     = "pharmaflow-ec2-key"
}

variable "security_group_name" {
  description = "Name for PharmaFlow EC2 Security Group"
  type        = string
  default     = "pharmaflow-sg"
}

variable "allowed_ssh_cidr" {
  description = "Trusted IPv4 CIDR permitted to SSH into EC2 (set to your IP/32)"
  type        = string
  default     = "0.0.0.0/0"
}

variable "deployment_dir" {
  description = "Absolute path for application installation on the host"
  type        = string
  default     = "/opt/pharmaflow"
}
