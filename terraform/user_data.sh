#!/usr/bin/env bash
# ==============================================================================
# PHARMAFLOW – AWS EC2 Host Bootstrap & Provisioning Script
# Algions AI Labs Private Limited – Production Infrastructure Automation
# ==============================================================================

set -ex

# 1. Update OS packages
apt-get update -y
apt-get upgrade -y
apt-get install -y ca-certificates curl gnupg lsb-release

# 2. Add Docker official GPG key & repository
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# 3. Install Docker Engine and Compose Plugin
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4. Enable and start Docker daemon
systemctl enable docker
systemctl start docker

# 5. Grant ubuntu user non-root docker execution permissions
usermod -aG docker ubuntu

# 6. Create production deployment directory at /opt/pharmaflow
mkdir -p /opt/pharmaflow/nginx
mkdir -p /opt/pharmaflow/monitoring/prometheus
mkdir -p /opt/pharmaflow/monitoring/grafana/provisioning/datasources
mkdir -p /opt/pharmaflow/monitoring/grafana/provisioning/dashboards
mkdir -p /opt/pharmaflow/monitoring/grafana/dashboards
mkdir -p /opt/pharmaflow/backups
mkdir -p /opt/pharmaflow/scripts
chown -R ubuntu:ubuntu /opt/pharmaflow
chmod -R 755 /opt/pharmaflow

# 7. Configure Docker daemon log rotation to prevent disk exhaustion
cat << 'DOCKER_DAEMON' > /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "20m",
    "max-file": "3"
  }
}
DOCKER_DAEMON
systemctl restart docker

echo "PharmaFlow Host Initialization Complete!" > /opt/pharmaflow/init_status.txt
