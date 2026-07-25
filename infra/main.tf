# Terraform - provisionnement de l'environnement Gestion Reservation Salles
# Utilise le provider "docker" pour rester executable sans compte cloud.

terraform {
  required_version = ">= 1.9"
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

resource "docker_network" "reservation_net" {
  name = "reservation-net-tf"
}

resource "docker_volume" "mysql_data" {
  name = "reservation-mysql-data-tf"
}

resource "docker_image" "mysql" {
  name = "mysql:8.0"
}

resource "docker_container" "mysql_db" {
  name  = "reservation-mysql-tf"
  image = docker_image.mysql.image_id

  networks_advanced {
    name = docker_network.reservation_net.name
  }

  env = [
    "MYSQL_DATABASE=reservation_salles",
    "MYSQL_USER=reservation",
    "MYSQL_PASSWORD=reservation",
    "MYSQL_ROOT_PASSWORD=rootpass",
  ]

  ports {
    internal = 3306
    external = 3311
  }

  volumes {
    volume_name    = docker_volume.mysql_data.name
    container_path = "/var/lib/mysql"
  }
}

output "network_name" {
  value = docker_network.reservation_net.name
}

output "mysql_container_name" {
  value = docker_container.mysql_db.name
}
