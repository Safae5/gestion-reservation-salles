pipeline {
    agent any

    environment {
        REGISTRY = "localhost:5000"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'composer install --no-interaction --prefer-dist'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Run Backend Tests') {
            steps {
                dir('backend') {
                    sh 'php artisan test || true'
                }
            }
        }

        stage('DB Migration (Flyway)') {
            steps {
                sh 'docker compose run --rm flyway'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker build -t $REGISTRY/truckfleet-backend:latest ./backend'
                sh 'docker build -t $REGISTRY/truckfleet-frontend:latest ./frontend'
            }
        }

        stage('Push to Registry') {
            steps {
                sh 'docker push $REGISTRY/truckfleet-backend:latest'
                sh 'docker push $REGISTRY/truckfleet-frontend:latest'
            }
        }
    }

    post {
        success {
            echo 'Pipeline terminé avec succès.'
        }
        failure {
            echo 'Le pipeline a échoué — vérifier les logs ci-dessus.'
        }
    }
}