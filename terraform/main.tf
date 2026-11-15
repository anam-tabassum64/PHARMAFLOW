# Query latest official Ubuntu 24.04 LTS Noble Numbat AMI in ap-south-1
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical official owner ID

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# PharmaFlow Production EC2 Instance
resource "aws_instance" "pharmaflow_server" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = var.key_name
  vpc_security_group_ids      = [aws_security_group.pharmaflow_sg.id]
  associate_public_ip_address = true

  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
    tags = {
      Name = "pharmaflow-root-volume"
    }
  }

  # Automated bootstrap script installing Docker & Compose
  user_data                   = file("${path.module}/user_data.sh")
  user_data_replace_on_change = true

  tags = {
    Name = "pharmaflow-production-server"
  }
}
